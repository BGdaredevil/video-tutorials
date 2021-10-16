const router = require("express").Router();

const getToken = require("../utils/getToken.js");
const cookie_name = require("../index.js").cookie_name;
const userService = require("../services/userService.js");
const { isAuth } = require("../middlewares/userMiddleware.js");

const register = async (req, res) => {
  const escapedUser = {
    username: req.body.username.trim(),
    password: req.body.password.trim(),
    repeatPassword: req.body.repeatPassword.trim(),
    passMatch: req.body.password.trim() === req.body.repeatPassword.trim(),
  };

  if (Object.values(escapedUser).includes("")) {
    console.log("empty detected");
    escapedUser.error = [{ message: "All fields are mandatory" }];
    res.render("user/register", escapedUser);
    return;
  }

  if (!escapedUser.passMatch) {
    escapedUser.error = [{ message: "Passwords do not match" }];
    res.render("user/register", escapedUser);
    return;
  }
  console.log(await userService.checkUsername(escapedUser.username));

  if (await userService.checkUsername(escapedUser.username)) {
    escapedUser.error = [{ message: "This username is taken" }];
    res.render("user/register", escapedUser);
    return;
  }

  try {
    const newUser = await userService.register(escapedUser);
    const token = await getToken(newUser);
    res.cookie(cookie_name, token);
    res.redirect("/");
  } catch (err) {
    const errKeys = Object.keys(err?.errors);
    if (errKeys.includes("username") || errKeys.includes("password")) {
      const errMess = [err.errors.username?.message, err.errors.password?.message]
        .filter((e) => e != undefined)
        .map((e) => ({ message: e }));
      escapedUser.error = errMess;
      res.render(`user/register`, escapedUser);
    } else {
      throw err;
    }
  }
};

const login = async (req, res) => {
  const data = {
    username: req.body.username.trim(),
    password: req.body.password.trim(),
  };

  try {
    const user = await userService.login(data);
    if (!user) {
      data.error = [{ message: "Invalid username or password" }];
      return res.render("user/login", data);
    }

    const token = await getToken(user);
    res.cookie(cookie_name, token);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};

const logout = (req, res) => {
  res.clearCookie(cookie_name);
  res.redirect("/");
};

const profile = async (req, res) => {
  const user = await userService.getUser(req.user.id);
  user.enrolledList = user.enrolledList.map((l) => l.title).join(", ");
  res.render("user/myProfile", user);
};

router.get("/register", (req, res) => res.render("user/register"));
router.post("/register", register);
router.get("/login", (req, res) => res.render("user/login"));
router.post("/login", login);
router.get("/profile", isAuth, profile);
router.get("/logout", isAuth, logout);

module.exports = router;
