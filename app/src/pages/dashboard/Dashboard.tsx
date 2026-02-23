// OrderSmartly - Café Owner Dashboard
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCafe } from '@/context/CafeContext';
import { useSocket } from '@/context/SocketContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EditCafeModal from '@/components/dashboard/EditCafeModal';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChefHat,
  CheckCircle,
  AlertCircle,
  UtensilsCrossed,
  Calendar,
  Store
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard: React.FC = () => {
  const { cafe, stats, isLoading: cafeLoading } = useCafe();
  const { stats: analyticsStats, salesData, topProducts } = useAnalytics({
    cafeId: cafe?._id,
    period: 'week'
  });
  const { getActiveOrders, isLoading: ordersLoading } = useOrders({
    cafeId: cafe?._id,
  });
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (cafe?._id) {
      getActiveOrders().then(orders => {
        if (Array.isArray(orders)) {
          setRecentOrders(orders.slice(0, 5));
        } else {
          setRecentOrders([]);
        }
      }).catch(() => setRecentOrders([]));
    }
  }, [cafe?._id, getActiveOrders]);

  const { joinCafe, leaveCafe } = useSocket();
  React.useEffect(() => {
    if (cafe?._id) {
      joinCafe(cafe._id);
      return () => {
        leaveCafe(cafe._id);
      };
    }
  }, [cafe?._id, joinCafe, leaveCafe]);

  const statCards = [
    {
      title: 'Today\'s Orders',
      value: analyticsStats?.todayOrders || 0,
      icon: ShoppingCart,
      trend: '+12%',
      trendUp: true,
      color: 'blue',
    },
    {
      title: 'Today\'s Revenue',
      value: `₹${(analyticsStats?.todayRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: '+8%',
      trendUp: true,
      color: 'green',
    },
    {
      title: 'Pending Orders',
      value: analyticsStats?.pendingOrders || 0,
      icon: Clock,
      trend: 'Active',
      trendUp: null,
      color: 'yellow',
    },
    {
      title: 'Low Stock Items',
      value: analyticsStats?.lowStockItems || 0,
      icon: Package,
      trend: analyticsStats?.lowStockItems ? 'Alert' : 'Good',
      trendUp: analyticsStats?.lowStockItems ? false : true,
      color: analyticsStats?.lowStockItems ? 'red' : 'green',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'preparing':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'ready':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'completed':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <ChefHat className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Onboarding Empty State */}
      {!cafe && !cafeLoading && (
        <Card className="border-primary/50 bg-primary/5 mb-8">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl font-bold tracking-tight">Welcome to OrderSmartly!</h2>
              <p className="text-muted-foreground">
                You're just one step away from managing your orders digitally.
                Get started by creating your Café Profile. This will allow customers to find you and place orders.
              </p>
            </div>
            <EditCafeModal>
              <Button size="lg" className="animate-pulse">
                Create Café Profile
              </Button>
            </EditCafeModal>
          </CardContent>
        </Card>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {cafe?.name || 'Café Owner'}
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your café today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/orders">
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Orders
            </Link>
          </Button>
          <Button asChild>
            <Link to="/menu">
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              Manage Menu
            </Link>
          </Button>
        </div>
      </div>

      {cafe && (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      {stat.trend && (
                        <div className={`flex items-center gap-1 mt-1 text-xs ${stat.trendUp === true ? 'text-green-600' :
                          stat.trendUp === false ? 'text-red-600' : 'text-muted-foreground'
                          }`}>
                          {stat.trendUp !== null && (
                            stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{stat.trend}</span>
                        </div>
                      )}
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
          <div className="grid gap-6 lg:grid-cols-7">
            {/* Charts Section */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>Revenue and orders over the last 7 days</CardDescription>
                  </div>
                  <Tabs defaultValue="revenue" className="w-auto">
                    <TabsList className="h-8">
                      <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
                      <TabsTrigger value="orders" className="text-xs">Orders</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling items this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item?.product ? (item?.product as { name?: string })?.name || 'Unknown Product' : 'Unknown Product'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.totalSold} sold
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{(item?.totalRevenue || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {topProducts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No sales data available yet
                    </p>
                  )}
                </div>
                <Button variant="ghost" className="w-full mt-4" asChild>
                  <Link to="/analytics">
                    View All Analytics
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders from your customers</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/orders">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">#{order.orderNumber}</p>
                          <Badge variant="outline" className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order?.items?.length || 0} items • ₹{(order?.total || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {order?.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Time unknown'}
                      </p>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/orders/${order._id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && !ordersLoading && (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <p className="text-sm text-muted-foreground">
                      Orders will appear here when customers place them
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <UtensilsCrossed className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Update Menu</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add new items or update prices
                    </p>
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      <Link to="/menu">
                        Manage Menu
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/5 to-green-600/5 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Check Inventory</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Review stock levels and restock
                    </p>
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      <Link to="/inventory">
                        View Inventory
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/5 to-purple-600/5 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">View Reports</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analyze sales and performance
                    </p>
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      <Link to="/analytics">
                        See Analytics
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
