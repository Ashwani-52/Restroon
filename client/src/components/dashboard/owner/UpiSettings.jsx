import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Loader2 } from 'lucide-react';

const UpiSettings = () => {
    const [upiId, setUpiId] = useState('');
    const [upiName, setUpiName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUpiSettings = async () => {
            try {
                const { data } = await api.get('/api/cafe/settings/upi');
                if (data.success && data.upiId) {
                    setUpiId(data.upiId);
                    setUpiName(data.upiName || '');
                    setSaved(true);
                }
            } catch (error) {
                console.error('UPI load error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUpiSettings();
    }, []);

    const handleSaveUpi = async () => {
        if (!upiId || !upiId.includes('@')) {
            alert('Please enter a valid UPI ID (must contain @)');
            return;
        }
        setSaving(true);
        try {
            const { data } = await api.put('/api/cafe/settings/upi', { upiId, upiName });
            if (data.success) {
                setSaved(true);
                alert('✅ UPI ID saved! Customers will now pay directly to you.');
            }
        } catch (error) {
            alert('❌ ' + (error.response?.data?.message || 'Failed to save UPI'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div style={{
            background: '#fff', borderRadius: 16, padding: 24,
            border: '2px solid #e5e7eb', marginTop: 16
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 28 }}>📱</span>
                <div>
                    <div style={{ fontWeight: 900, fontSize: 17 }}>Direct UPI Payments</div>
                    <div style={{ color: '#888', fontSize: 13 }}>
                        Receive payments directly to your bank account with zero fees.
                    </div>
                </div>
            </div>

            {/* Info box */}
            <div style={{
                background: '#eff6ff', border: '1px solid #bfdbfe',
                borderRadius: 10, padding: '12px 14px', margin: '16px 0',
                fontSize: 13, color: '#1d4ed8', lineHeight: 1.5
            }}>
                ℹ️ When customers choose UPI, they will scan a QR code to pay{' '}
                <strong>directly to you.</strong> You will need to manually verify 
                the payment screen before handing over the food.
            </div>

            {/* Saved badge */}
            {saved && (
                <div style={{
                    background: '#f0fdf4', border: '1px solid #86efac',
                    borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                    fontSize: 13, color: '#16a34a', fontWeight: 700
                }}>
                    ✅ UPI Active — Customers can now pay directly to your account
                </div>
            )}

            {/* Business Name */}
            <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: '0.05em' }}>
                    BUSINESS NAME (OPTIONAL)
                </label>
                <input
                    value={upiName}
                    onChange={e => setUpiName(e.target.value)}
                    placeholder="Oven Express"
                    style={{
                        width: '100%', marginTop: 6, padding: '12px 14px',
                        borderRadius: 10, border: '2px solid #e5e7eb',
                        fontSize: 14, outline: 'none', boxSizing: 'border-box'
                    }}
                />
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                    This will show up when customers scan the QR code.
                </div>
            </div>

            {/* UPI ID */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: '0.05em' }}>
                    YOUR UPI ID *
                </label>
                <input
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@ybl, 9876543210@paytm"
                    style={{
                        width: '100%', marginTop: 6, padding: '12px 14px',
                        borderRadius: 10, border: `2px solid ${upiId && !upiId.includes('@') ? '#ef4444' : '#e5e7eb'}`,
                        fontSize: 14, fontFamily: 'monospace',
                        outline: 'none', boxSizing: 'border-box'
                    }}
                />
                {upiId && !upiId.includes('@') && (
                    <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
                        ❌ Invalid format — must contain @ symbol
                    </div>
                )}
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                    Examples: cafe@okicici · 9876543210@paytm · cafe@ybl
                </div>
            </div>

            {/* ✅ SAVE BUTTON */}
            <button
                onClick={handleSaveUpi}
                disabled={saving || !upiId || !upiId.includes('@')}
                style={{
                    width: '100%', padding: '14px',
                    background: saving || !upiId || !upiId.includes('@') 
                        ? '#e5e7eb' : '#FFD700',
                    border: 'none', borderRadius: 12,
                    fontWeight: 900, fontSize: 15,
                    letterSpacing: '0.08em',
                    cursor: saving || !upiId || !upiId.includes('@') 
                        ? 'not-allowed' : 'pointer',
                    color: '#000',
                    boxShadow: !saving && upiId && upiId.includes('@') 
                        ? '0 4px 0 #b8960c' : 'none',
                    transition: 'all 0.15s',
                    marginBottom: 40
                }}
            >
                {saving ? '⏳ Saving...' : saved ? '✅ UPDATE UPI ID' : '💾 SAVE UPI ID'}
            </button>
        </div>
    );
};

export default UpiSettings;
