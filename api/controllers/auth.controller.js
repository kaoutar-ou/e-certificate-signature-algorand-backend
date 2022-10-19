const Role = require("../models/Role");
const User = require("../models/User");
const Sequelize = require("sequelize");
const { verifyNewUserRequest, generateUsername, generatePassword, generateEmail, userExists, getNewAnneeUniversitaire, verifyNewEtudiantRequest } = require("../utils/user");
const Etudiant = require("../models/Etudiant");
const Filiere = require("../models/Filiere");
const sequelize = require("../../config/db");
const AnneeUniversitaire = require("../models/AnneeUniversitaire");

const signup = async (req, res) => {
  
    if(verifyNewUserRequest(req.body)) {
      let user = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        cin: req.body.cin,
      };
      
      user.username = generateUsername(user.nom, user.prenom);
  
      const roles = await Role.findAll({ 
        where:
            {
                name: {
                    [Sequelize.Op.in]: req.body.roles
                }
            }
        }).then((roles) => {
            return roles
        });


      let rolesNames = [];
      rolesNames = roles.map((role) => role.dataValues.name);
      user.email = generateEmail(user.nom, user.prenom, rolesNames);
      
      if(!(await userExists(user.username, user.email, user.cin))) {
    
        const password = generatePassword(16);
        user.password = password.hash;
    
        if (req.body.roles.includes("admin")){
          console.log("admin");
          try {
            user.mac = req.body.mac;
            user = await User.create(user);

            user.setRoles(roles.map((role) => role.dataValues.id)).then(() => {
                console.log("User was registered successfully!");
                }).catch((error) => {
                    console.log("error");
                    console.log("error", error);
                });

            // TODO .. uncomment this
            // user.id && await sendNewUserEmail(user, password.plain);
            return res.send({ message: "User was registered successfully" }); 
          } catch (error) {
            // user._id && await User.findByIdAndDelete(user._id);
            console.log("error");
            console.log("error", error);
            return res.status(500).send({ message: "Internal server error" });
          }
        } else if (req.body.roles.includes("etudiant")){
            let etudiantRes;
            if(req.body.filiere) {
                try {
                user = await User.create(user);

                user.setRoles(roles.map((role) => role.dataValues.id)).then(() => {
                    console.log("User was registered successfully!");
                    }).catch((error) => {
                        console.log("error");
                        console.log("error", error);
                    });
                    
                etudiantRes = await createEtudiant(req, res, user.id);
                console.log(etudiantRes);
                if (etudiantRes.status == 200) {
                    console.log("etudiant created");
                    // TOSO .. uncomment this
                    // user.id && etudiantRes._id && await sendNewUserEmail(user, password.plain);
                    return res.send({ message: "Student was registered successfully" }); 
                } else {
                    // user._id && await User.findByIdAndDelete(user._id);
                    // etudiantRes._id && await Etudiant.findByIdAndDelete(etudiantRes._id);
                    return res.status(etudiantRes.status ? etudiantRes.status : 500).send({ message: etudiantRes.message });
                }
                } catch (error) {
                //   user._id && await User.findByIdAndDelete(user._id);
                //   etudiantRes._id && await Etudiant.findByIdAndDelete(etudiantRes._id);
                //   etudiantRes._id && await Filiere.findByIdAndUpdate(etudiantRes.filiereID, { $pull: { etudiants: etudiantRes._id } });
                console.log(error);
                return res.status(500).send({ message: "Internal server error" });
                }
            } else {
                return res.status(400).send({ message: "Filiere is required" });
            }
          }
      } 
      else {
        return res.status(500).send({ message: "User already exists" });
      }
  
    } else{
      return res.status(400).send({ message: "Missing User required fields" });
    }
  };






  const createEtudiant = async (req, res, user_id) => {

    if(user_id) {
        if (verifyNewEtudiantRequest(req.body)) {
        let etudiant = {
            address: req.body.address,
            date_naissance: req.body.date_naissance,
            telephone: req.body.telephone,
            ville: req.body.ville,
            pays: req.body.pays,
            date_inscription: req.body.date_inscription,
            cne: req.body.cne,
            code_apogee: req.body.code_apogee,
        };
    
        let filiere 
        let anneeUniversitaire
    
        try {
            filiere = await Filiere.findOne({
                where: sequelize.where(sequelize.fn('lower', sequelize.col('abbr')), sequelize.fn('lower', req.body.filiere))
            });
            
            // TODO .. change ...
            etudiant.date_sortie = ""
    
            if (filiere) {

                etudiant = await Etudiant.create(etudiant);
                
                etudiant.setUser(user_id);

                anneeUniversitaire = {
                    annee: getNewAnneeUniversitaire(),
                    EtudiantId: etudiant.id,
                    FiliereId: filiere.id
                };

                console.log(anneeUniversitaire);
        
                anneeUniversitaire = await AnneeUniversitaire.create(anneeUniversitaire);

                // etudiant.addAnneeUniversitaire(anneeUniversitaire.id);
                anneeUniversitaire.setEtudiant(etudiant.id);
        
                return {
                status: 200,
                _id: etudiant.id,
                filiereID: filiere.id,
                };
            } else {
                return {
                status: 404,
                message: "Filiere not found",
                };
            }
        } catch (error) {
            // anneeUniversitaire._id && await AnneeUniversitaire.findByIdAndRemove(anneeUniversitaire._id);
            // etudiant._id && await Etudiant.findByIdAndRemove(etudiant._id);
            // filiere._id && await Filiere.findByIdAndUpdate(filiere._id, { $pull: { etudiants: etudiant._id } });
            console.log(error);
            return { 
            status: 500,
            message: "Internal server error" 
            };
        }
        } else {
        return { 
            status: 400,
            message: "Missing Student required fields!" 
        };
        }
    } else {
        return { 
            status: 400,
            message: "Missing User" 
        };
    }
  };



  module.exports = {
    signup,
    };