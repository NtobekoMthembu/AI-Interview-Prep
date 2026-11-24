from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'highest_qualification', 'field_of_study', 'employment_status']
    search_fields = ['user__email', 'field_of_study']