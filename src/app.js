///Constante 
const express = require('express');
const routespath = require("../routes/router");
const status = require('http-status')
const conf = require("../conf/config");
const hostname = conf.hostname;
const port = conf.port;


/// Criando Configurações para Utilização dos VERBS [POST, GET, PUT, DELETE]
/// e criação de middleware atraves do express
const app = express();
app.use(express.json())
app.use("/api", routespath);



///MIDDLEWARE 404: url's não encontradas;
app.use(function (request, response, next) {
    response.status(status.NOT_FOUND).send()
})

///MIDDLEWARE 500: ;
app.use(function (error, request, response, next) {
    response.status(status.INTERNAL_SERVER_ERROR).json({ error })
})

/// Criando Servidor
const server = require('http').createServer(app)

/// Input 
// server.listen(port , hostname, function() {
//     console.log(`Servidor em execução em http://${hostname}:${port}/`)
// })

app.listen(port || 5000, function () {
    console.log(`Servidor em execução em http://127.0.0.1::${port}/`)
});