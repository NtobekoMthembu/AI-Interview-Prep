from django.urls import path
from .views import logout, register,me

urlpatterns = [
    path('register/', register, name='register'),
    path('me/', me, name='me'),
    path('logout/', logout, name='logout'),
]