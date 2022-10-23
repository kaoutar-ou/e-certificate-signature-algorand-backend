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
const ElementDeNote = require("../models/ElementDeNote");
const Note = require("../models/Note");

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

const createElementDeNote = async (req, res) => {
    const filiereAbbr = req.body.filiere;
    let filiere = await Filiere.findOne({
        where: sequelize.where(sequelize.fn('lower', sequelize.col('abbr')), sequelize.fn('lower', filiereAbbr))
    });
    if(filiere != null && filiere != undefined) {
        let elementDeNote = {
            nom: req.body.nom,
            description: req.body.description,
        };
        elementDeNote = await ElementDeNote.create(elementDeNote);
        elementDeNote.setFiliere(filiere);
        res.status(200).send({
            message: "Element de note created successfully",
            data: elementDeNote,
        });
    }
    else {
        res.status(500).send({
            message: "No filiere found",
        });
    }
}

const getAllEtudiants = async (req, res) => {
    // let etudiants = await Etudiant.findAll({include: [{model: User, as: "User"}, {model: AnneeUniversitaire, as: "AnneeUniversitaires"}, {model: Note, as: "Notes", include: [{model: ElementDeNote, as: "ElementDeNote", include: [{model: Filiere, as: "Filiere", include: [{model: Etablissement, as: "Etablissement", include: [{model: University, as: "University"}]}]}]}]}]});
    let etudiants = await Etudiant.findAll({include: [{model: User, as: "User"}, {model: AnneeUniversitaire, as: "AnneeUniversitaires"}, {model: Note, as: "Notes", include: [{model: ElementDeNote, as: "ElementDeNote", include: [{model: Filiere, as: "Filiere", include: [{model: Etablissement, as: "Etablissement", include: [{model: University, as: "University"}]}]}]}]}]});
    console.log(etudiants);
    res.status(200).send({
        message: "Etudiants fetched successfully",
        data: etudiants,
    });
}

module.exports = {
    createUniversity,
    createEtablissement,
    createFiliere,
    createElementDeNote,
    getAllEtudiants
}