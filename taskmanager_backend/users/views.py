from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from datetime import datetime
from .models import Task
from .serializers import TaskSerializer, UserSerializer
from django.contrib.auth.models import User

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return JsonResponse({'csrfToken': get_token(request)})

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        try:
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Registration successful"
                }, status=status.HTTP_201_CREATED)
            return Response({
                "message": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Registration error:", str(e))
            return Response({
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                "message": "Please provide both username and password"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        user = authenticate(request, username=username, password=password)
        if user is not None:
            return Response({
                "message": "Login successful",
                "username": user.username
            })
        return Response({
            "message": "Invalid credentials"
        }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({
            "message": "Successfully logged out"
        })

class TaskView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            username = request.GET.get('username')
            if not username:
                return Response({
                    "message": "Username is required",
                    "tasks": []
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(username=username)
                tasks = Task.objects.filter(user=user).order_by('-created_at')
                serializer = TaskSerializer(tasks, many=True)
                return Response({
                    "message": "Tasks retrieved successfully",
                    "tasks": serializer.data
                })
            except User.DoesNotExist:
                print(f"User not found: {username}")  # Debug log
                return Response({
                    "message": "User not found",
                    "tasks": []
                }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print(f"Error fetching tasks: {str(e)}")  # Debug log
            return Response({
                "message": f"Error fetching tasks: {str(e)}",
                "tasks": []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            data = request.data.copy()
            
            # Get the username from the request data
            username = data.get('username')
            if not username:
                return Response({
                    "message": "Username is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get the user by username
            from django.contrib.auth.models import User
            try:
                user = User.objects.get(username=username)
                data['user'] = user.id
            except User.DoesNotExist:
                return Response({
                    "message": "User not found"
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = TaskSerializer(data=data)
            if serializer.is_valid():
                task = serializer.save(user=user)
                return Response({
                    "message": "Task created successfully",
                    "task": TaskSerializer(task).data
                }, status=status.HTTP_201_CREATED)
            return Response({
                "message": "Invalid task data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Error creating task:", str(e))
            return Response({
                "message": f"Error creating task: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, pk=None):
        try:
            if not pk:
                return Response({
                    "message": "Task ID is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get email from request data
            email = request.data.get('email')
            if not email:
                return Response({
                    "message": "Email is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Extract username from email
            username = email.split('@')[0]

            try:
                user = User.objects.get(username=username)
                task = Task.objects.get(id=pk, user=user)
            except User.DoesNotExist:
                return Response({
                    "message": "User not found"
                }, status=status.HTTP_404_NOT_FOUND)
            except Task.DoesNotExist:
                return Response({
                    "message": "Task not found or you don't have permission to update it"
                }, status=status.HTTP_404_NOT_FOUND)

            data = request.data.copy()
            serializer = TaskSerializer(task, data=data, partial=True)
            if serializer.is_valid():
                updated_task = serializer.save()
                return Response({
                    "message": "Task updated successfully",
                    "task": TaskSerializer(updated_task).data
                })
            return Response({
                "message": "Invalid task data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print("Error updating task:", str(e))
            return Response({
                "message": f"Error updating task: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk=None):
        try:
            if not pk:
                return Response({
                    "message": "Task ID is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get username from email in query params
            username = request.GET.get('username')
            if not username:
                return Response({
                    "message": "Username is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(username=username)
                task = Task.objects.get(id=pk, user=user)
                task.delete()
                return Response({
                    "message": "Task deleted successfully"
                })
            except User.DoesNotExist:
                return Response({
                    "message": "User not found"
                }, status=status.HTTP_404_NOT_FOUND)
            except Task.DoesNotExist:
                return Response({
                    "message": "Task not found or you don't have permission to delete it"
                }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print("Error deleting task:", str(e))
            return Response({
                "message": f"Error deleting task: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)