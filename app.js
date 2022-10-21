const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const sequelize = require("./config/db");
const Sequelize = require("sequelize");
const initial = require("./init");
const User = require("./api/models/User");
const Role = require("./api/models/Role");

const routesUser = require("./api/routes/user");
const routesBackops = require("./api/routes/backops");
const routesUpload = require("./api/routes/upload");

dotenv.config();

const app = express();

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 7001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

sequelize.authenticate().then(() => {
    console.log('Connected to database');
    // sequelize.sync({ force: true }).then(() => {
    //     sequelize.sync({ force: false }).then(() => {
    //     console.log('Database synchronized');
    // // initial();
    // }
    // );
}).catch((error) => {
    console.error('Unable to connect to the database', error);
});

app.get("/", async (req, res) => {
    res.json({ message: "..." });
    console.log(User === sequelize.models.User); 
    console.log(Role === sequelize.models.Role);
    // initial();
    const role = await Role.findOne({ 
        where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), 'etudiant')
     });
    console.log(role.dataValues);

    const roles = await Role.findAll({ 
        where: 
            {
                name: {
                    [Sequelize.Op.in]: ['etudiant', 'admin']
                }
            }
        
    }).then((roles) => {
        return roles.at(0)
    });
    console.log(roles);

    const user = await User.create({
        username: "user5",
        email: "useremail5@gmail.com",
        password: "userpassword",
        nom: "usernom5",
        prenom: "userprenom5",
        cin: "usercin5",
        mac: "usermac5",
    });

    user.setRoles([role.dataValues.id]).then(() => {
        console.log("User was registered successfully!");
      });
});


// ? auth routes
app.use("/api/auth", routesUser);


// ? backops routes

app.use("/api/backops", routesBackops);

// // ? process routes

// app.use("/api/process", routesProcess);

// ? upload routes

app.use("/api/upload", routesUpload);

// // ? profile routes

// app.use("/api/profile", routesProfile);