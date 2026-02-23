import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminSettings: React.FC = () => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
                <p className="text-muted-foreground">Manage global platform configurations and master data.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Platform Configuration</CardTitle>
                    <CardDescription>Global settings applied across all cafés.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6 opacity-70">
                        <div className="space-y-2">
                            <Label>Platform Commission (%)</Label>
                            <Input value="5.0" readOnly disabled />
                            <p className="text-xs text-muted-foreground">Editing disabled for security.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Default Trial Period (Days)</Label>
                            <Input value="14" readOnly disabled />
                        </div>
                    </div>

                    <Button disabled>Save Global Configuration</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                    <CardDescription>Payment gateways, SMS, and Email integrations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground p-6 text-center border rounded-md border-dashed">
                        Payment Gateway & notification integrations are configured via environment variables.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminSettings;
