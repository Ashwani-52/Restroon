import Setting from '../models/Setting.model.js';

const maintenanceMode = async (req, res, next) => {
  // Allow admin routes to pass through always
  if (req.path.startsWith('/api/admin')) return next();

  const setting = await Setting.findOne({ key: 'maintenance_mode' });

  if (setting?.value === true) {
    return res.status(503).json({
      success: false,
      message: 'We are currently under maintenance. Please check back soon! 🛠️'
    });
  }
  next();
};

export default maintenanceMode;
