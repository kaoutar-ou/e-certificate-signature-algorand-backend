
const bcrypt = require("bcryptjs");

const generatePassword = (length) => {
    let characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz./*_-+@#$%&";
    let password = Array(length).fill(characters).map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    console.log(password);
    return bcrypt.hashSync(password, 8);
  }
  
  const generateEmail = (nom, prenom, role) => {
    let email = prenom.toLowerCase() + "." + nom.toLowerCase()
    if (role == "etudiant") {
      email += "@edu.uca.ma";
    }
    else if (role == "admin") {
      email += "@uca.ma";
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

  module.exports = {
    generatePassword,
    generateEmail,
    generateUsername,
    getNewAnneeUniversitaire,
    }