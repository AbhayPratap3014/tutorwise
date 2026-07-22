const express = require("express");
const { requireAuth } = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/profile", requireAuth, userController.getProfile);
router.put("/profile", requireAuth, userController.updateProfile);

module.exports = router;
