/// LIBRARY
const express = require("express");

///API'S
const controllerUser = require("../controller/user");

/// EXPRESS
const routes = express.Router();

///USER

routes.get('/user', controllerUser.getUsers);

module.exports = routes