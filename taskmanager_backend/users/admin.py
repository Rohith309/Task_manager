from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'priority', 'status', 'deadline', 'created_at')
    list_filter = ('priority', 'status', 'user')
    search_fields = ('title', 'description')
    date_hierarchy = 'deadline'