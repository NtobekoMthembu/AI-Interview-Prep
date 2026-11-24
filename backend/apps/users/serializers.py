from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'country', 'region', 'password', 'password_confirm',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')  # only needed for the check above, not stored
        password = validated_data.pop('password')
        return User.objects.create_user(password=password, **validated_data)

class UserSerializer(serializers.ModelSerializer):
    """Read-only representation of a user. Never includes a password field —
    this is what we return when showing 'who am I', not when creating an account."""

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'country', 'region', 'created_at']
        read_only_fields = fields