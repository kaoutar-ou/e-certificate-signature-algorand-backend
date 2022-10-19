const Role = require("../api/models/role");

const initial=()=> {

    // Role.estimatedDocumentCount((err, count) => {
    //   if (!err && count === 0) {
        new Role({
          name: "etudiant"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
          console.log("added 'etudiant' to roles collection");
        });
  
        new Role({
          name: "super_admin"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
  
          console.log("added 'super_admin' to roles collection");
        });
  
        new Role({
          name: "admin"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
  
          console.log("added 'admin' to roles collection");
        });
      // }
    // });

  // Role.create({
  //   name: "etudiant"
  // }).then((role) => {
  //   console.log("added 'etudiant' to roles collection");
  // }).catch((error) => {
  //   console.log("error", error);
  // });
  
  }

  module.exports = initial;