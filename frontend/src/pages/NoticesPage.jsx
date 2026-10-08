import React from 'react';

export default function NoticesPage({ notices, user, onDeleteNotice, onNavigateCreate }) {
  const getBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'exam':
        return 'badge-exam';
      case 'event':
        return 'badge-event';
      case 'academic':
        return 'badge-academic';
      default:
        return 'badge-general';
    }
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Announcements</h1>
          <p className="page-subtitle">Real-time updates, academic notices, and student events</p>
        </div>
        <div>
          <button
            id="post-notice-nav-btn"
            className="btn-primary"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={onNavigateCreate}
          >
            + Post New Notice
          </button>
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="empty-state">
          <p>No notices have been published yet.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Be the first to post an announcement!</p>
        </div>
      ) : (
        <div className="notices-grid">
          {notices.map((notice) => {
            const canDelete =
              user &&
              (user.role === 'Staff' ||
                user.phone === notice.authorPhone ||
                user.name === notice.authorName);

            return (
              <div key={notice.id} className="notice-card" id={`notice-${notice.id}`}>
                <div className="notice-header">
                  <span className={`badge ${getBadgeClass(notice.category)}`}>
                    {notice.category || 'General'}
                  </span>
                  {canDelete && (
                    <button
                      className="btn-delete"
                      title="Delete notice"
                      onClick={() => onDeleteNotice(notice.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <h3 className="notice-title">{notice.title}</h3>
                <p className="notice-content">{notice.content}</p>

                <div className="notice-meta">
                  <div className="meta-author">
                    <span>📢 Posted by <strong>{notice.authorName}</strong></span>
                  </div>
                  <div>{formatDate(notice.createdAt)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
