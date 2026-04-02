import Setting from '../models/Setting.model.js';

const maintenanceMode = async (req, res, next) => {
  // Allow admin and auth routes to pass through always
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth')) {
    return next();
  }

  try {
    const setting = await Setting.findOne({ key: 'maintenance_mode' });

    if (setting?.value === true) {
      return res.status(503).json({
        success: false,
        message: 'Restroon is currently under maintenance. Please check back soon! 🛠️'
      });
    }
    next();
  } catch (err) {
    // If DB error, don't block — just continue
    next();
  }
};

export default maintenanceMode;
