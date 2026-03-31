import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './SubtaskForm.css';

const SubtaskForm = ({ subtask, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    name: subtask?.name || '',
    description: subtask?.description || '',
    request_date: subtask?.request_date ? new Date(subtask.request_date) : null,
    status: subtask?.status || 'Pending',
    task_type: subtask?.task_type || 'CR',
    delivered_date: subtask?.delivered_date ? new Date(subtask.delivered_date) : null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      id: subtask?.id || Date.now(),
      request_date: formData.request_date ? formData.request_date.toISOString().split('T')[0] : null,
      delivered_date: formData.delivered_date ? formData.delivered_date.toISOString().split('T')[0] : null,
    };
    onSave(submitData);
  };

  return (
    <div className="subtask-form-wrapper">
      <div className="subtask-form">
        <div className="subtask-form-header">
          <h4>{subtask ? 'Edit Subtask' : 'New Subtask'}</h4>
          <div className="subtask-form-actions">
            {subtask && (
              <button
                type="button"
                onClick={() => onDelete(subtask.id)}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            )}
            <button type="button" onClick={onCancel} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} className="btn btn-primary btn-sm">
              {subtask ? 'Update' : 'Add'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="subtask_name">Subtask Name *</label>
          <input
            type="text"
            id="subtask_name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter subtask name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subtask_description">Description</label>
          <textarea
            id="subtask_description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Enter subtask description..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subtask_request_date">Request Date</label>
            <DatePicker
              selected={formData.request_date}
              onChange={(date) => handleDateChange('request_date', date)}
              dateFormat="yyyy-MM-dd"
              className="date-picker-input"
              placeholderText="Select request date"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subtask_delivered_date">Delivered Date</label>
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
            <label htmlFor="subtask_status">Status</label>
            <select
              id="subtask_status"
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
            <label htmlFor="subtask_type">Task Type</label>
            <select
              id="subtask_type"
              name="task_type"
              value={formData.task_type}
              onChange={handleChange}
            >
              <option value="CR">CR</option>
              <option value="Data request">Data request</option>
              <option value="config">config</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtaskForm;


