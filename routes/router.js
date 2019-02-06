/// LIBRARY
const express = require("express");

///API'S
const controllerUser = require("../controller/user");
const controllerPerfil = require("../controller/perfil");
const controllerMenu = require("../controller/menu");
const controllerSubMenu = require("../controller/submenu");
const controllerLogin = require("../controller/login");
const controllerPessoa = require("../controller/pessoa");
const controllerFeira = require("../controller/feira");
const controllerEmpresa = require("../controller/empresas");
const controllerColegio = require("../controller/colegio");
const controllerMaps = require("../controller/maps");
const controllerHome = require("../controller/home");
const controllerEmail = require("../controller/email");
const controllerCnpjWs = require("../controller/cnpj");
const controllerGabinete = require('../controller/gabinete');
const controllerDemanda = require('../controller/demanda');

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

///Pessoa
routes.post('/pessoa', controllerPessoa.postPessoa);
routes.get('/pessoa', controllerPessoa.getPessoa);
routes.get('/pessoa/:id', controllerPessoa.getOnlyPessoa);
routes.put('/pessoa/:id', controllerPessoa.putPessoa);
routes.delete('/pessoa/:id', controllerPessoa.deletePessoa);
routes.post('/pessoa/importdatabase', controllerPessoa.postImportDatabase);

///Feira
routes.post('/feira', controllerFeira.postFeira);
routes.get('/feira', controllerFeira.getFeira);
routes.get('/feira/:id', controllerFeira.getOnlyFeira);
routes.put('/feira/:id', controllerFeira.putFeira);
routes.delete('/feira/:id', controllerFeira.deleteFeira);
routes.post('/feira/importdatabase', controllerFeira.postImportDatabase);

///Empresa
routes.post('/empresa', controllerEmpresa.postEmpresa);
routes.get('/empresa', controllerEmpresa.getEmpresa);
routes.get('/empresa/:id', controllerEmpresa.getOnlyEmpresa);
routes.put('/empresa/:id', controllerEmpresa.putEmpresa);
routes.delete('/empresa/:id', controllerEmpresa.deleteEmpresa);
routes.post('/empresa/importdatabase', controllerEmpresa.postImportDatabase);
routes.post('/empresa/importdatabasereprocessamento', controllerEmpresa.postReprocessamento);

///Colegio
routes.post('/colegio', controllerColegio.postColegio);
routes.get('/colegio', controllerColegio.getColegio);
routes.get('/colegio/:id', controllerColegio.getOnlyColegio);
routes.put('/colegio/:id', controllerColegio.putColegio);
routes.delete('/colegio/:id', controllerColegio.deleteColegio);
routes.post('/colegio/importdatabase', controllerColegio.postImportDatabase);

///Maps
routes.get('/map/pessoa', controllerMaps.getPessoaMaps);
routes.get('/map/feira', controllerMaps.getFeiraMaps);
routes.get('/map/empresa', controllerMaps.getEmpresaMaps);
routes.get('/map/colegio', controllerMaps.getColegioMaps);
routes.get('/map', controllerMaps.getAll);
routes.get('/map/viacep/:id', controllerMaps.getViaCep);
routes.get('/map/getGoogleMaps/:id', controllerMaps.getGoogleMaps);

///Gabinete
routes.post('/gabinete', controllerGabinete.postGabinete);
routes.get('/gabinete', controllerGabinete.getGabinete);
routes.get('/gabinete/:id', controllerGabinete.getOnlyGabinete);
routes.put('/gabinete/:id', controllerGabinete.putGabinete);
routes.delete('/gabinete/:id', controllerGabinete.deleteGabinete);

///Demanda
routes.post('/demanda', controllerDemanda.postDemanda);
routes.get('/demanda', controllerDemanda.getDemanda);
routes.get('/demanda/:id', controllerDemanda.getOnlyDemanda);
routes.put('/demanda/:id', controllerDemanda.putDemanda);
routes.delete('/demanda/:id', controllerDemanda.deleteDemanda);

///Home
routes.get('/home', controllerHome.getCountersHome);

///Email
routes.post('/email', controllerEmail.sendEmail);

///CNPJ
routes.get('/cnpjws/:cnpj', controllerCnpjWs.getCNPJWs);

module.exports = routes