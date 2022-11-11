
const bcrypt = require("bcryptjs");
const sequelize = require("../../config/db");
const User = require("../models/User");
const Sequelize = require("sequelize");


const generatePassword = (length) => {
    let characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz./*_-+@#$%&";
    let password = Array(length).fill(characters).map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    console.log(password);
    return {
      plain: password,
      hash : bcrypt.hashSync(password, 8)
    };
  }
  
  const generateEmail = (nom, prenom, roles) => {
    let email = prenom.toLowerCase() + "." + nom.toLowerCase()
    if (roles.includes("admin") || roles.includes("super_admin")) {
      email += "@uca.ma";
    } else if (roles.includes("etudiant")) {
      email += "@edu.uca.ma";
    }
    return email;
  }
  
  const generateUsername = (nom, prenom) => {
    let username = prenom.toLowerCase() + "." + nom.toLowerCase();
    return username;
  }

  const getNewAnneeUniversitaire = () => {
    let year = new Date().getFullYear();
    return year+"/"+(year+1)
    }

    const verifyNewUserRequest = (request) => {
      if (request.nom && request.prenom && request.cin && request.roles) {
        return true;
      }
      return false;
    }

    const userExists = async (username, email, cin) => {
      // let user = await User.findOne({ email: email });
      let user = await User.findOne({ 
        where: {
          [Sequelize.Op.or]: [
            { username: username },
            { email: email },
            { cin: cin },
          ]
        }
     });
      console.log(user);
      if (user != null) {
        return true;
      }
      return false;
    }
    
    const verifyNewEtudiantRequest = (request) => {
      if (request.cne && request.filiere && request.address
        && request.date_naissance && request.telephone && request.ville && request.pays
        && request.date_inscription && request.code_apogee) {
        return true;
      }
      return false;
    }

  module.exports = {
    generatePassword,
    generateEmail,
    generateUsername,
    getNewAnneeUniversitaire,
    verifyNewUserRequest,
    userExists,
    verifyNewEtudiantRequest
    }