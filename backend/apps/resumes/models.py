import uuid
from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models


def resume_upload_path(instance, filename):
    # Store under media/resumes/<user-id>/<uuid>_<original-filename>
    # so two users' files can never collide, and a user can't guess
    # or access another user's file path.
    ext = filename.split('.')[-1]
    return f'resumes/{instance.user_id}/{uuid.uuid4()}.{ext}'


class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resumes',
    )

    file = models.FileField(
        upload_to=resume_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'docx'])],
    )
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text='Size in bytes')

    created_at = models.DateTimeField(auto_now_add=True)
    extracted_text = models.TextField(blank=True)
    text_extracted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.original_filename} ({self.user.email})'

class ResumeAnalysis(models.Model):
    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name='analysis',
    )

    qualifications = models.JSONField(default=list)
    technical_skills = models.JSONField(default=list)
    soft_skills = models.JSONField(default=list)
    experience_summary = models.TextField(blank=True)
    potential_job_roles = models.JSONField(default=list)
    experience_level = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Analysis for {self.resume.original_filename}'