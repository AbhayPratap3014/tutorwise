const supabaseService = require("../services/supabaseService");

async function getProfile(req, res, next) {
  try {
    const profile = await supabaseService.getProfile(req.user.id);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, classNum, avatarUrl } = req.body;
    const profile = await supabaseService.upsertProfile(req.user.id, {
      ...(name && { name }),
      ...(classNum && { class_num: classNum }),
      ...(avatarUrl && { avatar_url: avatarUrl }),
    });
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
