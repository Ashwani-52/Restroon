import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'STATS',  icon: '📊', path: '/dashboard/admin' },
  { label: 'CAFES',  icon: '🏪', path: '/dashboard/admin/cafes' },
  { label: 'USERS',  icon: '👥', path: '/dashboard/admin/users' },
  { label: 'ORDERS', icon: '📦', path: '/dashboard/admin/orders' },
];

const AdminLayout = ({ children, isMaintenance, onToggleMaintenance }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 40,
            display: 'block'
          }}
          className="lg:hidden"
        />
      )}

      {/* ══════════════════════════════
          SIDEBAR
      ══════════════════════════════ */}
      <aside style={{
        width: '240px',
        minWidth: '240px',
        background: '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 10,
      }}
        className={`
          fixed top-0 left-0 h-full z-50
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Close btn — mobile only */}
        <button
          className="lg:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'absolute', top: 12, right: 12,
            color: '#fff', background: 'transparent',
            border: 'none', fontSize: 22, cursor: 'pointer', zIndex: 1
          }}
        >✕</button>

        {/* ── LOGO ── */}
        <div style={{ padding: '24px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>👑</span>
            <span style={{
              color: '#FFD700',
              fontWeight: 900,
              fontSize: 15,
              letterSpacing: '0.15em',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit'
            }}>
              SUPER ADMIN
            </span>
          </div>
          <div style={{
            marginTop: 8, height: 3, borderRadius: 4,
            background: 'linear-gradient(to right, #FFD700, #FF6B00, #FF0000)'
          }} />
        </div>

        {/* ── NAV ── */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (location.pathname === '/dashboard/admin' && item.path === '/dashboard/admin');
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: '0.1em',
                  transition: 'all 0.15s',
                  background: isActive ? '#FFD700' : 'transparent',
                  color: isActive ? '#000' : '#BBBBBB',
                }}
              >
                <span style={{ fontSize: 17 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── SITE STATUS ── */}
        <div style={{
          margin: '0 10px 10px',
          padding: '14px',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span>🛰️</span>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 11, letterSpacing: '0.12em' }}>
              SITE STATUS
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: isMaintenance ? '#f87171' : '#4ade80'
            }}>
              {isMaintenance ? '🔴 MAINTENANCE' : '🟢 LIVE'}
            </span>
            <button
              onClick={onToggleMaintenance}
              style={{
                padding: '4px 10px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: '0.08em',
                background: isMaintenance ? '#22c55e' : '#ef4444',
                color: '#fff',
              }}
            >
              {isMaintenance ? 'TURN OFF' : 'TURN ON'}
            </button>
          </div>
          {!isMaintenance && (
            <p style={{ color: '#888', fontSize: 11, margin: 0, lineHeight: 1.4 }}>
              ⚠️ Turning ON will block all non-admin traffic.
            </p>
          )}
        </div>

        {/* ── BACK ── */}
        <button
          onClick={() => navigate('/')}
          style={{
            margin: '0 10px 16px',
            padding: '10px 14px',
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            textAlign: 'left',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          ← Back
        </button>
      </aside>

      {/* ══════════════════════════════
          MAIN AREA
      ══════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Mobile topbar */}
        <header
          className="lg:hidden"
          style={{
            background: '#1a1a1a',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}
          >☰</button>
          <span style={{ color: '#FFD700', fontWeight: 900, fontSize: 16, letterSpacing: '0.15em' }}>
            RESTROON
          </span>
          <span style={{ fontSize: 22 }}>👑</span>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
