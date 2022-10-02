const express = require("express");
const cors = require("cors");
const app = express();
var corsOptions = {
    origin: "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Header",
        "Origin; X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (res.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET");
        return res.status(200).json({});
    }
    next();
});

app.use(express.urlencoded({ extended: true }));


var addr = require('os').networkInterfaces()
const addrMac = addr['Wi-Fi'][0]['mac'];

app.get("/api/mac", (req, res) => {
    res.json({
        mac: addrMac,
    });
});

const PORT = 7002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

