const express = require("express");
const { requireAuth } = require("../middleware/auth");
const testController = require("../controllers/testController");

const router = express.Router();

router.post("/generate", requireAuth, testController.generateTest);
router.post("/submit", requireAuth, testController.submitTest);
router.get("/history", requireAuth, testController.getHistory);
router.get("/dashboard", requireAuth, testController.getDashboard);

module.exports = router;
