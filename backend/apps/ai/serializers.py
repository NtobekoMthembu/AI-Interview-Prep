from rest_framework import serializers

VALID_EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior']


class ResumeAnalysisResultSerializer(serializers.Serializer):
    qualifications = serializers.ListField(child=serializers.CharField(), default=list)
    technical_skills = serializers.ListField(child=serializers.CharField(), default=list)
    soft_skills = serializers.ListField(child=serializers.CharField(), default=list)
    experience_summary = serializers.CharField(allow_blank=True, default='')
    potential_job_roles = serializers.ListField(child=serializers.CharField(), default=list)
    experience_level = serializers.ChoiceField(choices=VALID_EXPERIENCE_LEVELS, default='entry')

class JobRecommendationItemSerializer(serializers.Serializer):
    job_title = serializers.CharField()
    match_percentage = serializers.IntegerField(min_value=0, max_value=100)
    why_you_match = serializers.CharField()
    relevant_skills = serializers.ListField(child=serializers.CharField(), default=list)
    missing_skills = serializers.ListField(child=serializers.CharField(), default=list)
    typical_responsibilities = serializers.ListField(child=serializers.CharField(), default=list)
    experience_level = serializers.ChoiceField(choices=VALID_EXPERIENCE_LEVELS)


class JobRecommendationResultSerializer(serializers.Serializer):
    recommendations = JobRecommendationItemSerializer(many=True)