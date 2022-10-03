const models = require("../models");
const User = models.user;
const Role = models.role;
const Filiere = models.filiere;
const Etudiant = models.etudiant
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
            if (req.body.roles.includes("etudiant")) {
              createEtudiant(req, res, user._id);
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {

      Role.findOne({ name: "etudiant" }, (err, role) => {
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

const createEtudiant = (req, res, user_id) => {


  const etudiant = new Etudiant({
    address: req.body.address,
    date_naissance: req.body.date_naissance,
    telephone: req.body.telephone,
    ville: req.body.ville,
    pays: req.body.pays,
    date_inscription: req.body.date_inscription,
    date_sort: req.body.date_sort,
    site_web: req.body.site_web,
    user: user_id,

  });

  console.log(req.body);

  etudiant.save((err, etudiant) => {
    if (err) {
      console.log("err" + err);
      res.status(500).send({ message: err });
      return;
    }
    console.log("etudiant");
    if (req.body.filiere) {
      console.log(req.body.filiere);
      Filiere.findOne(
        {
          abbr: req.body.filiere,
        },
        (err, filiere) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          etudiant.filiere = filiere._id
          etudiant.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "Etudiant was registered successfully!" });
          });
        }
      );
    } else {
      res.send({ message: "Etudiant was registered successfully!" });
    }
  });




};

module.exports = {
  signin,
  signup,
};
