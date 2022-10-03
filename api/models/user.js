const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    nom: String,
    prenom: String,
    email: {
      type: "string",
      required: true,
      unique: true,
      match:
        /^[a-zA-Z0-9_.+]*[a-zA-Z][a-zA-Z0-9_.+]*@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
    },
    mac : {type :"string", unique : true},
    password: { type: "string", required: true },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
  }, { timestamps: true })
);

module.exports = User;
