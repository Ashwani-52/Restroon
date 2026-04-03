import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'STATS',  icon: '📊', path: '/dashboard/admin' },
  { label: 'CAFES',  icon: '🏪', path: '/dashboard/admin/cafes' },
  { label: 'USERS',  icon: '👥', path: '/dashboard/admin/users' },
  { label: 'ORDERS', icon: '📦', path: '/dashboard/admin/orders' },
];

const AdminLayout = ({ children, isMaintenance, onToggleMaintenance }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const Sidebar = () => (
    <aside style={{
      width: 220,
      minWidth: 220,
      height: '100vh',
      background: '#111111',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
      transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      borderRight: '1px solid rgba(255,215,0,0.1)',
    }}>
      {/* CLOSE BTN — mobile only */}
      {isMobile && (
        <button onClick={() => setSidebarOpen(false)} style={{
          position: 'absolute', top: 14, right: 14,
          background: 'rgba(255,255,255,0.08)', border: 'none',
          color: '#fff', width: 30, height: 30, borderRadius: 8,
          fontSize: 16, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>✕</button>
      )}

      {/* LOGO */}
      <div style={{ padding: '28px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>👑</span>
          <div>
            <div style={{
              color: '#FFD700', fontWeight: 900, fontSize: 13,
              letterSpacing: '0.18em', lineHeight: 1.2
            }}>SUPER ADMIN</div>
            <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.1em' }}>RESTROON</div>
          </div>
        </div>
        <div style={{
          height: 2, borderRadius: 2,
          background: 'linear-gradient(90deg, #FFD700, #FF6B00, #FF0000, transparent)'
        }} />
      </div>

      {/* NAV ITEMS */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {navItems.map(({ label, icon, path }) => {
          const active = location.pathname === path || (location.pathname === '/dashboard/admin' && path === '/dashboard/admin');
          return (
            <Link key={label} to={path} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
              fontWeight: 800, fontSize: 12, letterSpacing: '0.12em',
              background: active ? '#FFD700' : 'transparent',
              color: active ? '#000' : '#999',
              transition: 'all 0.15s',
              borderLeft: active ? '3px solid #FF6B00' : '3px solid transparent',
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* SITE STATUS */}
      <div style={{
        margin: '0 12px 10px', padding: 14,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 13 }}>🛰️</span>
          <span style={{ color: '#888', fontWeight: 800, fontSize: 10, letterSpacing: '0.14em' }}>
            SITE STATUS
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isMaintenance ? '#ef4444' : '#22c55e',
              boxShadow: `0 0 6px ${isMaintenance ? '#ef4444' : '#22c55e'}`
            }} />
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: isMaintenance ? '#ef4444' : '#22c55e'
            }}>
              {isMaintenance ? 'MAINTENANCE' : 'LIVE'}
            </span>
          </div>
          <button onClick={onToggleMaintenance} style={{
            padding: '4px 10px', borderRadius: 20, border: 'none',
            cursor: 'pointer', fontWeight: 900, fontSize: 10,
            letterSpacing: '0.08em',
            background: isMaintenance ? '#22c55e' : '#ef4444',
            color: '#fff', transition: 'all 0.15s',
          }}>
            {isMaintenance ? 'TURN OFF' : 'TURN ON'}
          </button>
        </div>
        {!isMaintenance && (
          <p style={{ color: '#555', fontSize: 10, margin: '8px 0 0', lineHeight: 1.5 }}>
            ⚠️ Turning ON will block all non-admin traffic.
          </p>
        )}
      </div>

      {/* BACK */}
      <button onClick={() => navigate('/')} style={{
        margin: '0 12px 20px', padding: '9px 14px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10, color: '#666', fontWeight: 700,
        fontSize: 12, cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all 0.15s',
      }}>
        ← Back to Site
      </button>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0EBE0' }}>

      {/* MOBILE OVERLAY */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 99, backdropFilter: 'blur(2px)'
        }} />
      )}

      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="admin-main-content" style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 220,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: '100vh',
      }}>

        {/* TOP BAR — always shown, different style mobile vs desktop */}
        <header style={{
          background: isMobile ? '#111111' : '#F0EBE0',
          borderBottom: isMobile ? 'none' : '1px solid rgba(0,0,0,0.08)',
          padding: isMobile ? '12px 16px' : '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          {/* Left — hamburger on mobile, page title on desktop */}
          {isMobile ? (
            <button onClick={() => setSidebarOpen(true)} style={{
              background: 'rgba(255,255,255,0.08)', border: 'none',
              color: '#fff', width: 36, height: 36, borderRadius: 8,
              fontSize: 18, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>☰</button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>👑</span>
              <span style={{
                fontWeight: 900, fontSize: 14,
                letterSpacing: '0.15em', color: '#111'
              }}>SUPER ADMIN PANEL</span>
            </div>
          )}

          {/* Center — brand on mobile */}
          {isMobile && (
            <span style={{
              color: '#FFD700', fontWeight: 900,
              fontSize: 15, letterSpacing: '0.2em'
            }}>RESTROON</span>
          )}

          {/* Right */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: isMaintenance ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            padding: '6px 12px', borderRadius: 20,
            border: `1px solid ${isMaintenance ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isMaintenance ? '#ef4444' : '#22c55e',
              boxShadow: `0 0 5px ${isMaintenance ? '#ef4444' : '#22c55e'}`
            }} />
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: isMaintenance ? '#ef4444' : '#22c55e',
              letterSpacing: '0.08em'
            }}>
              {isMaintenance ? 'MAINTENANCE' : 'LIVE'}
            </span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={{
          flex: 1,
          padding: isMobile ? '16px 12px' : '28px 32px',
          overflowX: 'hidden',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
