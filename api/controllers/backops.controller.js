const models = require("../models");
const University = require("../models/university");

const createUniverse = async (req, res) => {
    const university = new models.university({
        nom: req.body.nom,
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
        adresse: req.body.adresse,
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

        University.findOne({ abbr: "uca" }, (err, university) => {
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
        });

    } catch (err) {
        res.status(500).send({ message: err });
    }
}


module.exports = {
    createUniverse,
    createEtablissement
}


