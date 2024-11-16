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
            login(request, user)
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
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        try:
            if pk:
                task = Task.objects.get(id=pk, user=request.user)
                serializer = TaskSerializer(task)
                return Response({
                    "message": "Task retrieved successfully",
                    "task": serializer.data
                })
            else:
                tasks = Task.objects.filter(user=request.user).order_by('-created_at')
                serializer = TaskSerializer(tasks, many=True)
                return Response({
                    "message": "Tasks retrieved successfully",
                    "tasks": serializer.data
                })
        except Task.DoesNotExist:
            return Response({
                "message": "Task not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("Error fetching tasks:", str(e))
            return Response({
                "message": f"Error fetching tasks: {str(e)}",
                "tasks": []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            print("Received data:", request.data)
            data = request.data.copy()
            
            try:
                deadline_str = data.get('deadline')
                if not deadline_str:
                    return Response({
                        "message": "Deadline is required",
                        "errors": {"deadline": ["This field is required."]}
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                deadline_date = datetime.strptime(deadline_str, '%Y-%m-%d').date()
                data['deadline'] = deadline_date
            except ValueError:
                return Response({
                    "message": "Invalid deadline format",
                    "errors": {"deadline": ["Use format YYYY-MM-DD"]}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            data['user'] = request.user.id
            
            serializer = TaskSerializer(data=data)
            if serializer.is_valid():
                task = serializer.save(user=request.user)
                return Response({
                    "message": "Task created successfully",
                    "task": TaskSerializer(task).data
                }, status=status.HTTP_201_CREATED)
            else:
                print("Validation errors:", serializer.errors)
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

            task = Task.objects.get(id=pk, user=request.user)
            data = request.data.copy()

            try:
                deadline_str = data.get('deadline')
                if deadline_str:
                    deadline_date = datetime.strptime(deadline_str, '%Y-%m-%d').date()
                    data['deadline'] = deadline_date
            except ValueError:
                return Response({
                    "message": "Invalid deadline format",
                    "errors": {"deadline": ["Use format YYYY-MM-DD"]}
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = TaskSerializer(task, data=data, partial=True)
            if serializer.is_valid():
                updated_task = serializer.save()
                return Response({
                    "message": "Task updated successfully",
                    "task": TaskSerializer(updated_task).data
                })
            else:
                return Response({
                    "message": "Invalid task data",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Task.DoesNotExist:
            return Response({
                "message": "Task not found or you don't have permission to update it"
            }, status=status.HTTP_404_NOT_FOUND)
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

            task = Task.objects.get(id=pk, user=request.user)
            task.delete()
            
            return Response({
                "message": "Task deleted successfully"
            })
            
        except Task.DoesNotExist:
            return Response({
                "message": "Task not found or you don't have permission to delete it"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("Error deleting task:", str(e))
            return Response({
                "message": f"Error deleting task: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)