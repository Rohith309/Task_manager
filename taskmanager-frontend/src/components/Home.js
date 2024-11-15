import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
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
            const response = await axios.get('tasks/');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        try {
            await axios.get('csrf/');
            
            const formattedTask = {
                ...newTask,
                deadline: newTask.deadline
            };
            
            const response = await axios.post('tasks/', formattedTask);
            
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
            setError(
                error.response?.data?.message || 
                error.response?.data?.errors || 
                'Failed to create task. Please try again.'
            );
        }
    };

    const handleDelete = async (taskId) => {
        try {
            const response = await axios.delete(`tasks/${taskId}/`);
            if (response.status === 200) {
                setTasks(tasks.filter(task => task.id !== taskId));
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            setError(
                error.response?.data?.message || 
                'Failed to delete task. Please try again.'
            );
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('logout/');
            localStorage.removeItem('username');
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('username');
            navigate('/', { replace: true });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="home-container">
            <div className="header">
                <h1>Task Manager</h1>
                <div className="header-buttons">
                    <button onClick={() => setShowAddForm(true)}>Add New Task</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="add-task-form">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="title"
                            placeholder="Task Title"
                            value={newTask.title}
                            onChange={handleInputChange}
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="Task Description"
                            value={newTask.description}
                            onChange={handleInputChange}
                            required
                        />
                        <select
                            name="priority"
                            value={newTask.priority}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <select
                            name="status"
                            value={newTask.status}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="yet-to-start">Yet to Start</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="hold">On Hold</option>
                        </select>
                        <input
                            type="date"
                            name="deadline"
                            value={newTask.deadline}
                            onChange={handleInputChange}
                            required
                        />
                        <div className="form-buttons">
                            <button type="submit">Create Task</button>
                            <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="tasks-container">
                {tasks && tasks.length > 0 ? (
                    tasks.map(task => (
                        <div key={task.id} className="task-card">
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <div className="task-details">
                                <span className={`priority ${task.priority}`}>
                                    Priority: {task.priority}
                                </span>
                                <span className={`status ${task.status}`}>
                                    Status: {task.status}
                                </span>
                                <span className="deadline">
                                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                                </span>
                            </div>
                            <button 
                                className="delete-button"
                                onClick={() => handleDelete(task.id)}
                            >
                                Delete Task
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="no-tasks">
                        <p>No tasks found. Create your first task!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;