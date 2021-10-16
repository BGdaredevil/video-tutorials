const router = require("express").Router();

const { isAuth } = require("../middlewares/userMiddleware.js");
const houseService = require("../services/houseServise.js");

const create = async (req, res) => {
  const escapedHome = req.body;

  if (Object.values(escapedHome).includes("")) {
    console.log("empty detected");
    escapedHome.error = { message: "All fields are mandatory" };
    res.render("house/create", escapedHome);
    return;
  }

  if (!escapedHome.isValidUrl) {
    escapedHome.error = { message: "Please use a valid URL" };
    res.render("house/create", escapedHome);
    return;
  }

  try {
    escapedHome.owner = req.user.id;
    await houseService.create(escapedHome);
  } catch (err) {
    console.log(err);
  }

  res.redirect("/");
};

const details = async (req, res) => {
  const viewObj = {};
  const house = await houseService.getOne(req.params.id);
  viewObj.house = house;
  viewObj.isOwner = house.owner == req?.user?.id;
  viewObj.isTenant = house.tenants.some((x) => x._id == req?.user?.id);
  viewObj.available = house.availablePieces - house.tenants.length;
  if (house.tenants.length === 0) {
    house.tenants = false;
  } else {
    house.tenants = house.tenants.map((t) => t.fullName).join(", ");
  }
  res.render("house/details", viewObj);
};

const allHouses = async (req, res) => {
  const viewObj = {};
  const houses = await houseService.getAll();
  if (houses.length > 0) {
    viewObj.houses = houses;
  }

  res.render("house/allList", viewObj);
};

const loadEdit = async (req, res) => {
  const house = await houseService.getOne(req.params.id);
  console.log(house);
  res.render("house/edit", house);
};

const edit = async (req, res) => {
  console.log(req.params.id);
  const escapedHouse = houseEscape(req.body);

  if (Object.values(escapedHouse).includes("")) {
    console.log("empty detected");
    escapedHouse.error = { message: "All fields are mandatory" };
    res.render(`house/edit/${req.params.id}`, escapedHouse);
    return;
  }

  if (!escapedHouse.isValidUrl) {
    escapedHouse.error = { message: "Please use a valid URL" };
    res.render(`house/edit/${req.params.id}`, escapedHouse);
    return;
  }

  try {
    console.log(escapedHouse);
    await houseService.updateOne(req.params.id, escapedHouse);
    res.redirect(`/house/details/${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
};

const rentOut = async (req, res) => {
  try {
    await houseService.rent(req.params.id, req.user);
    res.redirect(`/house/details/${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
};

const remove = async (req, res) => {
  try {
    await houseService.deleteOne(req.params.id);
    res.redirect("/house");
  } catch (err) {
    console.log(err);
  }
};

const search = async (req, res) => {
  const list = await houseService.search(req.body.nameQuery);
  const viewObj = {};
  if (list.length > 0) {
    viewObj.houses = list;
  }
  res.render("house/search", viewObj);
};

router.get("/", allHouses);
router.get("/create", isAuth, (req, res) => res.render("house/create"));
router.post("/create", isAuth, create);
router.get("/search", (req, res) => res.render("house/search"));
router.post("/search", search);
router.get("/edit/:id", isAuth, loadEdit);
router.post("/edit/:id", isAuth, edit);
router.get("/details/:id", details);
router.get("/rent/:id", isAuth, rentOut);
router.get("/delete/:id", isAuth, remove);

module.exports = router;
