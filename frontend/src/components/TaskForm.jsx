import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SubtaskForm from './SubtaskForm';
import './TaskForm.css';

const TaskForm = ({ task, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    request_date: null,
    status: 'Pending',
    task_type: 'CR',
    delivered_date: null,
    subtasks: [],
  });
  
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editingSubtaskIndex, setEditingSubtaskIndex] = useState(null);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        project_name: task.project_name || '',
        description: task.description || '',
        request_date: task.request_date ? new Date(task.request_date) : null,
        status: task.status || 'Pending',
        task_type: task.task_type || 'CR',
        delivered_date: task.delivered_date ? new Date(task.delivered_date) : null,
        // Ensure subtasks is always an array (backend should normalize, but be defensive in UI).
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleAddSubtask = () => {
    setEditingSubtask(null);
    setEditingSubtaskIndex(null);
    setShowSubtaskForm(true);
  };

  const handleEditSubtask = (subtask, index) => {
    setEditingSubtask(subtask);
    setEditingSubtaskIndex(index);
    setShowSubtaskForm(true);
  };

  const handleSaveSubtask = (subtaskData) => {
    if (editingSubtaskIndex !== null) {
      // Update existing subtask by index (works even for legacy subtasks without id)
      setFormData(prev => ({
        ...prev,
        subtasks: prev.subtasks.map((st, idx) =>
          idx === editingSubtaskIndex
            ? { ...subtaskData, id: subtaskData.id || st.id || Date.now() }
            : st
        )
      }));
    } else {
      // Add new subtask
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, { ...subtaskData, id: subtaskData.id || Date.now() }]
      }));
    }
    setShowSubtaskForm(false);
    setEditingSubtask(null);
    setEditingSubtaskIndex(null);
  };

  const handleDeleteSubtask = (indexToDelete) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, idx) => idx !== indexToDelete)
    }));
    setShowSubtaskForm(false);
    setEditingSubtask(null);
    setEditingSubtaskIndex(null);
  };

  const handleCancelSubtask = () => {
    setShowSubtaskForm(false);
    setEditingSubtask(null);
    setEditingSubtaskIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Project name is required';
    }
    if (!formData.task_type) {
      newErrors.task_type = 'Task type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = {
      ...formData,
      request_date: formData.request_date ? formData.request_date.toISOString().split('T')[0] : null,
      delivered_date: formData.delivered_date ? formData.delivered_date.toISOString().split('T')[0] : null,
    };

    onSave(submitData);
  };

  return (
    <div className="task-form-container">
      <form onSubmit={handleSubmit} className="task-form">
        <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>

        <div className="form-group">
          <label htmlFor="project_name">Project Name *</label>
          <input
            type="text"
            id="project_name"
            name="project_name"
            value={formData.project_name}
            onChange={handleChange}
            required
          />
          {errors.project_name && <div className="error-message">{errors.project_name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            placeholder="Enter task description..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="request_date">Request Date</label>
            <DatePicker
              selected={formData.request_date}
              onChange={(date) => handleDateChange('request_date', date)}
              dateFormat="yyyy-MM-dd"
              className="date-picker-input"
              placeholderText="Select request date"
            />
          </div>

          <div className="form-group">
            <label htmlFor="delivered_date">Delivered Date</label>
            <DatePicker
              selected={formData.delivered_date}
              onChange={(date) => handleDateChange('delivered_date', date)}
              dateFormat="yyyy-MM-dd"
              className="date-picker-input"
              placeholderText="Select delivered date"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task_type">Task Type *</label>
            <select
              id="task_type"
              name="task_type"
              value={formData.task_type}
              onChange={handleChange}
              required
            >
              <option value="CR">CR</option>
              <option value="Data request">Data request</option>
              <option value="config">config</option>
            </select>
            {errors.task_type && <div className="error-message">{errors.task_type}</div>}
          </div>
        </div>

        <div className="form-group">
          <div className="subtasks-section-header">
            <label>Subtasks</label>
            {!showSubtaskForm && (
              <button
                type="button"
                onClick={handleAddSubtask}
                className="btn btn-secondary btn-sm"
              >
                + Add Subtask
              </button>
            )}
          </div>

          {showSubtaskForm && (
            <SubtaskForm
              subtask={editingSubtask}
              onSave={handleSaveSubtask}
              onCancel={handleCancelSubtask}
              onDelete={() => {
                if (editingSubtaskIndex !== null) {
                  handleDeleteSubtask(editingSubtaskIndex);
                }
              }}
            />
          )}

          {formData.subtasks.length > 0 && (
            <div className="subtasks-list">
              {formData.subtasks.map((subtask, index) => (
                <div key={subtask.id || `subtask-${index}`} className="subtask-preview">
                  <div className="subtask-preview-content">
                    <strong>{subtask.name || 'Unnamed Subtask'}</strong>
                    {subtask.description && (
                      <p className="subtask-preview-description">{subtask.description}</p>
                    )}
                    <div className="subtask-preview-badges">
                      <span className="badge status-badge" style={{ 
                        backgroundColor: subtask.status === 'Completed' ? '#00875A' : 
                                         subtask.status === 'In Progress' ? '#0052CC' : '#6B778C' 
                      }}>
                        {subtask.status || 'Pending'}
                      </span>
                      <span className="badge type-badge" style={{ 
                        backgroundColor: subtask.task_type === 'CR' ? '#0052CC' : 
                                         subtask.task_type === 'Data request' ? '#00B8D9' : '#5243AA' 
                      }}>
                        {subtask.task_type || 'CR'}
                      </span>
                    </div>
                  </div>
                  <div className="subtask-preview-actions">
                    <button
                      type="button"
                      onClick={() => handleEditSubtask(subtask, index)}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(index)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {task ? 'Update Task' : 'Create Task'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;

