// OrderSmartly - Super Admin Dashboard
import React from 'react';
import { Link } from 'react-router-dom';
import { usePlatformAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Store,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

class ChartErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="flex h-full items-center justify-center text-red-500">Failed to render chart</div>;
    }
    return this.props.children;
  }
}

const AdminDashboard: React.FC = () => {
  const {
    platformStats,
    cafePerformance,
    subscriptionStats,
    platformGrowth,
    recentSignups,
    isLoading
  } = usePlatformAnalytics();

  const statCards: Array<{
    title: string;
    value: string | number;
    active?: number;
    pending?: number;
    icon: React.ElementType;
    trend: string;
    trendUp: boolean;
    color: string;
    href: string;
  }> = [
      {
        title: 'Total Cafes',
        value: platformStats?.totalCafes || 0,
        active: platformStats?.activeCafes || 0,
        icon: Store,
        trend: '+12%',
        trendUp: true,
        color: 'blue',
        href: '/admin/cafes',
      },
      {
        title: 'Total Revenue',
        value: `₹${(platformStats?.totalRevenue || 0).toLocaleString()}`,
        icon: DollarSign,
        trend: '+18%',
        trendUp: true,
        color: 'green',
        href: '/admin/analytics',
      },
      {
        title: 'Active Subscriptions',
        value: platformStats?.activeSubscriptions || 0,
        pending: platformStats?.pendingSubscriptions || 0,
        icon: CreditCard,
        trend: '+8%',
        trendUp: true,
        color: 'purple',
        href: '/admin/subscriptions',
      },
      {
        title: 'Total Orders',
        value: (platformStats?.totalOrders || 0).toLocaleString(),
        icon: ShoppingCart,
        trend: '+24%',
        trendUp: true,
        color: 'orange',
        href: '/admin/analytics',
      },
    ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
          <p className="text-muted-foreground">
            Monitor your SaaS platform performance and metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/cafes">
              <Store className="mr-2 h-4 w-4" />
              Manage Cafes
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/subscriptions">
              <CreditCard className="mr-2 h-4 w-4" />
              Subscriptions
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.active !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.active} active
                      {stat.pending ? ` • ${stat.pending} pending` : ''}
                    </p>
                  )}
                  <div className={`flex items-center gap-1 mt-2 text-xs ${stat.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{stat.trend} this month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Platform Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>Cafes and revenue over time</CardDescription>
              </div>
              <Tabs defaultValue="cafes" className="w-auto">
                <TabsList className="h-8">
                  <TabsTrigger value="cafes" className="text-xs">Cafes</TabsTrigger>
                  <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {platformGrowth && platformGrowth.length > 0 ? (
                <ChartErrorBoundary>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={platformGrowth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="cafes"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No growth data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>New cafes joining the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSignups.map((cafe, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cafe.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cafe.owner} • {cafe.date}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      cafe.status === 'active'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-yellow-500/10 text-yellow-600'
                    }
                  >
                    {cafe.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link to="/admin/cafes">
                View All Cafes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Overview</CardTitle>
          <CardDescription>Revenue breakdown by plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {(subscriptionStats || []).map((stat, index) => {
              const safeColor = COLORS[index % COLORS.length] || COLORS[0];
              return (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-${safeColor}-500/10`} style={{ backgroundColor: `${safeColor}1A` }}>
                      <CreditCard className={`h-5 w-5`} style={{ color: safeColor }} />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{stat?.plan || 'Unknown'}</p>
                      <p className="text-2xl font-bold">{stat?.count || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium">₹{(stat?.revenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
            {(!subscriptionStats || subscriptionStats.length === 0) && (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                No subscription data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Cafes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Performing Cafes</CardTitle>
              <CardDescription>Cafes with highest revenue this month</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/cafes">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(cafePerformance || []).slice(0, 5).map((cafe, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{(cafe?.cafe as { name?: string })?.name || 'Unknown Cafe'}</p>
                    <p className="text-sm text-muted-foreground">
                      {cafe?.orders || 0} orders this month
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{(cafe?.revenue || 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
            {(!cafePerformance || cafePerformance.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                No performance data available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">API Status</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">WebSocket</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-xs text-muted-foreground">99.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default AdminDashboard;
