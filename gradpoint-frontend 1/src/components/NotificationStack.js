const NotificationStack = ({ notifications = [] }) => (
  <div data-testid="notification-stack" className="notification-stack">
    {notifications.map((n) => (
      <div
        key={n.id}
        className={`notification ${n.type || 'info'}`}
        role={n.type === 'error' ? 'alert' : 'status'}
      >
        {n.message}
      </div>
    ))}
  </div>
);

export default NotificationStack;
