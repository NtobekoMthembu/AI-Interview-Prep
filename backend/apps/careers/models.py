import uuid

from django.conf import settings
from django.db import models

from apps.resumes.models import ResumeAnalysis


class JobRecommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_recommendations',
    )
    # Tracks exactly which analysis these recommendations were generated
    # from — if the user uploads a new CV and re-analyzes, that's a new
    # ResumeAnalysis, and these old recommendations become historical
    # rather than silently wrong.
    based_on_analysis = models.ForeignKey(
        ResumeAnalysis,
        on_delete=models.CASCADE,
        related_name='job_recommendations',
    )

    job_title = models.CharField(max_length=150)
    match_percentage = models.PositiveIntegerField()
    why_you_match = models.TextField()
    relevant_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    typical_responsibilities = models.JSONField(default=list)
    experience_level = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-match_percentage']

    def __str__(self):
        return f'{self.job_title} ({self.match_percentage}%) — {self.user.email}'
