import React from 'react';
import './Dashboard.css';

function Dashboard({ tasks }) {
    // Filter high priority tasks
    const highPriorityTasks = tasks.filter(task => task.priority === 'high');
    
    // Filter tasks by deadline (next 3 days)
    const nearDeadlineTasks = tasks.filter(task => {
        const deadline = new Date(task.deadline);
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);
        return deadline <= threeDaysFromNow && deadline >= today;
    });

    // Get task statistics
    const taskStats = {
        total: tasks.length,
        completed: tasks.filter(task => task.status === 'completed').length,
        inProgress: tasks.filter(task => task.status === 'in-progress').length,
        onHold: tasks.filter(task => task.status === 'hold').length,
        yetToStart: tasks.filter(task => task.status === 'yet-to-start').length
    };

    return (
        <div className="dashboard">
            <div className="stats-container">
                <div className="stat-card total">
                    <h3>Total Tasks</h3>
                    <p>{taskStats.total}</p>
                </div>
                <div className="stat-card completed">
                    <h3>Completed</h3>
                    <p>{taskStats.completed}</p>
                </div>
                <div className="stat-card in-progress">
                    <h3>In Progress</h3>
                    <p>{taskStats.inProgress}</p>
                </div>
                <div className="stat-card on-hold">
                    <h3>On Hold</h3>
                    <p>{taskStats.onHold}</p>
                </div>
            </div>

            <div className="priority-deadline-container">
                <div className="dashboard-section">
                    <h2>High Priority Tasks</h2>
                    <div className="dashboard-tasks">
                        {highPriorityTasks.map(task => (
                            <div key={task.id} className="dashboard-task-card">
                                <h3>{task.title}</h3>
                                <div className="task-info">
                                    <span className={`status ${task.status}`}>
                                        {task.status}
                                    </span>
                                    <span className="deadline">
                                        Due: {new Date(task.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {highPriorityTasks.length === 0 && (
                            <p className="no-tasks-message">No high priority tasks</p>
                        )}
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Upcoming Deadlines</h2>
                    <div className="dashboard-tasks">
                        {nearDeadlineTasks.map(task => (
                            <div key={task.id} className="dashboard-task-card">
                                <h3>{task.title}</h3>
                                <div className="task-info">
                                    <span className={`priority ${task.priority}`}>
                                        {task.priority}
                                    </span>
                                    <span className="deadline">
                                        Due: {new Date(task.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {nearDeadlineTasks.length === 0 && (
                            <p className="no-tasks-message">No upcoming deadlines</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;