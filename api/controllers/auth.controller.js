const Role = require("../models/Role");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const { verifyNewUserRequest, generateUsername, generatePassword, generateEmail, userExists, getNewAnneeUniversitaire, verifyNewEtudiantRequest } = require("../utils/user");
const Etudiant = require("../models/Etudiant");
const Filiere = require("../models/Filiere");
const sequelize = require("../../config/db");
const AnneeUniversitaire = require("../models/AnneeUniversitaire");
const fs = require('fs-extra');
const path = require('path');


const signup = async (req, res) => {

    if (verifyNewUserRequest(req.body)) {
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

        if (!(await userExists(user.username, user.email, user.cin))) {

            const password = generatePassword(16);
            user.password = password.hash;

            if (req.body.roles.includes("admin")) {
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
            } else if (req.body.roles.includes("etudiant")) {
                let etudiantRes;
                if (req.body.filiere) {
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
                            // TODO .. uncomment this
                            user.id && etudiantRes._id && await sendNewUserEmail(user, password.plain);
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

    } else {
        return res.status(400).send({ message: "Missing User required fields" });
    }
};



const checkAuth = async (req, res, user) => {

    if (!user) {
        res.status(404).send({ message: "User Not found." });
        return;
    }

    var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
    );

    if (!passwordIsValid) {
        return res.status(401).send({
            message: "Invalid Password!"
        });
    }

    var authorities = [];
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
        authorities.push("ROLE_" + roles[i].dataValues.name.toUpperCase());
    }


    var token = jwt.sign({ id: user.id, roles: authorities }, process.env.JWT_KEY, {
        expiresIn: 86400 // 24 hours
    });

    console.log("token", token);

    if (authorities.includes("ROLE_ETUDIANT")) {
        Etudiant.findOne({ where: { UserId: user.id }, include: [{ model: User, as: 'User' }] }).then((etudiant) => {

            const user = etudiant.User.dataValues;
            const student = etudiant.dataValues;
            delete student.User;
            student.user = user;

            req.session.token = token;
            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                roles: authorities,
                accessToken: token,
                student
            });
        })

    }
    else {

        if (req.body.mac && user.mac) {
            if (user.mac == req.body.mac) {
                req.session.token = token;
                res.status(200).send({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token
                });
            }

        }
        else {
            res.status(401).send({
                message: "Invalid MAC!"
            });

        }
    }

}

const signin = (req, res) => {
    if (req.body.username.includes("@")) {
        User.findOne({
            where: {
                email: req.body.username
            }
        }).then(async (user) => {
            await checkAuth(req, res, user);
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
    }
    else {
        User.findOne({
            where: {
                username: req.body.username
            }
        }).then(async (user) => {
            await checkAuth(req, res, user);
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
    }
}

const createEtudiant = async (req, res, user_id) => {

    if (user_id) {
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
                    console.log("🚀 ~ file: auth.controller.js ~ line 241 ~ createEtudiant ~ user_id", user_id)


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
                    message: "Internal server error 1",
                    error: error
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
    signin
};