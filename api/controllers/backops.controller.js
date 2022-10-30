const Role = require("../models/Role");
const User = require("../models/User");
const University = require("../models/University");
const Etablissement = require("../models/Etablissement");
const Filiere = require("../models/Filiere");
const Etudiant = require("../models/Etudiant");
const AnneeUniversitaire = require("../models/AnneeUniversitaire");

const sequelize = require("../../config/db");
const { Op, where } = require("sequelize");
const Sequelize = require("sequelize");
const Jimp = require("jimp");
const ElementDeNote = require("../models/ElementDeNote");
const Note = require("../models/Note");
const { getNewAnneeUniversitaire } = require("../utils/user");
const Certificat = require("../models/Certificat");

const path = require("path");
const fs = require("fs-extra");

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

    if (req.body.universite) {
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

    if (req.body.etablissement) {
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
    if (filiere != null && filiere != undefined) {
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

const getAllFilieres = async (req, res) => {
    const filieres = await Filiere.findAll({
        include: [
            {
                model: Etablissement,
                as: "Etablissement",
                include: [
                    {
                        model: University,
                        as: "University",
                    }
                ]
            }
        ]
    });
    res.status(200).send({
        message: "Filieres fetched successfully",
        filieres,
    });
}

const getAllAnneeUniversitaires = async (req, res) => {
    filiereAbbr = req.query.filiere;
    let filiere = await Filiere.findOne({
        where: sequelize.where(sequelize.fn('lower', sequelize.col('abbr')), sequelize.fn('lower', filiereAbbr))
    });

    let anneeUniversitaires = [];
    let annees = new Set([]);
    if (filiere != null && filiere != undefined) {
        console.log("filiere found");
        anneeUniversitaires = await AnneeUniversitaire.findAll({
            attributes: ["annee"],
            where: {
                FiliereId: filiere.id,
                // where: [sequelize.fn('DISTINCT', sequelize.col('annee')), 'annee']
            }
        });
    }
    else {
        anneeUniversitaires = await AnneeUniversitaire.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('annee')), 'annee']],
        });
    }

    anneeUniversitaires.map((anneeUniversitaire) => annees.add(anneeUniversitaire.annee));

    if (!annees.has(getNewAnneeUniversitaire())) {
        annees.add(getNewAnneeUniversitaire());
    }

    res.status(200).send({
        message: "Annee universitaires fetched successfully",
        anneeUniversitaires: Array.from(annees),
    });
}

const getAllEtudiants = async (req, res) => {
    // // let etudiants = await Etudiant.findAll({include: [{model: User, as: "User"}, {model: AnneeUniversitaire, as: "AnneeUniversitaires"}, {model: Note, as: "Notes", include: [{model: ElementDeNote, as: "ElementDeNote", include: [{model: Filiere, as: "Filiere", include: [{model: Etablissement, as: "Etablissement", include: [{model: University, as: "University"}]}]}]}]}]});
    // let etudiants = await Etudiant.findAll({include: [{model: User, as: "User"}, {model: AnneeUniversitaire, as: "AnneeUniversitaires"}, {model: Note, as: "Notes", include: [{model: ElementDeNote, as: "ElementDeNote", include: [{model: Filiere, as: "Filiere", include: [{model: Etablissement, as: "Etablissement", include: [{model: University, as: "University"}]}]}]}]}]});
    // console.log(etudiants);
    // res.status(200).send({
    //     message: "Etudiants fetched successfully",
    //     etudiants,
    // });

    const filiereAbbr = req?.query?.filiere ? req.query.filiere : null;
    const searchString = req?.query?.search ? req.query.search : null;
    const valide = (req?.query?.valide != null && req?.query?.valide != undefined) ? req.query.valide : null;
    const certified = (req?.query?.certified != null && req?.query?.certified != undefined) ? req.query.certified : null;
    const size = req.query.size ? req.query.size : 15;
    const page = req.query.page >= 1 ? req.query.page - 1 : 0;

    // const annee = req.query.annee ? req.query.annee : getNewAnneeUniversitaire();
    const annee = req.query.annee ? req.query.annee : null;


    let filiere = null;
    let duree = -1;
    if (filiereAbbr != null && filiereAbbr != undefined) {
        filiere = await Filiere.findOne({
            where: sequelize.where(sequelize.fn('lower', sequelize.col('abbr')), sequelize.fn('lower', filiereAbbr))
        });
        if (filiere != null && filiere != undefined) {
            duree = filiere.duree;
        }
    }

    let where = {};

    if (searchString != null && searchString != undefined && searchString != "") {
        where = {
            [Sequelize.Op.or]: [
                { "$User.nom$": { [Sequelize.Op.like]: "%" + searchString + "%" } },
                { "$User.prenom$": { [Sequelize.Op.like]: "%" + searchString + "%" } },
                { "$User.cin$": { [Sequelize.Op.like]: "%" + searchString + "%" } },
                { "$User.email$": { [Sequelize.Op.like]: "%" + searchString + "%" } },
                { "$User.username$": { [Sequelize.Op.like]: "%" + searchString + "%" } },
                { cne: { [Sequelize.Op.like]: "%" + searchString + "%" } },
                { address: { [Sequelize.Op.like]: "%" + searchString + "%" } },
                { ville: { [Sequelize.Op.like]: "%" + searchString + "%" } },
                { pays: { [Sequelize.Op.like]: "%" + searchString + "%" } },
            ]
        }
    }

    // if (annee != null && annee != undefined) {
    //     where = {
    //         [Sequelize.Op.and]: [
    //             where,
    //             { "$AnneeUniversitaires.annee$": annee }
    //         ]
    //     }
    // }

    if (filiere != null && filiere != undefined && filiere.id != null && filiere.id != undefined) {
        where = {
            [Sequelize.Op.and]: [
                where,
                { "$AnneeUniversitaires.Filiere.id$": filiere.id }
            ]
        }
    }
    // if(valide != null && valide != undefined) {
    //     where.valide = valide;
    // }
    // if(certified != null && certified != undefined) {
    //     where.certified = certified;
    // }

    let include = [];


    // let userWhere = {};

    // if(searchString != null && searchString != undefined && searchString != "") {
    //     userWhere = {
    //         [Op.or]: [
    //             { nom: { [Sequelize.Op.like] : "%" + searchString + "%" } },
    //             { prenom: { [Sequelize.Op.like] : "%" + searchString + "%" } },
    //             { cin: { [Sequelize.Op.like] : "%" + searchString + "%" } },
    //             { email: { [Sequelize.Op.like] : "%" + searchString + "%" } },
    //             { username: { [Sequelize.Op.like] : "%" + searchString + "%" } },
    //         ]
    //     }
    // }

    include.push(
        {
            model: User,
            as: "User",
            // where: userWhere,
        }
    );

    include.push(
        {
            model: Certificat,
            as: "Certificats",
        }
    );

    include.push(
        {
            model: Note,
            as: "Notes",
            include: [
                {
                    model: ElementDeNote,
                    as: "ElementDeNote",
                    include: [
                        {
                            model: Filiere,
                            as: "Filiere",
                            where: sequelize.where(sequelize.fn('lower', sequelize.col('abbr')), sequelize.fn('lower', filiereAbbr)),
                            attributes: ["abbr"],
                        }
                    ]
                }
            ]
        }
    );

    let anneeCriteria = {
        model: AnneeUniversitaire,
        as: "AnneeUniversitaires",
        // where: {
        //     annee: annee,
        // },
        include: [
            {
                model: Filiere,
                as: "Filiere",
                // where: sequelize.where(sequelize.fn('lower', sequelize.col('abbr')), sequelize.fn('lower', filiereAbbr)),
                where: {
                    abbr: filiereAbbr,
                },
                include: [
                    {
                        model: Etablissement,
                        as: "Etablissement",
                        include: [
                            {
                                model: University,
                                as: "University",
                            }
                        ]
                    }
                ]
            }
        ]
    };

    // if(annee) {
    //     anneeCriteria.where = {
    //         annee: annee,
    //     }
    // }

    include.push(anneeCriteria);

    let limit = parseInt(size);
    let offset = parseInt(page) * parseInt(size);

    let criteria = {}

    criteria.where = where;
    criteria.include = include;
    // criteria.limit = limit;
    // criteria.offset = offset;

    let etudiants = {};
    etudiants.count = 0;
    etudiants.rows = await Etudiant.findAll(criteria);

    if (certified == true) {
        etudiants.rows = etudiants.rows.filter((etudiant) => etudiant.Certificats.length > 0);
    }
    if (certified == false) {
        etudiants.rows = etudiants.rows.filter((etudiant) => etudiant.Certificats.length == 0);
    }

    if (valide == true) {
        etudiants.rows = etudiants.rows.filter((etudiant) => {
            let admis = 0;
            etudiant.AnneeUniversitaires.map((anneeUniversitaire) => anneeUniversitaire.isAdmis == true ? admis++ : null);
            console.log(admis);
            let result = (admis == duree) ? true : false;
            return result;
        });
    }

    if (valide == false) {
        etudiants.rows = etudiants.rows.filter((etudiant) => {
            let admis = 0;
            etudiant.AnneeUniversitaires.map((anneeUniversitaire) => anneeUniversitaire.isAdmis == true ? admis++ : null);
            console.log(admis);
            let result = (admis < duree) ? true : false;
            return result;
        });
    }

    if (valide == false) {
        etudiants.rows = etudiants.rows.filter((etudiant) => !etudiant.valide);
    }

    etudiants.count = etudiants.rows.length;

    res.status(200).send({
        message: "Etudiants fetched successfully",
        etudiants,
    });
}

const getAllCertificatsByFiliere = async (req, res) => {

    let filiereAbbr = req?.query?.filiere ? req.query.filiere : null;

    let certificats = await Certificat.findAll({
        where: {
            txnHash: null,
        },
        include: [
            {
                model: Etudiant,
                as: "Etudiant",
                include: [
                    {
                        model: User,
                        as: "User",
                    }
                ]
            },
            {
                model: Filiere,
                as: "Filiere",
                where: {
                    abbr: filiereAbbr,
                },
            }
        ]
    });

    return res.status(200).send(
        {
            certificats
        }
    )
}


const uploadProfileImage = async (req, res) => {

    // console.log(req)


    fs.ensureDirSync(path.join(process.cwd(), 'process', 'canvas'));
    const maxSize = 8 * 1024 * 1024;

    if (!req.files.file) {
        return res.status(400).send({
            message: "Please upload a file!",
        });
    }


    if (req.files.file > maxSize) {
        return res.status(400).send(
            {
                message: "File size cannot be larger than 8MB!",
            }
        );
    }


    const logo = req.files.file.name;
    console.log(logo)
    const filename = path.join(process.cwd(), 'process', 'canvas', logo);
    console.log(filename);
    const file = req.files.file;

    if (!logo.includes('png')) {

        file.mv(filename, async (err) => {
            if (err) {
                return res.status(500).send({ message: err });
            }

            Jimp.read(filename, function (err, image) {

                if (err) {
                    return res.status(500).send({ message: "Unsupported MIME type: image/*" });
                }
                else {
                    image
                        .resize(400, 150)
                        .quality(95)
                        .write(path.join(process.cwd(), 'process', 'canvas', logo.split('.')[0] + '.png'))

                    fs.unlinkSync
                        (
                            path.join(process.cwd(), 'process', 'canvas', logo)
                        )

                    return res.status(200).send({
                        message: "File uploaded successfully",
                    });

                }
            })
        })

    }

    else {
        file.mv(filename, async (err) => {
            if (err) {
                return res.status(500).send({ message: err });
            }
            return res.status(200).send({
                message: "File uploaded successfully",
            });
        })
    }



}


const getEtablissments = (req, res) => {
    const etabAbbr = [];
    Etablissement.findAll().then((etablissements) => {
        etablissements.map((etablissement) => {
            etabAbbr.push(etablissement.abbr);
        })
        return res.status(200).send({
            etablissements,
           etabs: etabAbbr,
        });
    }).catch((err) => {
        return res.status(500).send({
            message: err.message || "Some error occurred while retrieving etablissements.",
        });
    });
}


module.exports = {
    createUniversity,
    createEtablissement,
    createFiliere,
    createElementDeNote,
    getAllEtudiants,
    getAllFilieres,
    getAllAnneeUniversitaires,
    getAllCertificatsByFiliere,
    uploadProfileImage,
    getEtablissments
}