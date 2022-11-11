const express = require("express");
const router = express.Router();
const { verifyToken, isSuperAdmin, isAdmin } = require("../middlwares/auth");

const { createUniversity, 
      createEtablissement, 
      createFiliere, 
      createElementDeNote, 
      getAllEtudiants, 
      getAllFilieres, 
      getAllAnneeUniversitaires, 
      getAllCertificatsByFiliere, 
      getSignedCertificatsByFiliere,
      uploadProfileImage,
      getEtablissments
} = require('../controllers/backops.controller');

router.post("/create-university",[verifyToken,isSuperAdmin], createUniversity);
router.post("/create-etablissement",[verifyToken,isSuperAdmin], createEtablissement);
router.post("/create-filiere",[verifyToken,isSuperAdmin], createFiliere);
router.post("/create-element-de-note",[verifyToken,isAdmin], createElementDeNote);
router.get("/get-all-etudiants",[verifyToken,isAdmin], getAllEtudiants);
router.get("/get-all-filieres",[verifyToken,isAdmin], getAllFilieres);
router.get("/get-all-annees-universitaires",[verifyToken,isAdmin], getAllAnneeUniversitaires);
router.get("/get-all-certificats-by-filiere",[verifyToken,isAdmin], getAllCertificatsByFiliere);
router.get("/get-all-signed-certificats-by-filiere",[verifyToken,isAdmin], getSignedCertificatsByFiliere);
router.post("/upload-profile-image",[verifyToken,isSuperAdmin], uploadProfileImage);
router.get("/get-etablissements",[verifyToken,isAdmin], getEtablissments);

// router.get("/get-all-filieres",[verifyToken,isAdmin], getAllFilieres);

// router.get("/get-all-etudiants",[verifyToken,isAdmin], getAllEtudiants);

// router.post("/send-email-test", sendEmailTest);

// router.post("/create-semestre", createSemestre);

// router.post("/create-module", createModule);

// router.get("/get-all-certificats-by-filiere",[verifyToken,isSuperAdmin], getAllCertificatsByFiliere);

// router.get("/get-certified-filieres",[verifyToken,isSuperAdmin], getCertifiedFilieres);

module.exports = router;