const models = require("../models");
const User = models.user;
const Role = models.role;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const checkAuth = (req, res, err, user) => {
  if (err) {
    res.status(500).send({ message: err });
    return;
  }

  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }

  var passwordIsValid = bcrypt.compareSync(
    req.body.password,
    user.password
  );

  if (!passwordIsValid) {
    return res.status(401).send({ message: "Invalid Password!" });
  }

  if (user.mac != req.body.mac) {
    return res.status(401).send({ message: "Invalid Mac Address!" });
  }

  var token = jwt.sign({ id: user.id }, process.env.JWT_KEY, {
    expiresIn: 86400, // 24 hours
  });

  console.log(token);

  var authorities = [];

  for (let i = 0; i < user.roles.length; i++) {
    authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
  }

  req.session.token = token;

  res.status(200).send({
    id: user._id,
    username: user.username,
    email: user.email,
    roles: authorities,
    accessToken: token,
  });
}

const signin = (req, res) => {

  console.log(req.body);

  if (req.body.username.includes("@")) {

    User.findOne({
      email: req.body.username,
    })
      .populate("roles", "-__v")
      .exec((err, user) => {
        checkAuth(req, res, err, user);
      });
  }

  else {
    User.findOne({
      username: req.body.username,
    })
      .populate("roles", "-__v")
      .exec((err, user) => {
        checkAuth(req, res, err, user);
      });
  }


};

const signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    mac: req.body.mac,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  console.log(req.body);

  user.save((err, user) => {
    if (err) {
      console.log("err" + err);
      res.status(500).send({ message: err });
      return;
    }
    console.log("user");
    if (req.body.roles) {
      console.log(req.body.roles);
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      console.log("no roles");
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

module.exports = {
  signin,
  signup,
};
