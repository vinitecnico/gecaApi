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

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});