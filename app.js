const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieSession = require("cookie-session");
const fileUpload = require('express-fileupload');
const sequelize = require("./config/db");
const Sequelize = require("sequelize");
const initial = require("./init");
const User = require("./api/models/User");
const Role = require("./api/models/Role");
const routesProcess = require("./api/routes/process");
const routesUser = require("./api/routes/user");
const routesBackops = require("./api/routes/backops");
const routesUpload = require("./api/routes/upload");
const routesProfile = require("./api/routes/profile");


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

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Header",
      "Origin; X-Requested-With, Content-Type, Accept, Authorization,x-access-token"
    );
    if (res.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST,PATCH, DELE, GET");
      return res.status(200).json({});
    }
    next();
  });


  app.use(
    cookieSession({
      name: "uca-session",
      secret: "COOKIE_SECRET", // should use as secret environment variable
      httpOnly: true,
    })
  );
  
sequelize.authenticate().then(() => {
    console.log('Connected to database');
    // sequelize.sync({ force: true }).then(() => {
        sequelize.sync({ force: false }).then(() => {
        console.log('Database synchronized');
    initial();
    }
    );
}).catch((error) => {
    console.error('Unable to connect to the database', error);
});

// ? auth routes

app.use("/api/auth", routesUser);


// ? backops routes

app.use("/api/backops", routesBackops);

// ? process routes

app.use("/api/process", routesProcess);

// ? upload routes

app.use("/api/upload", routesUpload);

// ? profile routes
app.use(fileUpload());
app.use("/api/profile", routesProfile);



app.use((req, res, next) => {
    const error = new Error("Not found ");
    error.status = 404;
    next(error);
  });
  app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
      error: {
        message: error.message,
      },
    });
  });
