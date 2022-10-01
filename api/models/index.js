const models = {};
models.user = require("./user");
models.role = require("./role");

models.ROLES = ["user", "admin", "moderator"];

module.exports = models;