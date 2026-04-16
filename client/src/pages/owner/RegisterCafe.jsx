// src/pages/owner/RegisterCafe.jsx
// 3-step cafe registration wizard: Details → Plan → Payment/Activate
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Plans definition (mirrors backend constants) ─────────────────────
const PLANS = [
  {
    id: 'trial',
    label: '1-Day Free Trial',
    price: 0,
    display: 'FREE',
    period: '24 hours',
    features: ['Full access', '1 Cafe setup', 'Unlimited orders', 'All features unlocked'],
    color: '#16a34a',
    highlight: false,
  },
  {
    id: 'monthly',
    label: '1 Month',
    price: 1500,
    display: '₹1,500',
    period: '/month',
    features: ['Everything in trial', 'Priority support', 'Analytics dashboard'],
    color: '#f59e0b',
    highlight: false,
  },
  {
    id: 'quarterly',
    label: '3 Months',
    price: 3999,
    display: '₹3,999',
    period: '/quarter',
    savings: 'Save ₹501',
    features: ['Everything in monthly', 'Commission reports', 'Custom domain support'],
    color: '#3b82f6',
    highlight: true,
  },
  {
    id: 'biannual',
    label: '6 Months',
    price: 6999,
    display: '₹6,999',
    period: '/6 months',
    savings: 'Save ₹2,001',
    features: ['Everything in quarterly', 'Dedicated support', 'Marketing toolkit'],
    color: '#8b5cf6',
    highlight: false,
  },
  {
    id: 'annual',
    label: '1 Year',
    price: 11999,
    display: '₹11,999',
    period: '/year',
    savings: 'Save ₹6,001',
    features: ['Everything + priority onboarding', '2 cafes', 'Revenue sharing benefits'],
    color: '#ef4444',
    highlight: false,
  },
];

// ── Map click handler helper ──────────────────────────────────────────
function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Load Razorpay SDK ─────────────────────────────────────────────────
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─────────────────────────────────────────────────────────────────────
export default function RegisterCafe() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1 — details
  const [form, setForm] = useState({
    name: '', address: '', city: '', state: '', pincode: '', phone: '', cuisine: '',
  });
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);
  const [cafeId, setCafeId] = useState(null);

  // Step 2 — plan
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Try to detect user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); },
        () => {}
      );
    }
  }, []);

  const handleFormChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── STEP 1 → submit details ──────────────────────────────────────
  const handleSaveDetails = async () => {
    setError('');
    if (!form.name.trim() || !form.address.trim()) {
      setError('Cafe name and address are required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/cafe-registration/save-details', {
        ...form, lat, lng,
      });
      setCafeId(data.cafeId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save details');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2 → create Razorpay order ──────────────────────────────
  const handleProceedToPayment = async () => {
    if (!selectedPlan) { setError('Please select a plan'); return; }
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/cafe-registration/create-order', {
        planId: selectedPlan,
        cafeId,
      });

      if (data.isFree) {
        // Activate immediately — no payment
        await activateCafe({ isFree: true, planId: selectedPlan });
        return;
      }

      // Load Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) { setError('Failed to load payment gateway. Please try again.'); setLoading(false); return; }

      const options = {
        key:        data.keyId,  // ✅ admin key from backend — no frontend env fallback
        amount:     data.amount,
        currency:   data.currency,
        order_id:   data.orderId,
        name:       'Restroon',
        description: `${selectedPlan} Subscription`,
        image:      '/logo.png',
        handler: async (response) => {
          await activateCafe({
            isFree:             false,
            planId:             selectedPlan,
            razorpay_order_id:     data.orderId,
            razorpay_payment_id:   response.razorpay_payment_id,
            razorpay_signature:    response.razorpay_signature,
          });
        },
        prefill:  { name: '', email: '', contact: form.phone || '' },
        theme:    { color: '#1A1A1A' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment was cancelled.');
          },
        },
      };

      setLoading(false);
      new window.Razorpay(options).open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not initiate payment');
      setLoading(false);
    }
  };

  // ── Activate cafe after payment ──────────────────────────────────
  const activateCafe = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/cafe-registration/verify-and-activate', {
        cafeId,
        ...payload,
      });
      setSuccess(`🎉 ${data.message}`);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared UI header ─────────────────────────────────────────────
  const StepHeader = ({ current }) => (
    <div style={styles.stepRow}>
      {['Details', 'Plan', 'Done'].map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={label} style={styles.stepItem}>
            <div style={{
              ...styles.stepCircle,
              background: done ? '#16a34a' : active ? '#1A1A1A' : '#e5e7eb',
              color: done || active ? '#fff' : '#6b7280',
            }}>
              {done ? '✓' : num}
            </div>
            <span style={{
              fontSize: 13,
              fontWeight: active ? 700 : 400,
              color: active ? '#1A1A1A' : '#6b7280',
            }}>{label}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏪 Register Your Cafe</h1>
        <p style={styles.subtitle}>Complete 3 simple steps to go live on Restroon</p>

        <StepHeader current={step} />

        {error && <div style={styles.error}>{error}</div>}

        {/* ── STEP 1 — Details ────────────────────── */}
        {step === 1 && (
          <div>
            <p style={styles.sectionLabel}>📍 Basic Information</p>
            <div style={styles.grid2}>
              <label style={styles.label}>
                Cafe Name *
                <input name="name" value={form.name} onChange={handleFormChange}
                  style={styles.input} placeholder="e.g. Chai Wala" />
              </label>
              <label style={styles.label}>
                Phone Number
                <input name="phone" value={form.phone} onChange={handleFormChange}
                  style={styles.input} placeholder="+91 XXXXXXXXXX" />
              </label>
            </div>
            <label style={styles.label}>
              Street Address *
              <input name="address" value={form.address} onChange={handleFormChange}
                style={styles.input} placeholder="Shop no / Building / Street" />
            </label>
            <div style={styles.grid3}>
              <label style={styles.label}>
                City
                <input name="city" value={form.city} onChange={handleFormChange}
                  style={styles.input} placeholder="City" />
              </label>
              <label style={styles.label}>
                State
                <input name="state" value={form.state} onChange={handleFormChange}
                  style={styles.input} placeholder="State" />
              </label>
              <label style={styles.label}>
                Pincode
                <input name="pincode" value={form.pincode} onChange={handleFormChange}
                  style={styles.input} placeholder="123456" />
              </label>
            </div>
            <label style={styles.label}>
              Cuisine Type
              <input name="cuisine" value={form.cuisine} onChange={handleFormChange}
                style={styles.input} placeholder="e.g. North Indian, Chinese, Cafe" />
            </label>

            <p style={{ ...styles.sectionLabel, marginTop: 24 }}>📌 Pin Your Location on Map</p>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
              Click on the map to set your exact location.
            </p>
            <div style={styles.mapWrap}>
              <MapContainer center={[lat, lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© OpenStreetMap contributors'
                />
                <Marker position={[lat, lng]} />
                <LocationPicker onPick={(la, ln) => { setLat(la); setLng(ln); }} />
              </MapContainer>
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
              📍 Selected: {lat.toFixed(5)}, {lng.toFixed(5)}
            </p>

            <button
              onClick={handleSaveDetails}
              disabled={loading}
              style={styles.btnPrimary}
            >
              {loading ? 'Saving...' : 'Continue to Plan Selection →'}
            </button>
          </div>
        )}

        {/* ── STEP 2 — Plan Selection ──────────────── */}
        {step === 2 && (
          <div>
            <p style={styles.sectionLabel}>💳 Choose Your Subscription Plan</p>

            <div style={styles.plansGrid}>
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{
                    ...styles.planCard,
                    border: selectedPlan === plan.id
                      ? `3px solid ${plan.color}`
                      : '3px solid #e5e7eb',
                    boxShadow: selectedPlan === plan.id
                      ? `6px 6px 0 ${plan.color}`
                      : '4px 4px 0 #e5e7eb',
                    background: plan.highlight ? '#fff8f0' : '#fff',
                  }}
                >
                  {plan.highlight && (
                    <span style={{ ...styles.badge, background: '#f59e0b' }}>POPULAR</span>
                  )}
                  {plan.savings && (
                    <span style={{ ...styles.badge, background: plan.color, right: 8, left: 'auto' }}>
                      {plan.savings}
                    </span>
                  )}
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{plan.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: plan.color }}>{plan.display}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{plan.period}</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ fontSize: 13, marginBottom: 4, color: '#374151' }}>
                        ✅ {f}
                      </li>
                    ))}
                  </ul>
                  {selectedPlan === plan.id && (
                    <div style={{ marginTop: 12, fontWeight: 700, color: plan.color, fontSize: 14 }}>
                      ✓ Selected
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={styles.btnSecondary}>← Back</button>
              <button
                onClick={handleProceedToPayment}
                disabled={loading || !selectedPlan}
                style={styles.btnPrimary}
              >
                {loading
                  ? 'Processing...'
                  : selectedPlan === 'trial'
                  ? 'Activate Free Trial →'
                  : 'Proceed to Payment →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Success ─────────────────────── */}
        {step === 3 && (
          <div style={styles.successWrap}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>You're Live!</h2>
            <p style={{ color: '#4b5563', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
              {success || 'Your cafe is registered! It will be visible after admin approval (usually within 24 hours).'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/dashboard/owner')}
                style={styles.btnPrimary}
              >
                🏪 Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/')}
                style={styles.btnSecondary}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fef9f0 0%, #fff8e1 50%, #fce7f3 100%)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 16px 80px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  card: {
    background: '#fff',
    border: '3px solid #1A1A1A',
    borderRadius: 20,
    boxShadow: '8px 8px 0 #1A1A1A',
    padding: '40px 36px',
    width: '100%',
    maxWidth: 760,
  },
  title: {
    fontSize: 28,
    fontWeight: 900,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 28,
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: '2px solid #f3f4f6',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    border: '2px solid #1A1A1A',
  },
  sectionLabel: {
    fontWeight: 700,
    fontSize: 15,
    marginBottom: 12,
    color: '#111',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 16,
  },
  input: {
    padding: '10px 14px',
    border: '2px solid #e5e7eb',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    marginTop: 2,
    transition: 'border-color 0.2s',
  },
  mapWrap: {
    height: 280,
    border: '3px solid #1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    boxShadow: '4px 4px 0 #e5e7eb',
  },
  btnPrimary: {
    background: '#1A1A1A',
    color: '#fff',
    border: '2px solid #1A1A1A',
    borderRadius: 10,
    padding: '12px 28px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '4px 4px 0 #f59e0b',
    transition: 'transform 0.1s',
    flex: 1,
  },
  btnSecondary: {
    background: '#fff',
    color: '#1A1A1A',
    border: '2px solid #1A1A1A',
    borderRadius: 10,
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '3px 3px 0 #e5e7eb',
  },
  plansGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
  },
  planCard: {
    padding: '20px 16px',
    borderRadius: 14,
    cursor: 'pointer',
    position: 'relative',
    transition: 'transform 0.1s, box-shadow 0.1s',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -10,
    left: 8,
    background: '#f59e0b',
    color: '#fff',
    fontSize: 10,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 20,
    letterSpacing: 1,
  },
  error: {
    background: '#fef2f2',
    border: '2px solid #f87171',
    borderRadius: 10,
    padding: '10px 16px',
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 16,
  },
  successWrap: {
    textAlign: 'center',
    padding: '32px 0',
  },
};
