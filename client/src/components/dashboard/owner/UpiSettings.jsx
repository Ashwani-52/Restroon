import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { QrCode, Save, Loader2, Info } from 'lucide-react';

const UpiSettings = () => {
    const [upiId, setUpiId] = useState('');
    const [upiName, setUpiName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUpiSettings();
    }, []);

    const fetchUpiSettings = async () => {
        try {
            const { data } = await api.get('/cafe/settings/upi');
            if (data.success) {
                setUpiId(data.upiId || '');
                setUpiName(data.upiName || '');
            }
        } catch (error) {
            alert('Failed to load UPI settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put('/cafe/settings/upi', { upiId, upiName });
            if (data.success) {
                alert('UPI details saved successfully!');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save UPI details');
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 mt-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-50 rounded-lg">
                    <QrCode className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-comic text-gray-800">Direct UPI Payments</h2>
                    <p className="text-gray-500 text-sm">Receive payments directly to your bank account with zero fees.</p>
                </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 flex gap-3 text-sm">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p>When customers choose UPI, they will scan a QR code to pay <strong>directly to you</strong>. You will need to manually verify the payment screen before handing over the food.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name (Optional)
                    </label>
                    <input
                        type="text"
                        value={upiName}
                        onChange={(e) => setUpiName(e.target.value)}
                        placeholder="e.g. My Cafe Name"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-1">This will show up when customers scan the QR code.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your UPI ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. yourname@ybl, 9876543210@paytm"
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save UPI Settings
                </button>
            </form>
        </div>
    );
};

export default UpiSettings;
