const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const saltRounds = require("../../index.js").saltRounds;

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: [5, "Username is too short"],
    unique: true,
    validate: [
      /^[a-z0-9]+$/i,
      "Username must be only letters and numbers. No special characters allowed.",
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: [5, "Password is too short"],
    validate: [
      /^[a-z0-9]+$/i,
      "Password must be only letters and numbers. No special characters allowed.",
    ],
  },
  enrolledList: [{ type: mongoose.Schema.Types.ObjectId, ref: "course" }],
});

UserSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

UserSchema.method("verifyPass", function (pass) {
  return bcrypt.compare(pass, this.password);
});

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
