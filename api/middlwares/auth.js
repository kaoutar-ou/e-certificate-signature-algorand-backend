const jwt = require("jsonwebtoken");
require('dotenv').config();
const models = require("../models");
const User = models.user;
const Role = models.role;
const Etudiant = models.etudiant;


const verifyToken = (req, res, next) => {
    let token = req.session.token || req.headers["x-access-token"];


    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        console.log("decoded", decoded);
        req.userId = decoded.id;
        next();
    });
};

const isEtudiant = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "etudiant") {
                    next();
                    return;
                }
            }
            res.status(403).send({ message: "Require Etudiant Role!" });
            return;
        });
    });
};

const isAdmin = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "admin") {
                    next();
                    return;
                }
            }
            res.status(403).send({ message: "Require Admin Role!" });
            return;
        });
    });
};

const isSuperAdmin = (req, res, next) => {
    console.log("req.userId", req.userId);
    User.findByPk(req.userId).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "super_admin") {
                    next();
                    return;
                }
            }
            res.status(403).send({ message: "Require Super Admin Role!" });
            return;
        });
    });
};


const authJwt = {
    verifyToken,
    isEtudiant,
    isAdmin,
    isSuperAdmin
};

module.exports = authJwt;

