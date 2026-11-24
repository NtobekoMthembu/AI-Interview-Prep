from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'highest_qualification', 'institution', 'field_of_study', 'graduation_year',
            'years_of_experience', 'employment_status',
            'career_interests', 'technical_skills', 'soft_skills', 'languages',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']