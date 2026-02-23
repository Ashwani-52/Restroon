import React, { useState, useEffect } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const Settings: React.FC = () => {
    const { cafe, updateCafe } = useCafe();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        openingTime: '09:00',
        closingTime: '22:00',
        currency: 'INR',
        taxRate: 5,
    });

    useEffect(() => {
        if (cafe) {
            setFormData({
                description: cafe.description || '',
                street: cafe.address?.street || '',
                city: cafe.address?.city || '',
                state: cafe.address?.state || '',
                zipCode: cafe.address?.zipCode || '',
                country: cafe.address?.country || '',
                openingTime: cafe.settings?.openingTime || '09:00',
                closingTime: cafe.settings?.closingTime || '22:00',
                currency: cafe.settings?.currency || 'INR',
                taxRate: cafe.settings?.taxRate || 5,
            });
        }
    }, [cafe]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cafe) return;

        try {
            setIsLoading(true);
            await updateCafe({
                description: formData.description,
                address: {
                    ...(cafe.address || {}),
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                } as any,
                settings: {
                    ...(cafe.settings || {}),
                    openingTime: formData.openingTime,
                    closingTime: formData.closingTime,
                    currency: formData.currency,
                    taxRate: Number(formData.taxRate),
                } as any
            });
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Café Profile & Settings</h2>
                <p className="text-muted-foreground">Manage your public information, address, and operating configuration.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Public Profile</CardTitle>
                        <CardDescription>This information will be displayed to customers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Café Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Tell customers about your café..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Physical Address</CardTitle>
                        <CardDescription>Where your café is located.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input
                                id="street"
                                value={formData.street}
                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                                <Input
                                    id="zipCode"
                                    value={formData.zipCode}
                                    onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Operating Configuration</CardTitle>
                        <CardDescription>Configure how your café operates on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="openingTime">Opening Time</Label>
                                <Input
                                    id="openingTime"
                                    type="time"
                                    value={formData.openingTime}
                                    onChange={e => setFormData({ ...formData, openingTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="closingTime">Closing Time</Label>
                                <Input
                                    id="closingTime"
                                    type="time"
                                    value={formData.closingTime}
                                    onChange={e => setFormData({ ...formData, closingTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency Code</Label>
                                <Input
                                    id="currency"
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                                    placeholder="e.g. INR, USD, EUR"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    step="0.1"
                                    value={formData.taxRate}
                                    onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                            Save All Settings
                        </Button>
                    </CardContent>
                </Card>
            </form>

            <Card className="border-muted bg-muted/20">
                <CardHeader>
                    <CardTitle>Payment & Billing</CardTitle>
                    <CardDescription>To update your UPI or Bank details, click your café profile in the sidebar.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
};

export default Settings;
