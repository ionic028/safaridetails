const express = require("express");

const app = express();
const path = require("path");

const userModel = require("./models/user");
const postModel = require("./models/post");

const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());


app.get("/", (req, res) => {
  res.render("index");
});

app.post("/register", async (req, res) => {
  let { email, password, username, name, age } = req.body;

  let user = await userModel.findOne({ email });
  if (user) return res.status(500).send("user already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        email,
        age,
        name,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
      res.cookie("token", token);
      res.redirect("/login");
    });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something went wrong!");

  bcrypt.compare(password, user.password, (err, result) => {
    if(result){
    let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
    res.cookie("token", token);
    res.status(200).redirect("/profile");
    }
    else res.redirect("/login");
  });
});

app.get("/profile", isLoggedIn,async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email }).populate("posts");
  res.render("profile");
});
app.post("/create", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne ({ email: req.user.email});
  let {
    checkin,
    checkout,
    place,
    zone,
    day,
    gypsynumber,
    driver,
    gypsyby,
    gypsypayment,
    collection,
    expense,
    petrol,
  } = req.body;

  let createdUser = await postModel.create({
    checkin,
    checkout,
    place,
    zone,
    day,
    gypsynumber,
    driver,
    gypsyby,
    gypsypayment,
    collection,
    expense,
    petrol,
    user: user._id ,
  });
  user.posts.push(createdUser._id);
  await user.save();

  res.redirect("/read");
});


app.get("/logout", (req, res) => {
  res.clearCookie("token","");
  res.redirect("/login");
});







app.get("/read",isLoggedIn, async (req, res) => {
  let users = await userModel.findOne({ email: req.user.email }).populate("posts");
 
  res.render("read", { users });
});

app.get("/edit/:userid", isLoggedIn, async (req, res) => {
  let user = await postModel.findOne({ _id: req.params.userid });
  res.render("edit", { user });
});

app.post("/update/:userid",isLoggedIn, async (req, res) => {
  let {
    checkin,
    checkout,
    place,
    zone,
    day,
    gypsynumber,
    driver,
    gypsyby,
    gypsypayment,
    collection,
    expense,
    petrol,
  } = req.body;
  let user = await postModel.findOneAndUpdate(
    { _id: req.params.userid },
    {
      checkin,
      checkout,
      place,
      zone,
      day,
      gypsynumber,
      driver,
      gypsyby,
      gypsypayment,
      collection,
      expense,
      petrol,
    },
    { new: true }
  );
  res.redirect("/read");
});

app.get("/delete/:id", isLoggedIn, async (req, res) => {
  let deletedUser = await postModel.findOneAndDelete({ _id: req.params.id });
  res.redirect("/read");
});

function isLoggedIn(req, res, next) {
  if (!req.cookies.token) {
    return res.redirect("/login");
  } else {
    try {
      let data = jwt.verify(req.cookies.token, "shhhh");
      req.user = data;
      next();
    } catch (error) {
      return res.send("Invalid or expired token");
    }
  }
}
app.listen(process.env.PORT || 3000, function () {
  console.log("running");
});
