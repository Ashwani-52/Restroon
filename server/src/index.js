require('dotenv').config();
require('express-async-errors');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const cafeRoutes = require('./routes/cafes');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes = require('./routes/upload');
const usersRoutes = require('./routes/users');
const subscriptionsRoutes = require('./routes/subscriptions');

const app = express();
const server = http.createServer(app);

// ==================== Socket.IO ====================
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join cafe room for real-time updates
    socket.on('join-cafe', (cafeId) => {
        socket.join(cafeId);
        console.log(`→ Socket ${socket.id} joined cafe room: ${cafeId}`);
    });

    socket.on('leave-cafe', (cafeId) => {
        socket.leave(cafeId);
        console.log(`← Socket ${socket.id} left cafe room: ${cafeId}`);
    });

    socket.on('join-order', (orderId) => {
        socket.join(`order-${orderId}`);
    });

    socket.on('leave-order', (orderId) => {
        socket.leave(`order-${orderId}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});

// ==================== Middleware ====================
app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ==================== API Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin/subscriptions', subscriptionsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Restroon API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Global error handler (must be last)
app.use(errorHandler);

// ==================== Start Server ====================
const PORT = process.env.PORT || 5050;

const start = async () => {
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Restroon API running on http://localhost:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
};

start();
