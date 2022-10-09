const models = require("../models");
const User = models.user;
const Role = models.role;
const Filiere = models.filiere;
const Etudiant = models.etudiant
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AnneeUniversitaire = require("../models/anneeUniversitaire");
const { generateUsername, generatePassword, generateEmail, getNewAnneeUniversitaire, verifyNewUserRequest, userExists, verifyNewEtudiantRequest } = require("../utils/user");
const { sendNewUserEmail } = require("../utils/email");



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

const signup = async (req, res) => {
  
  if(verifyNewUserRequest(req.body)) {
    let user = new User({
      nom: req.body.nom,
      prenom: req.body.prenom,
      cin: req.body.cin,
    });
    
    user.username = generateUsername(user.nom, user.prenom);

    const roles = await Role.find({ name: { $in: req.body.roles } });
    user.roles = roles.map((role) => role._id);

    user.email = generateEmail(user.nom, user.prenom, roles[0].name);
    
    if(!(await userExists(user.username, user.email))) {
  
      const password = generatePassword(16);
      user.password = password.hash;
  
      if (req.body.roles.includes("admin")){
        try {
          user.mac = req.body.mac;
          await user.save();
          user._id && await sendNewUserEmail(user, password.plain);
          return res.send({ message: "User was registered successfully!" }); 
        } catch (error) {
          user._id && await User.findByIdAndDelete(user._id);
          return res.status(500).send({ message: error });
        }
      }
      else if (req.body.roles.includes("etudiant")){
        let etudiantRes;
        try {
          await user.save();
          etudiantRes = await createEtudiant(req, res, user._id);
          console.log(etudiantRes);
          if (etudiantRes.status == 200) {
            console.log("etudiant created");
            user._id && etudiantRes._id && await sendNewUserEmail(user, password.plain);
            return res.send({ message: "Student was registered successfully!" }); 
          } else {
            user._id && await User.findByIdAndDelete(user._id);
            etudiantRes._id && await Etudiant.findByIdAndDelete(etudiantRes._id);
            return res.status(etudiantRes.status ? etudiantRes.status : 500).send({ message: etudiantRes.message });
          }
        } catch (error) {
          user._id && await User.findByIdAndDelete(user._id);
            etudiantRes._id && await Etudiant.findByIdAndDelete(etudiantRes._id);
          return res.status(500).send({ message: error });
        }
      }
    }
    else {
      return res.status(500).send({ message: "User already exists!" });
    }

  } else{
    return res.status(400).send({ message: "Missing User required fields!" });
  }
};

const createEtudiant = async (req, res, user_id) => {

  if (verifyNewEtudiantRequest(req.body)) {
    let etudiant = new Etudiant({
      address: req.body.address,
      date_naissance: req.body.date_naissance,
      telephone: req.body.telephone,
      ville: req.body.ville,
      pays: req.body.pays,
      date_inscription: req.body.date_inscription,
      user: user_id,
      cne: req.body.cne,
      code_apogee: req.body.code_apogee,
    });

    let filiere 
    let anneeUniversitaire

    try {
      filiere = await Filiere.findOne({ abbr: req.body.filiere });

      // TODO .. change ...
      etudiant.date_sort = "12/10/2031"

      etudiant.filiere = filiere._id;

      etudiant = await etudiant.save();

      anneeUniversitaire = new AnneeUniversitaire({
        annee: getNewAnneeUniversitaire(),
        etudiant: etudiant._id,
      });

      anneeUniversitaire = await anneeUniversitaire.save();

      etudiant.annee_universitaires.push(anneeUniversitaire._id);

      etudiant = await etudiant.save();

      return {
        status: 200,
        _id: etudiant._id,
      };

    } catch (error) {
      anneeUniversitaire._id && await AnneeUniversitaire.findByIdAndRemove(anneeUniversitaire._id);
      etudiant._id && await Etudiant.findByIdAndRemove(etudiant._id);
      return { 
        status: 500,
        message: error 
      };
    }
  } else {
    return { 
      status: 400,
      message: "Missing Student required fields!" 
    };
  }
};













const signup_ = (req, res) => {
  const user = new User({
    nom: req.body.nom,
    prenom: req.body.prenom,
    cin: req.body.cin,
  });

  user.username = generateUsername(user.nom, user.prenom);
  user.password = generatePassword(16).hash;

  console.log(req.body);

  if(req.body.roles) { 
    if (req.body.roles.includes("admin")){
      user.email = generateEmail(user.nom, user.prenom, "admin");
      user.mac = req.body.mac;
    }
    else if (req.body.roles.includes("etudiant")){
      user.email = generateEmail(user.nom, user.prenom, "etudiant");
    }
  }

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

            sendNewUserEmail(user);

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

const createEtudiant_ = (req, res, user_id) => {


  const etudiant = new Etudiant({
    address: req.body.address,
    date_naissance: req.body.date_naissance,
    telephone: req.body.telephone,
    ville: req.body.ville,
    pays: req.body.pays,
    date_inscription: req.body.date_inscription,
    user: user_id,
    cne: req.body.cne,
    code_apogee: req.body.code_apogee,
  });

  console.log(req.body);

  etudiant.date_sort = "12/10/2031"

  etudiant.save((err, etudiant) => {
    if (err) {
      console.log("err" + err);
      res.status(500).send({ message: err });
      return;
    }
    console.log("etudiant");

    const anneeUniversitaire = new AnneeUniversitaire({
      annee: getNewAnneeUniversitaire(),
      etudiant: etudiant._id,
    });

    anneeUniversitaire.save((err, anneeUniversitaire) => {
      if (err) {
        console.log("err" + err);
        res.status(500).send({ message: err });
        return;
      }
      console.log("anneeUniversitaire");
      etudiant.annee_universitaires.push(anneeUniversitaire._id);
    });
      

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

            // res.send({ message: "Etudiant was registered successfully!" });
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
