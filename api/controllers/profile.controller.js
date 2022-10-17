const fs = require('fs-extra');
const path = require('path');

const Etudiant = require("../models/etudiant");
const User = require("../models/user");
const Filiere = require("../models/filiere");
const Certificat = require("../models/certificat");
const University = require("../models/university");
const models = require("../models");


class CertificatsInfo {

    filiere;
    desc_filiere;
    abbr_filiere;
    duree;
    fileName;
    date_obtained;
    title;
  
    constructor(data) {
        this.filiere = data.filiere.nom;
        this.desc_filiere = data.filiere.description;
        this.duree = data.filiere.duree;
        this.fileName = data.fileName;
        this.date_obtained = new Date(data.updatedAt).toLocaleDateString('fr-FR');
        this.title = data.filiere.diplome;
        this.abbr_filiere = data.filiere.abbr;
    }

   

}

const studentProfile = async (req, res) => {
    const findByCne = { cne: req.query.cne };
    const findByCodeApogee = { code_apogee: req.query.cd_apg };
    var obj = {}
    if (req.query.cne) {
        obj = findByCne;
    } else if (req.query.cd_apg) {
        obj = findByCodeApogee;
    }

    const student = await Etudiant.findOne(obj).populate('user');
    const certificats = await Certificat.find({ etudiant: student._id }).populate('filiere');
    const filiere = await Filiere.findOne({ _id: certificats[0].filiere }).populate('etablissement');
    const university = await University.findOne({ _id: filiere.etablissement.universite });
    let certificatsInfo = [];

    certificats.forEach(certificat => {
        certificatsInfo.push(new CertificatsInfo(certificat));
    });

    // const fullname = student.user.nom + "-" + student.user.prenom;
    // const dirPath = path.join(process.cwd(), 'uploads', 'certificates', `${fullname}`);
    // const files = fs.readdirSync(dirPath);
    // const files_ = files.map((file) => {
    //     return {
    //         name: file,
    //     }
    // })

    
    res.status(200).json({
        student,
        certificatsInfo,
        university,
    })

}

module.exports = {
    studentProfile
}