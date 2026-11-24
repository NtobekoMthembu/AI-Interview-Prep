from django.urls import path
from .views import profile_detail

urlpatterns = [
    path('', profile_detail, name='profile-detail'),
]