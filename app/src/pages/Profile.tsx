import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCafe } from '@/context/CafeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { authApi } from '@/services/api';

const Profile: React.FC = () => {
    const { user, refreshUser, logout } = useAuth();
    const { cafe } = useCafe();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });

    const handleSave = async () => {
        try {
            await authApi.updateProfile(formData);
            await refreshUser();
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                <p className="text-muted-foreground">Manage your personal account settings.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-medium">{user?.name}</h3>
                                <Badge variant="secondary" className="capitalize">{user?.role.replace('_', ' ')}</Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user?.email} disabled />
                            <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                disabled={!isEditing}
                                placeholder="Add phone number"
                            />
                        </div>

                        <div className="pt-4 flex gap-2">
                            {isEditing ? (
                                <>
                                    <Button onClick={handleSave}>Save Changes</Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {cafe && user?.role === 'cafe_owner' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Linked Café</CardTitle>
                                <CardDescription>Your account is linked to this café.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={cafe.logo} />
                                        <AvatarFallback>{cafe.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{cafe.name}</p>
                                        <p className="text-sm text-muted-foreground">{cafe.address.city}, {cafe.address.state}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-destructive/20 border-2">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Irreversible account actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive" className="w-full sm:w-auto" onClick={logout}>
                                Sign Out Everywhere
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
