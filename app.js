const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
dotenv.config();
const initial = require("./init");
const app = express();
const routesUser = require("./api/routes/user"); 
const {authJwt} = require("./api/middleware");

var corsOptions = {
  origin: "http://localhost:3000",
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
    "Origin; X-Requested-With, Content-Type, Accept, Authorization"
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

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

app.use("/api/user", routesUser);

app.get("/api/test/user", [authJwt.verifyToken], (req, res) => {
    res.json({
        message: "User Content.",
    });
});

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

var addr = require('os').networkInterfaces()
const addrMac=addr['Wi-Fi'][0]['mac'];
console.log(addr['Wi-Fi'][0]['mac']);


// set port, listen for requests
const PORT = process.env.PORT || 7001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
