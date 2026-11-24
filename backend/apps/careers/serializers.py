from rest_framework import serializers
from .models import JobRecommendation


class JobRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRecommendation
        fields = [
            'id', 'job_title', 'match_percentage', 'why_you_match',
            'relevant_skills', 'missing_skills', 'typical_responsibilities',
            'experience_level', 'created_at',
        ]