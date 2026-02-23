import React, { useState, useEffect } from 'react';
import type { Cafe, Category, Product, OrderItem } from '@/types';
import { categoryApi, productApi, orderApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useSocket, useSocketEvent } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ShoppingBag, ChevronLeft, Plus, Minus, ArrowRight, CheckCircle2, History, Package } from 'lucide-react';
import { toast } from 'sonner';

interface StorefrontProps {
    cafe: Cafe;
    onBack: () => void;
}

const Storefront: React.FC<StorefrontProps> = ({ cafe, onBack }) => {
    const { user } = useAuth();
    const { joinOrder, leaveOrder } = useSocket();
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('all');

    // Cart state
    const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [placedOrder, setPlacedOrder] = useState<any>(null);

    // Order History state
    const [orderHistory, setOrderHistory] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [catRes, prodRes] = await Promise.all([
                    categoryApi.getAll(cafe._id),
                    productApi.getAll({ cafeId: cafe._id, isAvailable: true })
                ]);

                if (catRes.data.success) {
                    // Sort categories by sortOrder if it exists, else alphabetical
                    const sortedCats = catRes.data.data.sort((a, b) =>
                        (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name)
                    );
                    setCategories(sortedCats);
                }
                if (prodRes.data.success) {
                    setProducts(prodRes.data.data);
                }
            } catch (error) {
                toast.error('Failed to load menu');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        fetchOrderHistory(); // Initial fetch
    }, [cafe._id]);

    const fetchOrderHistory = async () => {
        try {
            setIsHistoryLoading(true);
            const res = await orderApi.getAll({ cafeId: cafe._id, limit: 10 });
            if (res.data.success && user) {
                const myOrders = res.data.data.data.filter((o: any) => o.customer?.email === user.email || o.customer?.phone === user.phone);
                setOrderHistory(myOrders);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product._id === product._id);
            if (existing) {
                return prev.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        toast.success(`${product.name} added to cart`);
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const existing = prev.find(item => item.product._id === productId);
            if (existing && existing.quantity > 1) {
                return prev.map(item =>
                    item.product._id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prev.filter(item => item.product._id !== productId);
        });
    };

    const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            setIsProcessing(true);
            const items = cart.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
            }));

            const payload = {
                items,
                orderType: 'dine_in',
                cafe: cafe._id,
                customer: {
                    name: user?.name || 'Guest',
                    phone: user?.phone || '',
                    email: user?.email || '',
                }
            };

            const res = await orderApi.create(payload);
            if (res.data.success) {
                setPlacedOrder(res.data.data);
                joinOrder(res.data.data._id);
                setCart([]);
            }
        } catch (error) {
            toast.error('Checkout failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    useSocketEvent('order-update', (updated: any) => {
        if (placedOrder && updated._id === placedOrder._id) {
            setPlacedOrder(updated);

            if (updated.status === 'completed') {
                toast.success('Your order is complete! Enjoy your meal.');
                setTimeout(() => handleCloseOrder(), 4000);
            } else if (updated.status === 'cancelled') {
                toast.error('Your order was cancelled.');
                setTimeout(() => handleCloseOrder(), 4000);
            }
        }

        if (user && (updated.customer?.email === user.email || updated.customer?.phone === user.phone)) {
            setOrderHistory(prev => {
                const exists = prev.find(o => o._id === updated._id);
                if (exists) {
                    return prev.map(o => o._id === updated._id ? updated : o);
                }
                return [updated, ...prev];
            });
        }
    }, [placedOrder, user]);

    const handleCloseOrder = () => {
        if (placedOrder) {
            leaveOrder(placedOrder._id);
        }
        setPlacedOrder(null);
    };

    if (placedOrder) {
        const statusColors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-600',
            preparing: 'bg-blue-100 text-blue-600',
            ready: 'bg-green-100 text-green-600',
            completed: 'bg-gray-100 text-gray-600',
            cancelled: 'bg-red-100 text-red-600',
        };

        const statusText: Record<string, string> = {
            pending: 'Order Received',
            preparing: 'Preparing Your Order',
            ready: 'Ready for Pickup!',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center animate-bounce ${statusColors[placedOrder.status] || 'bg-muted'}`}>
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">{statusText[placedOrder.status] || 'Order Received'}</h2>
                    <p className="text-muted-foreground">Your order <strong className="text-foreground">#{placedOrder.orderNumber}</strong> is {placedOrder.status} by {cafe.name}.</p>
                </div>
                <div className="w-full max-w-sm">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-8">
                        <div className="h-full bg-primary transition-all duration-1000" style={{
                            width: placedOrder.status === 'pending' ? '25%' :
                                placedOrder.status === 'preparing' ? '60%' :
                                    placedOrder.status === 'ready' ? '100%' : '100%'
                        }} />
                    </div>
                </div>
                <Button onClick={handleCloseOrder} className="mt-8">
                    Order More Items
                </Button>
            </div>
        );
    }

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(p => typeof p.category === 'object' ? p.category._id === activeCategory : p.category === activeCategory);

    return (
        <div className="relative pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-4">
                <div className="flex items-center justify-between gap-4 mb-4 mt-2 px-2">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold">{cafe.name}</h1>
                            <p className="text-xs text-muted-foreground">{cafe.address.street}</p>
                        </div>
                    </div>

                    {user && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 rounded-full" onClick={fetchOrderHistory}>
                                    <History className="h-4 w-4" />
                                    <span className="hidden sm:inline">My Orders</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
                                <SheetHeader className="p-4 border-b">
                                    <SheetTitle>Order History</SheetTitle>
                                </SheetHeader>
                                <ScrollArea className="flex-1 p-4">
                                    {isHistoryLoading ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                                        </div>
                                    ) : orderHistory.length > 0 ? (
                                        <div className="space-y-4">
                                            {orderHistory.map((order) => (
                                                <div key={order._id} className="p-4 border rounded-xl bg-card">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-semibold text-sm">#{order.orderNumber}</p>
                                                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-xs px-2 py-1 rounded-full border bg-muted/50 capitalize font-medium
                                                                ${order.status === 'completed' ? 'text-green-600 border-green-200 bg-green-50' : ''}
                                                                ${order.status === 'pending' || order.status === 'preparing' ? 'text-blue-600 border-blue-200 bg-blue-50' : ''}
                                                                ${order.status === 'cancelled' ? 'text-red-600 border-red-200 bg-red-50' : ''}
                                                            `}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div className="space-y-1">
                                                        {order.items.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between text-sm">
                                                                <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                                                                <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div className="flex justify-between font-bold text-sm">
                                                        <span>Total</span>
                                                        <span>₹{order.total.toLocaleString()}</span>
                                                    </div>
                                                    {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && order.status !== 'completed' && (
                                                        <p className="text-xs text-yellow-600 mt-2 bg-yellow-50 p-2 rounded border border-yellow-200 flex items-center gap-1">
                                                            Payment pending at counter
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center">
                                            <Package className="w-12 h-12 mb-2 opacity-20" />
                                            <p>No past orders found.</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>

                {/* Categories horizontally scrollable */}
                <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 px-1">
                    <Button
                        variant={activeCategory === 'all' ? 'default' : 'secondary'}
                        className="rounded-full whitespace-nowrap"
                        onClick={() => setActiveCategory('all')}
                    >
                        All Items
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat._id}
                            variant={activeCategory === cat._id ? 'default' : 'secondary'}
                            className="rounded-full whitespace-nowrap"
                            onClick={() => setActiveCategory(cat._id)}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Menu Grid */}
            <div className="mt-6 space-y-8">
                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-32 w-full rouded-xl" />
                        <Skeleton className="h-32 w-full rouded-xl" />
                        <Skeleton className="h-32 w-full rouded-xl" />
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-1">
                        {filteredProducts.map(product => {
                            const cartItem = cart.find(c => c.product._id === product._id);

                            return (
                                <div key={product._id} className="flex gap-4 p-4 rounded-xl border bg-card shadow-sm">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-24 h-24 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                                            <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="flex flex-col flex-1 justify-between">
                                        <div>
                                            <h3 className="font-semibold">{product.name}</h3>
                                            <p className="text-sm font-medium text-muted-foreground mt-1">₹{product.price}</p>
                                            {product.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>}
                                        </div>

                                        <div className="flex justify-end mt-2">
                                            {cartItem ? (
                                                <div className="flex items-center gap-3 bg-primary text-primary-foreground rounded-md px-3 py-1 mt-auto">
                                                    <button onClick={() => removeFromCart(product._id)} className="hover:opacity-80">
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-medium text-sm w-4 text-center">{cartItem.quantity}</span>
                                                    <button onClick={() => addToCart(product)} className="hover:opacity-80">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Button variant="outline" size="sm" className="mt-auto px-6 text-primary border-primary hover:bg-primary/10" onClick={() => addToCart(product)}>
                                                    ADD
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        No items found in this category.
                    </div>
                )}
            </div>

            {/* Floating Cart (Blinkit Style) */}
            {cartItemCount > 0 && (
                <div className="fixed bottom-4 left-0 right-0 z-40 mx-auto max-w-lg px-4 animate-in slide-in-from-bottom-5">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="w-full h-14 rounded-xl shadow-xl flex items-center justify-between px-4 text-lg">
                                <div className="flex flex-col items-start leading-none">
                                    <span className="font-bold text-sm">{cartItemCount} item{cartItemCount > 1 ? 's' : ''}</span>
                                    <span className="font-bold">₹{cartTotal}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>View Cart</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="bottom" className="sm:max-w-xl mx-auto rounded-t-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                            <SheetHeader className="p-4 border-b text-left shrink-0">
                                <SheetTitle>Your Order at {cafe.name}</SheetTitle>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                                <div className="space-y-6 pb-8">
                                    {/* Items List */}
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item.product._id} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-12 h-12 bg-muted rounded-md overflow-hidden shrink-0">
                                                        {item.product.image && <img src={item.product.image} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium leading-none">{item.product.name}</p>
                                                        <p className="text-sm text-muted-foreground mt-1">₹{item.product.price}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 bg-secondary text-secondary-foreground rounded-md px-3 py-1">
                                                    <button onClick={() => removeFromCart(item.product._id)} className="hover:opacity-80">
                                                        <Minus className="w-4 h-4 cursor-pointer" />
                                                    </button>
                                                    <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => addToCart(item.product)} className="hover:opacity-80">
                                                        <Plus className="w-4 h-4 cursor-pointer" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Notes */}
                                    <div className="pt-2">
                                        <Input placeholder="Any cooking instructions?" className="bg-muted/50" />
                                    </div>

                                    {/* Payment Callout */}
                                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
                                        <h3 className="font-semibold text-primary">Payment Information</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Please make the payment using the details below. Staff will verify your payment when serving.
                                        </p>

                                        {cafe?.paymentDetails?.upiId && (
                                            <div className="flex justify-between text-sm py-1 border-b border-primary/10">
                                                <span className="text-muted-foreground">UPI ID</span>
                                                <span className="font-medium select-all">{cafe.paymentDetails.upiId}</span>
                                            </div>
                                        )}

                                        {cafe?.paymentDetails?.bankDetails?.accountNumber && (
                                            <div className="text-sm space-y-1 mt-2">
                                                <p className="font-medium text-xs text-muted-foreground mb-1 uppercase tracking-wider">Bank Transfer</p>
                                                <div className="flex justify-between py-1">
                                                    <span className="text-muted-foreground">A/C Number</span>
                                                    <span className="font-medium select-all">{cafe.paymentDetails.bankDetails.accountNumber}</span>
                                                </div>
                                                <div className="flex justify-between py-1">
                                                    <span className="text-muted-foreground">IFSC</span>
                                                    <span className="font-medium select-all">{cafe.paymentDetails.bankDetails.ifscCode}</span>
                                                </div>
                                                {cafe.paymentDetails.bankDetails.accountName && (
                                                    <div className="flex justify-between py-1">
                                                        <span className="text-muted-foreground">Name</span>
                                                        <span className="font-medium">{cafe.paymentDetails.bankDetails.accountName}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bill Details */}
                                    <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                                        <h3 className="font-semibold mb-2">Bill Details</h3>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Item Total</span>
                                            <span>₹{cartTotal}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Taxes & Charges (5%)</span>
                                            <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-bold">
                                            <span>To Pay</span>
                                            <span>₹{(cartTotal * 1.05).toFixed(0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pinned Checkout Button Footer */}
                            <div className="p-4 border-t bg-background shrink-0 mt-auto pb-safe">
                                <SheetClose asChild>
                                    <Button className="w-full h-14 text-lg font-bold flex justify-between px-6 rounded-xl group" onClick={handleCheckout} disabled={isProcessing}>
                                        <div className="flex flex-col text-left leading-none">
                                            <span className="text-xs font-normal opacity-80">PAY USING DIGITAL</span>
                                            <span className="mt-1">₹{(cartTotal * 1.05).toFixed(0)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isProcessing ? 'Processing...' : 'Place Order'}
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Button>
                                </SheetClose>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            )}
        </div>
    );
};

export default Storefront;
