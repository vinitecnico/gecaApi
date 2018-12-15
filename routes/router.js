/// LIBRARY
const express = require("express");

///API'S
const controllerUser = require("../controller/user");
const controllerPerfil = require("../controller/perfil");
const controllerMenu = require("../controller/menu");
const controllerSubMenu = require("../controller/submenu");
const controllerLogin = require("../controller/login");

/// EXPRESS
const routes = express.Router();

///USER
routes.post('/user', controllerUser.postUser);
routes.get('/user', controllerUser.getUsers);
routes.get('/user/:id', controllerUser.getOnlyUser);
routes.put('/user/:id', controllerUser.putUser);
routes.delete('/user/:id', controllerUser.deleteUser);

///PERFIL
routes.post('/perfil', controllerPerfil.postPerfil);
routes.get('/perfil', controllerPerfil.getPerfil);
routes.get('/perfil/:id', controllerPerfil.getOnlyPerfil);
routes.put('/perfil/:id', controllerPerfil.putPerfil);
routes.delete('/perfil/:id', controllerPerfil.deletePerfil);

///MENU
routes.post('/menu', controllerMenu.postMenu);
routes.get('/menu', controllerMenu.getMenu);
routes.get('/menu/:id', controllerMenu.getOnlyMenu);
routes.put('/menu/:id', controllerMenu.putMenu);
routes.delete('/menu/:id', controllerMenu.deleteMenu);

///SUBMENU
routes.post('/submenu', controllerSubMenu.postSubMenu);
routes.get('/submenu', controllerSubMenu.getSubMenu);
routes.get('/submenu/:id', controllerSubMenu.getOnlySubMenu);
routes.put('/submenu/:id', controllerSubMenu.putSubMenu);
routes.delete('/submenu/:id', controllerSubMenu.deleteSubMenu);


///Login
routes.post('/login', controllerLogin.postLogin);
module.exports = routes