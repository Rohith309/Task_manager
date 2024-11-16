from django.contrib.auth.models import User
from rest_framework import serializers
from datetime import datetime
from .models import Task

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('username', 'password', 'confirm_password', 'first_name')
        extra_kwargs = {
            'first_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                password=validated_data['password'],
                first_name=validated_data.get('first_name', '')
            )
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create user: {str(e)}")

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'priority', 'status', 'deadline', 'created_at', 'user']
        read_only_fields = ['created_at', 'user']

    def validate(self, data):
        # Validate priority
        if data.get('priority') not in ['low', 'medium', 'high']:
            raise serializers.ValidationError({"priority": "Invalid priority value"})
        
        # Validate status
        if data.get('status') not in ['yet-to-start', 'in-progress', 'completed', 'hold']:
            raise serializers.ValidationError({"status": "Invalid status value"})
        
        # Validate deadline
        if data.get('deadline'):
            if data['deadline'] < datetime.now().date():
                raise serializers.ValidationError({"deadline": "Deadline cannot be in the past"})
        
        return data

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long")
        return value.strip()

    def validate_description(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long")
        return value.strip()