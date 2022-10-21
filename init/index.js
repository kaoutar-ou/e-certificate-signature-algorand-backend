const Role = require("../api/models/role");

const initial=async ()=> {

    // Role.estimatedDocumentCount((err, count) => {
    //   if (!err && count === 0) {
      const countRoles = await Role.count();

      if (countRoles === 0) {
      
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
      }
      else{
        console.log("roles already exist");
      }
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