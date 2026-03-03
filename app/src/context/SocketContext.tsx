// Restroon - Socket.IO Context (Backend-Aligned with Cafe Rooms)
import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinCafe: (cafeId: string) => void;
  joinOrder: (orderId: string) => void;
  leaveCafe: (cafeId: string) => void;
  leaveOrder: (orderId: string) => void;
}

// Socket event types matching backend
interface ServerToClientEvents {
  'new-order': (order: unknown) => void;
  'order-update': (order: unknown) => void;
  'payment-success': (data: { orderId: string; status: string }) => void;
  'payment-failed': (data: { orderId: string; error: string }) => void;
  'inventory-update': (item: unknown) => void;
  'menu-update': (data: { cafeId: string; product: unknown }) => void;
}

interface ClientToServerEvents {
  'join-cafe': (cafeId: string) => void;
  'leave-cafe': (cafeId: string) => void;
  'join-order': (orderId: string) => void;
  'leave-order': (orderId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = React.useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection with auth token
    const token = localStorage.getItem('accessToken');
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Real-time event handlers with UI notifications
    socket.on('new-order', (order: unknown) => {
      const orderData = order as { orderNumber: string; total: number; _id: string };
      toast.info(`New order received: #${orderData.orderNumber}`, {
        description: `Total: ₹${orderData.total?.toFixed(2) || 0}`,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/orders/${orderData._id}`,
        },
      });
    });

    socket.on('order-update', (order: unknown) => {
      const orderData = order as { orderNumber: string; status: string };
      const statusMessages: Record<string, string> = {
        pending: 'Order is pending',
        preparing: 'Order is being prepared',
        ready: 'Order is ready for pickup!',
        completed: 'Order completed',
        cancelled: 'Order was cancelled',
      };

      toast.info(statusMessages[orderData.status] || `Order status: ${orderData.status}`, {
        description: `Order #${orderData.orderNumber}`,
      });
    });

    socket.on('payment-success', (data) => {
      toast.success('Payment received!', {
        description: `Order #${data.orderId}`,
      });
    });

    socket.on('payment-failed', (data) => {
      toast.error('Payment failed', {
        description: data.error,
      });
    });
    //LOW STOCK ALERT
    //Queue concept
    socket.on('inventory-update', (item: unknown) => {
      const itemData = item as { name: string; currentStock: number; unit: string; minStock: number };
      //Decision Making – Greedy Logic
      //Object / Record Access (Hash Map concept)
      if (itemData.currentStock <= itemData.minStock) {
        toast.warning(`Low stock alert: ${itemData.name}`, {
          description: `Current stock: ${itemData.currentStock} ${itemData.unit}`,
          action: {
            label: 'Restock',
            onClick: () => window.location.href = '/inventory',
          },
        });
      }
    });

    socket.on('menu-update', (data) => {
      const product = data.product as { name: string; isAvailable: boolean };
      toast.info(`Menu updated: ${product.name}`, {
        description: product.isAvailable ? 'Now available' : 'Currently unavailable',
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  // Join a cafe room for receiving cafe-specific updates
  const joinCafe = useCallback((cafeId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-cafe', cafeId);
      console.log(`Joined cafe room: ${cafeId}`);
      // Store current cafe ID for API requests
      localStorage.setItem('currentCafeId', cafeId);
    }
  }, []);

  // Join an order room for order-specific updates
  const joinOrder = useCallback((orderId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-order', orderId);
      console.log(`Joined order room: ${orderId}`);
    }
  }, []);

  // Leave a cafe room
  const leaveCafe = useCallback((cafeId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-cafe', cafeId);
      console.log(`Left cafe room: ${cafeId}`);
    }
  }, []);

  // Leave an order room
  const leaveOrder = useCallback((orderId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-order', orderId);
      console.log(`Left order room: ${orderId}`);
    }
  }, []);

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    joinCafe,
    joinOrder,
    leaveCafe,
    leaveOrder,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Custom hook for subscribing to socket events
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSocketEvent = (event: string, callback: (...args: any[]) => void, deps: React.DependencyList = []) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on(event as any, callback as any);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.off(event as any, callback as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, event, ...deps]);
};

export default SocketContext;
