const supabaseService = require("../services/supabaseService");

async function listUsers(req, res, next) {
  try {
    const users = await supabaseService.getAllUsersWithStats();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function removeUser(req, res, next) {
  try {
    const { userId } = req.params;
    await supabaseService.deleteUser(userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const analytics = await supabaseService.getPlatformAnalytics();
    res.json({ analytics });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, removeUser, getAnalytics };
