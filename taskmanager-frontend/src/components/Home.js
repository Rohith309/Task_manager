import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import Dashboard from './Dashboard';
import './Home.css';

function Home() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'low',
        status: 'yet-to-start',
        deadline: ''
    });
    
    const navigate = useNavigate();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('/tasks/');
            setTasks(response.data.tasks || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Failed to fetch tasks');
            setLoading(false);
            if (error.response?.status === 401) {
                navigate('/');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingTask(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!newTask.title.trim()) {
            setError('Title is required');
            return;
        }
        if (!newTask.description.trim()) {
            setError('Description is required');
            return;
        }
        if (!newTask.deadline) {
            setError('Deadline is required');
            return;
        }

        try {
            const deadlineDate = new Date(newTask.deadline);
            if (isNaN(deadlineDate.getTime())) {
                setError('Invalid deadline date');
                return;
            }

            const formattedTask = {
                title: newTask.title.trim(),
                description: newTask.description.trim(),
                priority: newTask.priority,
                status: newTask.status,
                deadline: deadlineDate.toISOString().split('T')[0]
            };

            const response = await axios.post('/tasks/', formattedTask);
            
            if (response.status === 201) {
                setTasks(prev => [...prev, response.data.task]);
                setNewTask({
                    title: '',
                    description: '',
                    priority: 'low',
                    status: 'yet-to-start',
                    deadline: ''
                });
                setShowAddForm(false);
            }
        } catch (error) {
            console.error('Error creating task:', error);
            handleApiError(error, 'Failed to create task');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);

        if (!editingTask.title.trim()) {
            setError('Title is required');
            return;
        }
        if (!editingTask.description.trim()) {
            setError('Description is required');
            return;
        }
        if (!editingTask.deadline) {
            setError('Deadline is required');
            return;
        }

        try {
            const deadlineDate = new Date(editingTask.deadline);
            if (isNaN(deadlineDate.getTime())) {
                setError('Invalid deadline date');
                return;
            }

            const formattedTask = {
                title: editingTask.title.trim(),
                description: editingTask.description.trim(),
                priority: editingTask.priority,
                status: editingTask.status,
                deadline: deadlineDate.toISOString().split('T')[0]
            };

            const response = await axios.put(`/tasks/${editingTask.id}/`, formattedTask);
            
            if (response.status === 200) {
                setTasks(tasks.map(task => 
                    task.id === editingTask.id ? response.data.task : task
                ));
                setEditingTask(null);
            }
        } catch (error) {
            console.error('Error updating task:', error);
            handleApiError(error, 'Failed to update task');
        }
    };

    const handleDelete = async (taskId) => {
        try {
            const response = await axios.delete(`/tasks/${taskId}/`);
            if (response.status === 200) {
                setTasks(tasks.filter(task => task.id !== taskId));
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            handleApiError(error, 'Failed to delete task');
        }
    };

    const handleEdit = (task) => {
        setEditingTask({
            ...task,
            deadline: task.deadline.split('T')[0]
        });
    };

    const handleLogout = async () => {
        try {
            await axios.post('/logout/');
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
            setError('Failed to logout');
        }
    };

    const handleApiError = (error, defaultMessage) => {
        let errorMessage = defaultMessage;
        
        if (error.response?.data) {
            if (error.response.data.errors) {
                const errors = error.response.data.errors;
                errorMessage = Object.entries(errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('; ');
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        }
        
        setError(errorMessage);
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }


    return (
        <div className="home-container">
            {error && <div className="error-message">{error}</div>}
            
            <div className="header">
                <h1>Task Manager</h1>
                <div className="header-buttons">
                    <button onClick={() => setShowAddForm(true)}>Add New Task</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <Dashboard tasks={tasks} />

            {showAddForm && (
                <TaskForm 
                    task={newTask}
                    onSubmit={handleSubmit}
                    onChange={handleInputChange}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            <TaskList 
                tasks={tasks}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {editingTask && (
                <div className="edit-overlay">
                    <TaskForm 
                        task={editingTask}
                        onSubmit={handleUpdate}
                        onChange={handleEditInputChange}
                        onCancel={() => setEditingTask(null)}
                        isEditing={true}
                    />
                </div>
            )}
        </div>
    );
}

export default Home;