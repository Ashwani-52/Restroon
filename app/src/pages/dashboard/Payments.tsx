import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { DownloadCloud, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import { useCafe } from '@/context/CafeContext';

const Payments: React.FC = () => {
    const { cafe } = useCafe();

    // Mock data for payment history
    const recentPayouts = [
        { id: 'PO-1029', date: '2026-02-18', amount: 12500, status: 'completed' },
        { id: 'PO-1028', date: '2026-02-14', amount: 8900, status: 'completed' },
        { id: 'PO-1027', date: '2026-02-11', amount: 15200, status: 'completed' },
        { id: 'PO-1026', date: '2026-02-07', amount: 11050, status: 'completed' },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Payments & Payouts</h2>
                    <p className="text-muted-foreground">Track your cafe's earnings and bank settlements.</p>
                </div>
                <Button variant="outline">
                    <DownloadCloud className="h-4 w-4 mr-2" />
                    Export Statement
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Available for Payout</CardDescription>
                        <CardTitle className="text-3xl">₹4,250</CardTitle>
                    </CardHeader>
                    <CardFooter className="pt-2 text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Scheduled for next Tuesday
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Last Payout</CardDescription>
                        <CardTitle className="text-3xl">₹12,500</CardTitle>
                    </CardHeader>
                    <CardFooter className="pt-2 text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> Settled on Feb 18, 2026
                    </CardFooter>
                </Card>

                <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-primary-foreground/80">Total Earnings (This Month)</CardDescription>
                        <CardTitle className="text-3xl">₹38,900</CardTitle>
                    </CardHeader>
                    <CardFooter className="pt-2 text-xs text-primary-foreground/80 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" /> +12% from last month
                    </CardFooter>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Payouts</CardTitle>
                        <CardDescription>History of settlements to your bank account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payout ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentPayouts.map((payout) => (
                                    <TableRow key={payout.id}>
                                        <TableCell className="font-medium">{payout.id}</TableCell>
                                        <TableCell>{payout.date}</TableCell>
                                        <TableCell>₹{payout.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                {payout.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Payout Account</CardTitle>
                        <CardDescription>Where your funds are sent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cafe?.paymentDetails?.bankDetails ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-muted/50 rounded-lg border">
                                    <p className="text-sm font-medium">Bank Transfer</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {cafe.paymentDetails.bankDetails.bankName || 'HDFC Bank'}
                                        <br />
                                        Acc: •••• {cafe.paymentDetails.bankDetails.accountNumber.slice(-4) || '1234'}
                                    </p>
                                </div>
                                {cafe.paymentDetails.upiId && (
                                    <div className="p-3 bg-muted/50 rounded-lg border">
                                        <p className="text-sm font-medium">UPI ID</p>
                                        <p className="text-sm text-muted-foreground mt-1">{cafe.paymentDetails.upiId}</p>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">To change your payout account, click your café profile in the sidebar.</p>
                            </div>
                        ) : (
                            <div className="text-center p-6 border border-dashed rounded-lg">
                                <p className="text-sm text-muted-foreground mb-4">No bank account linked.</p>
                                <Button variant="outline" size="sm">Add Bank Account</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Payments;
