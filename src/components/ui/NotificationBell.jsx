import Dropdown from "./Dropdown.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { useRouter } from "../../router/Router.jsx";
import { timeAgo } from "../../utils/format.js";

// Bell + dropdown list of persisted notifications for the signed-in user.
export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, clearMine } = useNotifications();
  const { navigate } = useRouter();

  return (
    <Dropdown
      label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
      triggerClassName="bell-btn"
      panelClassName="notif-panel"
      trigger={
        <>
          <span aria-hidden="true">🔔</span>
          {unreadCount > 0 && <span className="bell-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
        </>
      }
    >
      {(close) => (
        <div>
          <div className="notif-head">
            <strong>Notifications</strong>
            <div>
              <button className="link-btn" onClick={markAllRead} disabled={!unreadCount}>Mark all read</button>
              <button className="link-btn" onClick={clearMine} disabled={!notifications.length}>Clear</button>
            </div>
          </div>
          {notifications.length === 0 ? (
            <p className="notif-empty muted">You're all caught up.</p>
          ) : (
            <ul className="notif-list">
              {notifications.slice(0, 8).map((n) => (
                <li key={n.id}>
                  <button
                    className={`notif-item ${n.read ? "" : "unread"} notif-${n.type}`}
                    onClick={() => {
                      markRead(n.id);
                      close();
                      if (n.link) navigate(n.link);
                    }}
                  >
                    <span className="notif-msg">{n.message}</span>
                    <span className="notif-time">{timeAgo(n.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Dropdown>
  );
}
