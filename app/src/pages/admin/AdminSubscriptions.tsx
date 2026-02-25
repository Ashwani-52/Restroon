// Restroon - Admin Subscriptions Management
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Search,
  CreditCard,
  Check,
  X,
  Calendar,
  DollarSign,
  Store,
  MoreVertical,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import type { Subscription, SubscriptionPlan } from '@/types';
import { adminSubscriptionApi } from '@/services/api';
import { useSocket } from '@/context/SocketContext';
import { Spinner } from '@/components/ui/spinner';

const AdminSubscriptions: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<(Subscription & { cafeName?: string; planName?: string })[]>([]);
  const [stats, setStats] = useState({ totalSubscriptions: 0, activeCount: 0, expiringSoon: 0, monthlyRevenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  const fetchSubscriptions = async () => {
    try {
      const [plansRes, subsRes] = await Promise.all([
        adminSubscriptionApi.getPlans(),
        adminSubscriptionApi.getAllSubscriptions()
      ]);

      if (plansRes.data.success) {
        setPlans(plansRes.data.data);
      }

      if (subsRes.data.success) {
        setSubscriptions(subsRes.data.data.subscriptions);
        setStats(subsRes.data.data.stats);
      }
    } catch (error) {
      toast.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-admin');

    const handler = () => {
      // Fast refresh when any subscription changes
      fetchSubscriptions();
    };

    socket.on('subscription-updated', handler);
    return () => {
      socket.off('subscription-updated', handler);
    };
  }, [socket]);

  const handleSeedTestData = async () => {
    try {
      setIsLoading(true);
      await adminSubscriptionApi.seedPlans();
      toast.success('Plans seeded successfully!');
      await fetchSubscriptions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to seed plans');
    } finally {
      setIsLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<typeof subscriptions[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      (sub.cafeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      getPlanName(sub.plan).toLowerCase().includes(searchQuery.toLowerCase())
  );

  function getPlanName(planId: string | object | undefined): string {
    if (!planId) return 'Unknown Plan';
    if (typeof planId === 'string') {
      const pObj = plans.find(p => p._id === planId);
      return pObj ? pObj.name : 'Unknown Plan';
    }
    return (planId as any).name || 'Unknown Plan';
  }

  function getPlanPrice(planId: string | SubscriptionPlan, cycle: string): number {
    if (typeof planId !== 'string') return planId.price[cycle as 'monthly' | 'yearly'];
    const plan = plans.find((p) => p._id === planId);
    return plan?.price[cycle as 'monthly' | 'yearly'] || 0;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600';
      case 'expired':
        return 'bg-red-500/10 text-red-600';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const openDetail = (sub: typeof subscriptions[0]) => {
    setSelectedSubscription(sub);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground">
            Manage subscription plans and active subscriptions
          </p>
        </div>
        {plans.length === 0 && (
          <Button onClick={handleSeedTestData}>Seed Subscription Plans</Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">{stats.expiringSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Available plans for café owners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="p-6 rounded-lg border hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <Badge variant="outline" className={plan.isActive ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-3xl font-bold">₹{plan.price.monthly}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-muted-foreground">
                  <p>Max Products: {plan.limits.maxProducts === -1 ? 'Unlimited' : plan.limits.maxProducts}</p>
                  <p>Max Orders: {plan.limits.maxOrders === -1 ? 'Unlimited' : plan.limits.maxOrders}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>Current subscriptions across all cafes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by cafe or plan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {filteredSubscriptions.map((sub) => (
                <div key={sub._id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{sub.cafeName}</h3>
                          <Badge variant="outline" className={getStatusColor(sub.status)}>
                            {getStatusIcon(sub.status)}
                            <span className="ml-1 capitalize">{sub.status}</span>
                          </Badge>
                          {sub.autoRenew && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Auto-renew
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{getPlanName(sub.plan)} Plan</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expires {new Date(sub.endDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ₹{sub.amount.toLocaleString()}/{sub.billingCycle}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDetail(sub)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredSubscriptions.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No subscriptions found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Subscription Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
          </DialogHeader>

          {selectedSubscription && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{selectedSubscription.cafeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {getPlanName(selectedSubscription.plan)} Plan
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <Badge variant="outline" className={getStatusColor(selectedSubscription.status)}>
                    {getStatusIcon(selectedSubscription.status)}
                    <span className="ml-1 capitalize">{selectedSubscription.status}</span>
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Billing Cycle</h4>
                  <p className="text-sm capitalize">{selectedSubscription.billingCycle}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Start Date</h4>
                  <p className="text-sm">{new Date(selectedSubscription.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">End Date</h4>
                  <p className="text-sm">{new Date(selectedSubscription.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Amount</h4>
                <p className="text-2xl font-bold">₹{selectedSubscription.amount.toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${selectedSubscription.autoRenew ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm">
                  Auto-renew is {selectedSubscription.autoRenew ? 'enabled' : 'disabled'}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions;
