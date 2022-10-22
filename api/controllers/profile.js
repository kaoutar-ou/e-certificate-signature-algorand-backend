const fs = require('fs-extra');
const path = require('path');

const Etudiant = require("../models/etudiant");
const User = require("../models/user");
const Filiere = require("../models/filiere");
const Certificat = require("../models/certificat");
const University = require("../models/university");
const CertificateDto = require("../dtos/Certificate.dto")
const models = require("../models");
const { certificat } = require('../models');


const studentProfile = async (req, res) => {


    const findByCne = { where: { cne: req.query.cne }, include: [{ model: User, as: 'user' }] };
    const findByCodeApogee = { where: { code_apogee: req.query.cd_apg }, include: [{ model: User, as: 'user' }] };

    var obj = {}
    if (req.query.cne) {
        obj = findByCne;
    } else if (req.query.cd_apg) {
        obj = findByCodeApogee;
    }

    const student = await Etudiant.findOne(obj);
    console.log("student", student);
    if (student) {
        // const user = await User.findOne({ where: { id: student.user_id } });
        // student.user = user;

        const certificates = await Certificat.findAll({ where: { etudiant_id: student.id }, include: [{ model: Filiere, as: 'filiere' }] });
        console.log("certificates", certificates);


        if (certificates.length > 0) {

            // const filiere = await Filiere.findOne({ where: { id: certificates[0].filiere_id } });
            const etablissement = await Etablissement.findOne({ where: { id: certificates[0].filiere.id } });
            const university = await University.findOne({ where: { id: etablissement.university_id } });

            let certificatsInfo = [];
            certificates.forEach(async (certificate) => {
                certificate.filiere = await Filiere.findOne({ where: { id: certificate.filiere_id } });
                certificatsInfo.push(new CertificateDto(certificate));
            }
            );

            res.status(200).json(
                student,
                certificatsInfo,
                university,
            );

        }
        else {
            res.status(200).json(
                student,
            );
        }



    }
}


const updateProfileVisibility = async (req, res) => {

    user_id = req.body.user_id;
    visibility = req.body.visibility;
    console.log(user_id, visibility);

    const student = await Etudiant.update({ visibility: visibility }, { where: { user_id: user_id } });
    console.log("student", student);
    res.status(200).json({
        message: "profile visibility updated",
    })
}



module.exports = {
    studentProfile,
    updateProfileVisibility,
}

