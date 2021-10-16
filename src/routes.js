const router = require("express").Router();
const homeController = require("./controllers/homeController.js");

const userController = require("./controllers/userController.js");
const courseController = require("./controllers/courseController.js");

//debug
// function logger(req, res, next) {
//   console.log(req.path);
//   next();
// }
// router.use(logger);

router.use("/", homeController);
router.use("/user", userController);
router.use("/course", courseController);
router.use("*", (req, res) => {
  console.log("called 404");
  res.status(404).render("404");
});

module.exports = router;
