const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require('express-fileupload');
const routesProcess = require("./api/routes/process");
const routesBackops = require("./api/routes/backops");
const routesProfile = require("./api/routes/profile");
const routesAlgo = require("./api/routes/algo");



dotenv.config();

const app = express();

var corsOptions = {
  origin: "https://e-certificate-server.vr4.ma",
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 7003;
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



  app.use('/test', (req, res) => {
    res.send("test1");
});


// ? process routes

app.use("/api/process", routesProcess);


// ? profile routes
app.use(fileUpload());

app.use("/api/profile", routesProfile);

// ? backops routes

app.use("/api/backops", routesBackops);

app.use("/api/algo", routesAlgo);



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
