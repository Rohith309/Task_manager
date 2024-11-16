import React from 'react';
import './TaskCard.css';

function TaskCard({ task, onEdit, onDelete }) {
    return (
        <div className="task-card">
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
            <div className="task-buttons">
                <button 
                    className="edit-button"
                    onClick={() => onEdit(task)}
                >
                    Edit Task
                </button>
                <button 
                    className="delete-button"
                    onClick={() => onDelete(task.id)}
                >
                    Delete Task
                </button>
            </div>
        </div>
    );
}

export default TaskCard;