from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Resume
from .serializers import ResumeUploadSerializer
from .services import ResumeParserService, ResumeParsingError

from apps.ai.services.ai_service import AIService, AIServiceError
from apps.ai.serializers import ResumeAnalysisResultSerializer

from .models import Resume, ResumeAnalysis
from .services import ResumeParserService, ResumeParsingError


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def resume_list_create(request):
    if request.method == 'GET':
        resumes = Resume.objects.filter(user=request.user)
        serializer = ResumeUploadSerializer(resumes, many=True)
        return Response(serializer.data)

    # POST — needs MultiPartParser since this is a file upload,
    # not JSON like every endpoint we've built so far.
    serializer = ResumeUploadSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    resume = serializer.save()
    return Response(ResumeUploadSerializer(resume).data, status=status.HTTP_201_CREATED)


resume_list_create.parser_classes = [MultiPartParser]


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def resume_delete(request, resume_id):
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    resume.file.delete(save=False)  # actually delete the file from disk, not just the DB row
    resume.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resume_extract_text(request, resume_id):
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    try:
        text = ResumeParserService.extract_and_store(resume)
    except ResumeParsingError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    return Response({
        'resume_id': str(resume.id),
        'extracted_text': text,
        'text_extracted_at': resume.text_extracted_at,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resume_analyze(request, resume_id):
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # Cost control: if this exact resume already has an analysis, reuse
    # it instead of calling the AI again. A new upload creates a new
    # Resume row, so this only ever skips genuinely redundant calls.
    existing = ResumeAnalysis.objects.filter(resume=resume).first()
    if existing:
        return Response(_serialize_analysis(existing))

    if not resume.extracted_text:
        try:
            ResumeParserService.extract_and_store(resume)
        except ResumeParsingError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    try:
        raw_result = AIService().analyze_resume(resume.extracted_text)
    except AIServiceError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

    # Validate the AI's response shape before it ever touches the database.
    result_serializer = ResumeAnalysisResultSerializer(data=raw_result)
    result_serializer.is_valid(raise_exception=True)
    validated = result_serializer.validated_data

    analysis = ResumeAnalysis.objects.create(resume=resume, **validated)
    return Response(_serialize_analysis(analysis), status=status.HTTP_201_CREATED)


def _serialize_analysis(analysis: ResumeAnalysis) -> dict:
    return {
        'qualifications': analysis.qualifications,
        'technical_skills': analysis.technical_skills,
        'soft_skills': analysis.soft_skills,
        'experience_summary': analysis.experience_summary,
        'potential_job_roles': analysis.potential_job_roles,
        'experience_level': analysis.experience_level,
        'created_at': analysis.created_at,
    }