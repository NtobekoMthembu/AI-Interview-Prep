from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models


class EmploymentStatus(models.TextChoices):
    STUDENT = 'student', 'Student'
    UNEMPLOYED = 'unemployed', 'Unemployed'
    EMPLOYED = 'employed', 'Employed'
    INTERNSHIP = 'internship', 'Internship'


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
    )

    highest_qualification = models.CharField(max_length=150, blank=True)
    institution = models.CharField(max_length=200, blank=True)
    field_of_study = models.CharField(max_length=150, blank=True)
    graduation_year = models.PositiveIntegerField(null=True, blank=True)

    years_of_experience = models.PositiveIntegerField(default=0)
    employment_status = models.CharField(
        max_length=20,
        choices=EmploymentStatus.choices,
        default=EmploymentStatus.STUDENT,
    )

    career_interests = ArrayField(models.CharField(max_length=100), default=list, blank=True)
    technical_skills = ArrayField(models.CharField(max_length=100), default=list, blank=True)
    soft_skills = ArrayField(models.CharField(max_length=100), default=list, blank=True)
    languages = ArrayField(models.CharField(max_length=50), default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Profile for {self.user.email}'
