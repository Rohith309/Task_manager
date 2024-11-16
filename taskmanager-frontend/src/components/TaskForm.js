import React from 'react';
import './TaskForm.css';

function TaskForm({ task, onSubmit, onChange, onCancel, isEditing = false }) {
    return (
        <div className={`task-form ${isEditing ? 'edit-form' : 'add-form'}`}>
            <form onSubmit={onSubmit}>
                <div className="form-field">
                    <input
                        type="text"
                        name="title"
                        placeholder="Task Title"
                        value={task.title}
                        onChange={onChange}
                        required
                    />
                </div>
                
                <div className="form-field">
                    <textarea
                        name="description"
                        placeholder="Task Description"
                        value={task.description}
                        onChange={onChange}
                        required
                    />
                </div>
                
                <div className="form-field">
                    <select
                        name="priority"
                        value={task.priority}
                        onChange={onChange}
                        required
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                
                <div className="form-field">
                    <select
                        name="status"
                        value={task.status}
                        onChange={onChange}
                        required
                    >
                        <option value="yet-to-start">Yet to Start</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="hold">On Hold</option>
                    </select>
                </div>
                
                <div className="form-field">
                    <input
                        type="date"
                        name="deadline"
                        value={task.deadline}
                        onChange={onChange}
                        required
                    />
                </div>
                
                <div className="form-buttons">
                    <button type="submit">
                        {isEditing ? 'Update Task' : 'Create Task'}
                    </button>
                    <button type="button" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TaskForm;