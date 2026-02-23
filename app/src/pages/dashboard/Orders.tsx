// OrderSmartly - Orders Management Page
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCafe } from '@/context/CafeContext';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Clock,
  ChefHat,
  CheckCircle,
  Package,
  XCircle,
  RefreshCw,
  Eye,
  Printer,
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  Phone,
  User,
  MapPin,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

const Orders: React.FC = () => {
  const { cafe } = useCafe();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { orders, isLoading, updateOrderStatus, cancelOrder, fetchOrders } = useOrders({
    cafeId: cafe?._id,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });

  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer?.phone?.includes(searchQuery)
  );

  const getStatusColor = (status: OrderStatus) => {
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

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <ChefHat className="h-4 w-4" />;
      case 'ready':
        return <Package className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'completed',
      completed: null,
      cancelled: null,
    };
    return flow[currentStatus];
  };

  const handleStatusUpdate = async (order: Order, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(order._id, newStatus);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handlePaymentUpdate = async (order: Order, newPaymentStatus: 'pending' | 'paid' | 'failed') => {
    try {
      const response = await import('@/services/api').then(m => m.orderApi.updatePaymentStatus(order._id, newPaymentStatus));
      if (response.data.success) {
        toast.success(`Payment marked as ${newPaymentStatus}`);
        fetchOrders(); // Refresh to reflect change
        if (selectedOrder && selectedOrder._id === order._id) {
          setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
        }
      }
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder) return;
    try {
      await cancelOrder(selectedOrder._id, cancelReason);
      setIsCancelDialogOpen(false);
      setCancelReason('');
      setSelectedOrder(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">#{order.orderNumber}</p>
              <Badge variant="outline" className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
              {order.paymentStatus === 'paid' && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  Paid
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {order.items.length} items • ₹{order.total.toLocaleString()}
            </p>
            {order.customer && (
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {order.customer.name}
                </span>
                {order.tableNumber && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Table {order.tableNumber}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <Button variant="ghost" size="sm" onClick={() => openOrderDetail(order)}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button variant="ghost" size="sm">
          <Printer className="h-4 w-4 mr-1" />
          Print
        </Button>
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <>
            {getNextStatus(order.status) && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(order, getNextStatus(order.status)!)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark as {getNextStatus(order.status)}
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setSelectedOrder(order);
                setIsCancelDialogOpen(true);
              }}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage and track all your café orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchOrders()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number, customer name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as OrderStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({orders.filter((o) => o.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="preparing">
            Preparing ({orders.filter((o) => o.status === 'preparing').length})
          </TabsTrigger>
          <TabsTrigger value="ready">
            Ready ({orders.filter((o) => o.status === 'ready').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <OrderCard key={order._id} order={order} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search' : 'Orders will appear here'}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {['pending', 'preparing', 'ready'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-4">
                    {filteredOrders
                      .filter((o) => o.status === status)
                      .map((order) => (
                        <OrderCard key={order._id} order={order} />
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order #{selectedOrder?.orderNumber}
              <Badge variant="outline" className={selectedOrder ? getStatusColor(selectedOrder.status) : ''}>
                {selectedOrder?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              {selectedOrder.customer && (
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {selectedOrder.customer.name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedOrder.customer.phone}
                    </p>
                    {selectedOrder.tableNumber && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Table {selectedOrder.tableNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">Note: {item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {item.quantity} × ₹{item.price}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{(item.quantity * item.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{selectedOrder.tax.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">-₹{selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>₹{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <span className="font-medium mr-4">Payment Status</span>
                  <Badge
                    variant="outline"
                    className={
                      selectedOrder.paymentStatus === 'paid'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-yellow-500/10 text-yellow-600'
                    }
                  >
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>

                {selectedOrder.paymentStatus !== 'paid' ? (
                  <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 text-xs" onClick={() => handlePaymentUpdate(selectedOrder, 'paid')}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Mark Paid
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => handlePaymentUpdate(selectedOrder, 'pending')}>
                    Mark Unpaid
                  </Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order #{selectedOrder?.orderNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for cancellation (optional)</label>
              <Input
                placeholder="Enter reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
