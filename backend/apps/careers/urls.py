from django.urls import path
from .views import career_recommendations_list, career_recommendations_generate

urlpatterns = [
    path('recommendations/', career_recommendations_list, name='career-recommendations-list'),
    path('analyze/', career_recommendations_generate, name='career-recommendations-generate'),
]