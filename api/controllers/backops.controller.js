const Role = require("../models/Role");
const User = require("../models/User");
const University = require("../models/University");
const Etablissement = require("../models/Etablissement");
const Filiere = require("../models/Filiere");
const Etudiant = require("../models/Etudiant");
const AnneeUniversitaire = require("../models/AnneeUniversitaire");

const sequelize = require("../../config/db");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

const createUniversity = async (req, res) => {
    let university = {
        nom: req.body.nom,
        abbr: req.body.abbr,
        adresse: req.body.adresse,
        telephone: req.body.telephone,
        email: req.body.email,
        code_postal: req.body.code_postal,
        ville: req.body.ville,
        pays: req.body.pays,
        site_web: req.body.site_web,
        logo: req.body.logo,
        description: req.body.description,
        date_creation: req.body.date_creation,
    };
    
    try {
        university = await University.create(university);
        res.status(200).send({
            message: "University created successfully",
            university: university,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error while creating university",
        });
    }
}

const createEtablissement = async (req, res) => {
    let etablissement = {
        nom: req.body.nom,
        abbr: req.body.abbr,
        adresse: req.body.adresse,
        email: req.body.email,
        telephone: req.body.telephone,
        code_postal: req.body.code_postal,
        ville: req.body.ville,
        site_web: req.body.site_web,
        logo: req.body.logo,
        description: req.body.description,
        date_creation: req.body.date_creation,
        pays: req.body.pays,
    };

    if(req.body.universite) {
        try {
            etablissement = await Etablissement.create(etablissement);

            let university = University.findOne({
                where: sequelize.where(sequelize.fn('lower', sequelize.col('abbr')), sequelize.fn('lower', req.body.universite))
            }).then((universite) => {
                universite.addEtablissement(etablissement);
                return universite;
            });

            console.log(university);
            etablissement.setUniversity(university.id);
        
            res.status(200).send({
                message: "Etablissement created successfully",
                etablissement: etablissement,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "Error while creating etablissement",
            });
        }
    } else {
        res.status(500).send({
            message: "Error while creating etablissement",
        });
    }
}

const createFiliere = async (req, res) => {
    let filiere = {
        nom: req.body.nom,
        abbr: req.body.abbr,
        description: req.body.description,
        logo: req.body.logo,
        date_creation: req.body.date_creation,
        site_web: req.body.site_web,
        duree: req.body.duree,
        diplome: req.body.diplome,
    };

    if(req.body.etablissement) {
        try {
            filiere = await Filiere.create(filiere);

            let etablissement = Etablissement.findOne({
                where: sequelize.where(sequelize.fn('lower', sequelize.col('abbr')), sequelize.fn('lower', req.body.etablissement))
            }).then((etablissement) => {
                etablissement.addFiliere(filiere);
                return etablissement;
            });
            console.log(etablissement);
            filiere.setEtablissement(etablissement.id);
            
            res.status(200).send({
                message: "Filiere created successfully",
                filiere: filiere,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "Error while creating filiere",
            });
        }
    } else {
        res.status(500).send({
            message: "Error while creating filiere",
        });
    }
}


    module.exports = {
        createUniversity,
        createEtablissement,
        createFiliere
    }