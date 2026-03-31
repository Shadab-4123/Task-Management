import { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import './TaskItem.css';

const TaskItem = ({ task, onEdit, onDelete }) => {
  const [expandedSubtasks, setExpandedSubtasks] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#00875A';
      case 'In Progress':
        return '#0052CC';
      case 'Pending':
        return '#6B778C';
      default:
        return '#6B778C';
    }
  };

  const getTaskTypeColor = (type) => {
    switch (type) {
      case 'CR':
        return '#0052CC';
      case 'Data request':
        return '#00B8D9';
      case 'config':
        return '#5243AA';
      default:
        return '#6B778C';
    }
  };

  const toggleSubtask = (subtaskId) => {
    setExpandedSubtasks(prev => ({
      ...prev,
      [subtaskId]: !prev[subtaskId]
    }));
  };

  const loadStatusHistory = async () => {
    if (showHistory && statusHistory.length === 0) {
      setLoadingHistory(true);
      try {
        const response = await tasksAPI.getHistory(task.id);
        setStatusHistory(response.history || []);
      } catch (err) {
        console.error('Failed to load status history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  useEffect(() => {
    if (showHistory) {
      loadStatusHistory();
    }
  }, [showHistory]);

  return (
    <div className="task-item">
      <div className="task-header">
        <div className="task-title-section">
          <h3>{task.project_name}</h3>
          <div className="task-badges">
            <span className="badge status-badge" style={{ backgroundColor: getStatusColor(task.status) }}>
              {task.status}
            </span>
            <span className="badge type-badge" style={{ backgroundColor: getTaskTypeColor(task.task_type) }}>
              {task.task_type}
            </span>
            {task.reopened_count > 0 && (
              <span className="badge reopened-badge" title={`Reopened ${task.reopened_count} time(s)`}>
                🔄 Reopened ({task.reopened_count})
              </span>
            )}
            {task.completion_count > 0 && (
              <span className="badge completion-badge" title={`Completed ${task.completion_count} time(s)`}>
                ✓ Completed ({task.completion_count}x)
              </span>
            )}
          </div>
        </div>
        <div className="task-actions">
          <button onClick={() => onEdit(task)} className="btn btn-secondary btn-sm">
            Edit
          </button>
          <button onClick={() => onDelete(task.id)} className="btn btn-danger btn-sm">
            Delete
          </button>
        </div>
      </div>

      {task.description && (
        <div className="task-description">
          <p>{task.description}</p>
        </div>
      )}

      <div className="task-details">
        <div className="detail-row">
          <span className="detail-label">Request Date:</span>
          <span className="detail-value">{formatDate(task.request_date)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Created Date:</span>
          <span className="detail-value">{formatDate(task.created_date)}</span>
        </div>
        {task.delivered_date && (
          <div className="detail-row">
            <span className="detail-label">Delivered Date:</span>
            <span className="detail-value">{formatDate(task.delivered_date)}</span>
          </div>
        )}
        {task.first_completed_date && (
          <div className="detail-row">
            <span className="detail-label">First Completed:</span>
            <span className="detail-value">{formatDate(task.first_completed_date)}</span>
          </div>
        )}
        {task.last_completed_date && task.completion_count > 1 && (
          <div className="detail-row">
            <span className="detail-label">Last Completed:</span>
            <span className="detail-value">{formatDate(task.last_completed_date)}</span>
          </div>
        )}
      </div>

      <div className="task-status-history">
        <div className="status-history-header" onClick={() => setShowHistory(!showHistory)}>
          <strong>Status History</strong>
          <span className="subtask-toggle-icon">
            {showHistory ? '▼' : '▶'}
          </span>
        </div>
        {showHistory && (
          <div className="status-history-content">
            {loadingHistory ? (
              <div className="status-history-loading">Loading history...</div>
            ) : statusHistory.length === 0 ? (
              <div className="status-history-empty">No status changes recorded</div>
            ) : (
              <div className="status-history-list">
                {statusHistory.map((entry, idx) => (
                  <div key={entry.id || idx} className="status-history-item">
                    <div className="status-change-row">
                      <div className="status-change">
                        <span className={`status-badge-old ${entry.old_status ? '' : 'no-status'}`}>
                          {entry.old_status || 'Created'}
                        </span>
                        <span className="status-arrow">→</span>
                        <span className={`status-badge-new status-${entry.new_status?.toLowerCase().replace(' ', '-')}`}>
                          {entry.new_status}
                        </span>
                      </div>
                      <div className="status-change-meta">
                        <span className="status-change-date">{formatDate(entry.changed_at)}</span>
                        {entry.changed_by_username && (
                          <span className="status-change-by">by {entry.changed_by_username}</span>
                        )}
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="status-notes">{entry.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
        <div className="task-subtasks">
          <div className="task-subtasks-header">
            <strong>Subtasks ({task.subtasks.length})</strong>
          </div>
          <div className="subtasks-container">
            {task.subtasks.map((subtask, index) => {
              const subtaskId = subtask.id || index;
              const subtaskName = typeof subtask === 'object' ? (subtask.name || 'Unnamed Subtask') : subtask;
              const isExpanded = expandedSubtasks[subtaskId];
              
              // Handle legacy subtask format (string or simple object)
              if (typeof subtask === 'string' || (typeof subtask === 'object' && !subtask.name && !subtask.description)) {
                return (
                  <div key={subtaskId} className="subtask-item-simple">
                    <span>{subtaskName}</span>
                  </div>
                );
              }

              // Full subtask structure
              return (
                <div key={subtaskId} className="subtask-item-full">
                  <div 
                    className="subtask-item-header"
                    onClick={() => toggleSubtask(subtaskId)}
                  >
                    <div className="subtask-item-title">
                      <span className="subtask-toggle-icon">{isExpanded ? '▼' : '▶'}</span>
                      <strong>{subtaskName}</strong>
                      <div className="subtask-item-badges">
                        <span className="badge status-badge" style={{ 
                          backgroundColor: getStatusColor(subtask.status || 'Pending') 
                        }}>
                          {subtask.status || 'Pending'}
                        </span>
                        <span className="badge type-badge" style={{ 
                          backgroundColor: getTaskTypeColor(subtask.task_type || 'CR') 
                        }}>
                          {subtask.task_type || 'CR'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="subtask-item-content">
                      {subtask.description && (
                        <div className="subtask-description">
                          <p>{subtask.description}</p>
                        </div>
                      )}
                      <div className="subtask-details">
                        {subtask.request_date && (
                          <div className="detail-row">
                            <span className="detail-label">Request Date:</span>
                            <span className="detail-value">{formatDate(subtask.request_date)}</span>
                          </div>
                        )}
                        {subtask.delivered_date && (
                          <div className="detail-row">
                            <span className="detail-label">Delivered Date:</span>
                            <span className="detail-value">{formatDate(subtask.delivered_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;

