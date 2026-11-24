from django.urls import path
from .views import resume_analyze, resume_extract_text, resume_list_create, resume_delete

urlpatterns = [
    path('', resume_list_create, name='resume-list-create'),
    path('<uuid:resume_id>/', resume_delete, name='resume-delete'),
    path('<uuid:resume_id>/extract-text/', resume_extract_text, name='resume-extract-text'),
    path('<uuid:resume_id>/analyze/', resume_analyze, name='resume-analyze'),
]