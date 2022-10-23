const fs = require('fs-extra');
const path = require('path');

const Etudiant = require("../models/Etudiant");
const User = require("../models/User");
const Filiere = require("../models/Filiere");
const Certificat = require("../models/certificat");
const University = require("../models/University");
const Etablissement = require("../models/Etablissement");
const CertificateDto = require("../dtos/Certificate.dto")
const models = require("../models");
const { certificat } = require('../models');


const studentProfile = async (req, res) => {


    const findByCne = { where: { cne: req.query.cne }, include: [{ model: User, as: 'User' }] };
    const findByCodeApogee = { where: { code_apogee: req.query.cd_apg }, include: [{ model: User, as: 'User' }] };

    var obj = {}
    if (req.query.cne) {
        obj = findByCne;
    } else if (req.query.cd_apg) {
        obj = findByCodeApogee;
    }

    const student = await Etudiant.findOne(obj);
    console.log("student", student);

    if (student && student.dataValues.visibility) {
        // const user = await User.findOne({ where: { id: student.user_id } });
        // student.user = user;
        await profile(req, res, student);
    }
    else {
        res.status(200).json({
            student : {visibility : student.dataValues.visibility},
            message: "Student not found or has a private profile"
        })
    }
}

const studentPrivateProfile = async (req, res) => {
    console.log("req.query", req.query.user_id);
    const findByCne = { where: { cne: req.query.cne }, include: [{ model: User, as: 'User' }] };
    const findByCodeApogee = { where: { code_apogee: req.query.cd_apg }, include: [{ model: User, as: 'User' }] };

    var obj = {}
    if (req.query.cne) {
        obj = findByCne;
    } else if (req.query.cd_apg) {
        obj = findByCodeApogee;
    }

    const student = await Etudiant.findOne(obj);
    console.log("🚀 ~ file: profile.controller.js ~ line 56 ~ studentPrivateProfile ~ student", student.dataValues.User.dataValues.id)
    

    if (student && student.dataValues.User.dataValues.id == req.query.user_id) {
        await profile(req, res, student);
    }
    else {  
        res.status(401).json({
            message: "Unauthorized"
        })
    }
}


const profile = async (req, res, student) => {
    const certificates = await Certificat.findAll({ where: { EtudiantId: student.dataValues.id }, include: [{ model: Filiere, as: 'Filiere' }] });
    console.log("certificates", certificates);


    if (certificates.length > 0) {

        // const filiere = await Filiere.findOne({ where: { id: certificates[0].filiere_id } });
        const etablissement = await Etablissement.findOne({ where: { id: certificates[0].dataValues.Filiere.dataValues.EtablissementId } });
        console.log("🚀 ~ file: profile.controller.js ~ line 44 ~ studentProfile ~ etablissement", etablissement)

        const university_ = await University.findOne({ where: { id: etablissement.dataValues.UniversityId } });
        console.log("🚀 ~ file: profile.controller.js ~ line 47 ~ studentProfile ~ university", university_)

        let certificatsInfo = [];



        Promise.all(certificates.map(async (certificate) => {

            certificate.dataValues.filiere = (await Filiere.findOne({ where: { id: certificate.dataValues.FiliereId } })).dataValues;
            delete certificate.dataValues.Filiere;
            console.log("🚀 ~ file: profile.controller.js ~ line 56 ~ certificates.forEach ~ certificate", certificate.dataValues)
            certificatsInfo.push(new CertificateDto(certificate.dataValues));
        }
        )).then(() => {

            const university = university_.dataValues;
            res.status(200).json({
                student,
                certificatsInfo,
                university,
            })
        })

    }
    else {
        res.status(200).json(
            student,
        );
    }
}






const updateProfileVisibility = async (req, res) => {

    user_id = req.body.user_id;
    visibility = req.body.visibility;
    console.log(user_id, visibility);

    const student = await Etudiant.update({ visibility: visibility }, { where: { UserId: user_id } });
    console.log("student", student);
    res.status(200).json({
        message: "profile visibility updated",
    });
}



module.exports = {
    studentProfile,
    updateProfileVisibility,
    studentPrivateProfile
}

