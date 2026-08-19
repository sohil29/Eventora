const express = require("express");
const router = express.Router();
const { registerUser, loginUser , verifyotp } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyotp);

module.exports = router;