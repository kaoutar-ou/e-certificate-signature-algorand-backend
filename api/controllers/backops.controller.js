const models = require("../models");
const AnneeUniversitaire = require("../models/anneeUniversitaire");
const Certificat = require("../models/certificat");
const Etablissement = require("../models/etablissement");
const Etudiant = require("../models/etudiant");
const Module = require("../models/module");
const University = require("../models/university");
const { sendEmail } = require("../utils/email");

const createUniverse = async (req, res) => {
    const university = new models.university({
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
    });

    try {
        const savedUniversity = await university.save();
        res.status(200).send({ message: "University created successfully ! ", savedUniversity });
    } catch (err) {
        res.status(500).send({ message: err });
    }
}

const createEtablissement = async (req, res) => {



    const etablissement = new models.etablissement({
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
        universite: req.body.universite,
    });



    try {

        University.findOne({ abbr: "UCA" }, (err, university) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            etablissement.universite = university._id;
            etablissement.save((err) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                res.status(200).send({ message: "Etablismment is registered successfully!" });
            });

            university.etablissements.push(etablissement);
            university.save((err) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
            });

        });


    } catch (err) {
        res.status(500).send({ message: err });
    }
}


const createFiliere = async (req, res) => {
    const filiere = new models.filiere({
        nom: req.body.nom,
        abbr: req.body.abbr,
        description: req.body.description,
        logo: req.body.logo,
        date_creation: req.body.date_creation,
        site_web: req.body.site_web,
        duree: req.body.duree,
        diplome: req.body.diplome,
    });

    try {

        Etablissement.findOne({ abbr: req.body.etablissement }, (err, etablissement) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            filiere.etablissement = etablissement._id;
            filiere.save((err) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                res.status(200).send({ message: "Filiere is created successfully!" });
            });

            etablissement.filieres.push(filiere);
            etablissement.save((err) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
            });

        });


    } catch (err) {
        res.status(500).send({ message: err });
    }
}

const getAllFilieres = async (req, res) => {
    Etablissement.findOne({ abbr: req.query.etablissement })
    .populate("filieres")
    .exec((err, etablissement) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.status(200).send({ message: "Filiere is created successfully!", etablissement });
    });

    // try {
    //     const filieres = await models.filiere.find();
    //     res.status(200).send(filieres);
    // } catch (err) {
    //     res.status(500).send({ message: err });
    // }
}

const sendEmailTest = async (req, res) => {
    let text_ = "Hello world from Node.js";
    let html_ = `
        <h1>Test email</h1>
        <p>Test email</p>
    `;
    let options = {
        to: req.body.to,
        subject: req.body.subject,
        text: text_,
        html: html_,
    }
    try {
        const sent = await sendEmail(options);
        res.status(200).send({ message: "Email sent successfully ! ", sent });
    } catch (err) {
        res.status(500).send({ message: err });
    }
}



const getAllEtudiants = async (req, res) => {

    const filiereAbbr = req.query.filiere;
    const searchString = req.query.search;
    const valide = req.query.valide;
    const certified = req.query.certified;
    const size = req.query.size ? req.query.size : 15;
    const page = req.query.page >= 1 ? req.query.page - 1 : 0;

    const filiere = await models.filiere.findOne({ abbr: filiereAbbr });

    let query = {};
    let filiereQuery = {};
    let valideQuery = {};
    let certifiedQuery = {};
    let searchQuery = {};
    let users;
    let certificats;

    let anneeUniversitaires;
    let anneeUniversitaireIds = [];

    if (filiere && filiere._id) {
        anneeUniversitaires = await AnneeUniversitaire.find({ filiere: filiere._id });
        anneeUniversitaireIds = anneeUniversitaires.map(anneeUniversitaire => anneeUniversitaire._id);

        filiereQuery = { annee_universitaires : { $in : anneeUniversitaireIds } };
    }

    if (valide == false) {

        anneeUniversitaires = await AnneeUniversitaire.find({ filiere: filiere._id, isAdmis: false });
        anneeUniversitaireIds = anneeUniversitaires.map(anneeUniversitaire => anneeUniversitaire._id);

        let array = [];
        for (let index = 0; index < filiere.duree; index++) {
            array.push({ [`annee_universitaires.${index}`]: { $in : anneeUniversitaireIds } });
        }

        valideQuery = { $or: array };
    }

    if (valide == true) {
        anneeUniversitaires = await AnneeUniversitaire.find({ filiere: filiere._id, isAdmis: true });
        anneeUniversitaireIds = anneeUniversitaires.map(anneeUniversitaire => anneeUniversitaire._id);

        let array = [];
        for (let index = 0; index < filiere.duree; index++) {
            array.push({ [`annee_universitaires.${index}`]: { $exists: true, $in: anneeUniversitaireIds } });
        }
        
        valideQuery = { $and: array };
    }

    if (certified == true) {
        certificats = Certificat.find(
            { 
                filiere: filiere._id,
            },
        )

        let certificatIds = [];

        if(certificats && certificats.length > 0) {
            certificatIds = certificats.map(certificat => certificat._id);
        }
        
        certifiedQuery = { certificats: { $in: certificatIds } };
    }

    if (certified == false) {
        certifiedQuery = { 
            "certificats.0": { $exists: false }
        };
    }
    
    if(searchString && searchString.length > 0) {
        
        users = await models.user.find({ 
            $or: [
                { nom: { $regex: searchString, $options: "i" } } ,
                { prenom: { $regex: searchString, $options: "i" } },
            ]
        });

        let userIds = [];

        if(users && users.length > 0) {
            userIds = users.map(user => user._id);
        }
        
        searchQuery = { 
            $or: [
                { telephone: { $regex: searchString, $options: "i" } },
                { user: { $in: userIds } },
            ]
         };

    }

    query = {
        $and: [
            filiereQuery,
            valideQuery,
            certifiedQuery,
            searchQuery,
        ]
    };
    try {
        // console.log(query);
        const etudiants = await Etudiant.find(query)
            .sort({ date_creation: -1 })
            .limit(size)
            .skip(size * page)
            .populate("user")
            .populate("annee_universitaires")
            // .populate({
            //     path: "annee_universitaires",
            //     populate: {
            //         path: "filiere",
            //         model: "Filiere",
            //     },
            // })
            .exec();
        
        res.status(200).send(etudiants);
        
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: err });
    }
}


const saveModule = async (req, res) => {
    const module = new Module({
        nom: req.body.nom,
        // abbr: req.body.abbr,
        // filiere: req.body.filiere,
        semestre: req.body.semestre,
        // coefficient: req.body.coefficient,
    });

    try {
        const savedModule = await module.save();
        res.status(200).send(savedModule);
    } catch (err) {
        res.status(500).send({ message: err });
    }
}

module.exports = {
    createUniverse,
    createEtablissement,
    createFiliere,
    getAllFilieres,
    sendEmailTest,
    getAllEtudiants
}


