const fs = require('fs-extra');
const path = require('path');

const Etudiant = require("../models/Etudiant");
const User = require("../models/User");
const Filiere = require("../models/Filiere");
const Certificat = require("../models/Certificat");
const University = require("../models/University");
const Etablissement = require("../models/Etablissement");
const CertificateDto = require("../dtos/Certificate.dto")
// const models = require("../models");
// const { certificat } = require('../models');


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

const uploadProfileImage = async (req, res) => {

    
    fs.ensureDirSync(path.join(process.cwd(), 'uploads', 'avatars'));
    const maxSize = 8 * 1024 * 1024;

    if (!req.files.file) {
        return res.status(400).send('No files were uploaded.');
    }


    if (req.files.file > maxSize) {
        return res.status(400).send('File too large');
    }


    const avatar = req.files.file.name.split('.')[0] + '-' + Date.now() +'.'+req.files.file.name.split('.').pop();
    const filename = path.join(process.cwd(), 'uploads', 'avatars', avatar);
    console.log(filename);
    const file = req.files.file;
    console.log("🚀 ~ file: auth.controller.js ~ line 319 ~ uploadProfileImage ~ file", file)

    file.mv(filename, async (err) => {
        if (err) {
            return res.status(500).send(err);
        }})

    const user = await User.findOne({ where: { id: req.query.id } });
    if (user) {
        await Etudiant.findOne({ where: { UserId: user.id } }).then((etudiant) => {
            console.log("etudiant", etudiant);

            if(etudiant.avatar){
                const oldAvatar = path.join(process.cwd(), 'uploads', 'avatars', etudiant.avatar);
                fs.existsSync(oldAvatar) && fs.unlinkSync(oldAvatar);
            }
            
            etudiant.update({ avatar });
           
            res.status(200).send({
                avatar: avatar,
                message: "avatar uploaded successfully"
            });
        });
    }
    else {
        res.status(404).send({
            message: "User not found!"
        });
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


const downloadAvatar = async (req, res) => {
    
    
    const file = path.join(process.cwd(), 'uploads', 'avatars', req.query.avatar);
    console.log("🚀 ~ file: profile.controller.js ~ line 100 ~ downloadAvatar ~ file", file)
   
    const fileExists = await fs.existsSync(file);
    if (fileExists) {

        res.header('Content-Type', 'image/jpeg', 'image/png', 'image/jpg');
        res.sendFile(file);
        // var data = fs.readFileSync(file);
        // res.send(data);
    }
    else {
        res.status(404).json({
            message: "avatar not found"
        })
    }
}



module.exports = {
    studentProfile,
    updateProfileVisibility,
    studentPrivateProfile,
    uploadProfileImage,
    downloadAvatar
}

