import Order from '../models/Order.model.js';
import Notification from '../models/Notification.model.js';
import Cafe from '../models/Cafe.model.js';

export const sendCommissionReminders = async () => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Find all unpaid orders for today grouped by cafe
        const unpaidOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                    commissionPaid: false
                }
            },
            {
                $group: {
                    _id: '$cafe',
                    totalFee: { $sum: '$platformFeeAmount' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        for (const record of unpaidOrders) {
            const cafe = await Cafe.findById(record._id);
            if (!cafe) continue;

            const existingNotification = await Notification.findOne({
                user: cafe.owner,
                type: 'COMMISSION_REMINDER',
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            if (!existingNotification) {
                await Notification.create({
                    user: cafe.owner,
                    type: 'COMMISSION_REMINDER',
                    title: 'Platform Commission Pending',
                    message: `You have ${record.orderCount} order(s) today with a pending platform commission of ₹${record.totalFee}. Please settle it via the dashboard.`,
                    data: { amount: record.totalFee, orders: record.orderCount }
                });
            } else {
                // Update existing notification if fee increased
                existingNotification.message = `You have ${record.orderCount} order(s) today with a pending platform commission of ₹${record.totalFee}. Please settle it via the dashboard.`;
                existingNotification.data = { amount: record.totalFee, orders: record.orderCount };
                existingNotification.read = false; // Mark unread again just in case
                await existingNotification.save();
            }
        }

        console.log(`[CRON] Commission reminders sent for ${unpaidOrders.length} cafes.`);
    } catch (err) {
        console.error('[CRON] Error sending commission reminders:', err);
    }
};
