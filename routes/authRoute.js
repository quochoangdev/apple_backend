const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
  createUser,
  loginUserCtrl,
  logoutUserCtrl,
  updateOneUser,
} = require("../controllers/userController");

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.post("/logout", logoutUserCtrl);
router.put("/update", authMiddleware, isAdmin, updateOneUser);

module.exports = router;
