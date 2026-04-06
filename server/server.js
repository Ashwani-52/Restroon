import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import passport from 'passport';           // ← ADD
import { connectDB } from './config/db.js';
import { configurePassport } from './config/passport.js';  // ← ADD
import { authLimiter, generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import maintenanceMode from './middleware/maintenanceMode.js';

import authRoutes from './routes/auth.routes.js';
import cafeRoutes from './routes/cafe.routes.js';
import menuRoutes from './routes/menu.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import profileRoutes      from './routes/profile.routes.js';
import contactRoutes      from './routes/contact.routes.js';
import blogRoutes         from './routes/blog.routes.js';
import commissionRoutes   from './routes/commission.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import cron from 'node-cron';
import { sendCommissionReminders } from './utils/sendCommissionReminder.js';
configurePassport();              // ← ADD — initialize passport strategies

const app = express();

// Set up cron job for daily commission reminders at 21:00
cron.schedule('0 21 * * *', () => {
    console.log('[CRON] Running daily commission reminder script');
    sendCommissionReminders();
});

// Trust proxy is required if you are behind a load balancer (like Render or Heroku)
// Otherwise rate limiters block all traffic because they see the load balancer's IP
app.set('trust proxy', 1);

// Health check endpoints BEFORE any middlewares to ensure they are fast and never rate limited
app.get('/ping', (req, res) => res.status(200).json({ success: true, message: 'pong' }));

app.get('/health', (req, res) => {
    res.status(200).send("Restroon backend is alive");
});

app.use(helmet());
app.use(mongoSanitize());

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(passport.initialize());   // ← ADD — no sessions needed

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);

app.use(maintenanceMode);
app.use(generalLimiter);

app.use('/api/cafe', cafeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/profile',      profileRoutes);
app.use('/api/contact',      contactRoutes);
app.use('/api/blogs',        blogRoutes);
app.use('/api/commission',   commissionRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
});