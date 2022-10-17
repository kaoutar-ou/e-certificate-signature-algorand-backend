const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
dotenv.config();
const initial = require("./init");
const app = express();
const routesUser = require("./api/routes/user");
const routesBackops = require("./api/routes/backops");
const routesProcess = require("./api/routes/process");
const routesUpload = require("./api/routes/upload");
const routesProfile = require("./api/routes/profile");
const router = express.Router();
const { authJwt } = require("./api/middleware");

var corsOptions = {
  origin: "http://localhost:22840",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

connectDB()
  .then(() => {
    console.log("Connected to database ");
    initial();
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
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
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "uca-session",
    secret: "COOKIE_SECRET", // should use as secret environment variable
    httpOnly: true,
  })
);




// ? auth routes
app.use("/api/auth", routesUser);


// ? backops routes

app.use("/api/backops", routesBackops);

// ? process routes

app.use("/api/process", routesProcess);

// ? upload routes

app.use("/api/upload", routesUpload);

// ? profile routes

app.use("/api/profile", routesProfile);

// ? test

  //  filename = __dirname + '/uploads/certificates/mouzafir-abdelhadi_irisi_2022-2023.pdf';


  // app.use('/client', express.static(filename));
  // console.log(filename);

  

// ? ----------------------------------

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

// var addr = require('os').networkInterfaces()
// const addrMac = addr['Ethernet'][0]['mac'];
// console.log(addrMac);



// set port, listen for requests
const PORT = process.env.PORT || 7001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
