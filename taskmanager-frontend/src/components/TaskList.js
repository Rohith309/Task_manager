import React from 'react';
import TaskCard from './TaskCard';
import './TaskList.css';

function TaskList({ tasks, onEdit, onDelete }) {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="no-tasks">
                <p>No tasks found. Create your first task!</p>
            </div>
        );
    }

    return (
        <div className="tasks-container">
            {tasks.map(task => (
                <TaskCard 
                    key={task.id} 
                    task={task} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                />
            ))}
        </div>
    );
}

export default TaskList;