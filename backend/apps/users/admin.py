from django.contrib import admin
from .models import User

# Register your models here.
@admin.register(User)
class userregistration(admin.ModelAdmin):
    list_display = ['first_name','last_name','email','country','region']
    
