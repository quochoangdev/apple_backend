const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");
const validateMongodbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const { generateToken } = require("../config/jwtToken");

// Register
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.data.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body.data);
    res.send({ message: "Đăng ký thành công", alert: true });
  } else {
    res.send({ message: "Email đã được đăng ký", alert: true });
    throw new Error("User Already Exists");
  }
});

// Login User
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body.data;
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?.id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("refreshToken", refreshToken, {
      maxAge: 72 * 60 * 60 * 1000,
      secure: true,
    });
    res.json({
      _id: findUser?._id,
      firstName: findUser?.firstName,
      lastName: findUser?.lastName,
      email: findUser?.email,
      role: findUser?.role,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
      message: "Đăng nhập thành công",
      alert: true,
    });
  } else {
    res.send({ message: "Sai tài khoản hoặc mật khẩu", alert: false });
    throw new Error("Invalid Credentials");
  }
});

// Logout User
const logoutUserCtrl = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  console.log(cookie);
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  console.log(user);
  if (!user) {
    res.clearCookie("refreshToken", {
      secure: true,
    });
    return res.sendStatus(204);
  } else {
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: "" });
    res.clearCookie("refreshToken", { secure: true });
    res.json({
      alert: true,
    });
    return res.sendStatus(204);
  }
});

// Update a user
const updateOneUser = asyncHandler(async (req, res) => {
  const { _id } = await req.user;
  validateMongodbId(_id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updateUser);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = { createUser, loginUserCtrl, logoutUserCtrl, updateOneUser };
