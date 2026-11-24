from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.ai.services.ai_service import AIService, AIServiceError
from apps.ai.serializers import JobRecommendationResultSerializer
from apps.resumes.models import ResumeAnalysis

from .models import JobRecommendation
from .serializers import JobRecommendationSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def career_recommendations_list(request):
    recommendations = JobRecommendation.objects.filter(user=request.user)
    return Response(JobRecommendationSerializer(recommendations, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def career_recommendations_generate(request):
    analysis = ResumeAnalysis.objects.filter(resume__user=request.user).order_by('-created_at').first()
    if not analysis:
        return Response(
            {'detail': 'Upload and analyse a CV before generating career recommendations.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Cost control, same principle as resume analysis: reuse existing
    # recommendations for this exact analysis instead of calling the AI again.
    existing = JobRecommendation.objects.filter(based_on_analysis=analysis)
    if existing.exists():
        return Response(JobRecommendationSerializer(existing, many=True).data)

    profile = getattr(request.user, 'profile', None)

    candidate_context = {
        'qualifications': analysis.qualifications,
        'field_of_study': profile.field_of_study if profile else '',
        'technical_skills': analysis.technical_skills,
        'soft_skills': analysis.soft_skills,
        'experience_summary': analysis.experience_summary,
        'experience_level': analysis.experience_level,
        'years_of_experience': profile.years_of_experience if profile else 0,
        'career_interests': profile.career_interests if profile else [],
        'country': request.user.country,
        'region': request.user.region,
    }

    try:
        raw_result = AIService().recommend_jobs(candidate_context)
    except AIServiceError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

    result_serializer = JobRecommendationResultSerializer(data=raw_result)
    result_serializer.is_valid(raise_exception=True)
    items = result_serializer.validated_data['recommendations']

    created = [
        JobRecommendation.objects.create(
            user=request.user,
            based_on_analysis=analysis,
            **item,
        )
        for item in items
    ]

    return Response(
        JobRecommendationSerializer(created, many=True).data,
        status=status.HTTP_201_CREATED,
    )
