const express = require("express");

const {
  register,
  login,
  getMe,
  logout,
  getAllUsers,
  deleteMe,
  updateMe
} = require("../controllers/auth");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.get("/getallusers", protect, authorize("admin"), getAllUsers);
router.delete("/deleteMe", protect, deleteMe);
router.put("/updateMe", protect, updateMe);

module.exports = router;
