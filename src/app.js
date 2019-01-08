///Constante 
const express = require('express');
const routespath = require("../routes/router");
const status = require('http-status')
const conf = require("../conf/config");
var cors = require('cors')
const bodyParser = require('body-parser');
const port = process.env.PORT || conf.port;
var jwt = require('jsonwebtoken');


/// Criando Configurações para Utilização dos VERBS [POST, GET, PUT, DELETE]
/// e criação de middleware atraves do express
const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use(express.json())

//TODO: Criar a rota middleware para poder verificar e autenticar o token
app.use(function (req, res, next) {

    if (req.originalUrl != "/api/login") {
        //var token = req.headers['x-access-token'];
        var tokens = req.headers['authorization'].replace('Bearer ' , '')

        if (tokens) {
            jwt.verify(tokens, require("../conf/config").configName, function (err, decoded) {
                if (err) {
                    return res.status(403).send({
                        success: false,
                        message: 'Falha ao tentar autenticar o token!'
                   });
                } else {
                    //se tudo correr bem, salver a requisição para o uso em outras rotas
                    req.decoded = decoded;
                    next();
                }
            });

        } else {
            //se não tiver o token, retornar o erro 403
            return res.status(403).send({
                success: false,
                message: 'Não há token.'
            });
        }
    }else{
        next();
    }

});

app.use("/api", routespath);

///MIDDLEWARE 404: url's não encontradas;
app.use((request, response, next) => {
    response.status(status.NOT_FOUND).send()
})

///MIDDLEWARE 500: ;
app.use((error, request, response, next) => {
    response.status(status.INTERNAL_SERVER_ERROR).json({ error })
})

/// Criando Servidor
const server = require('http').createServer(app)

/// Listen 
server.listen(port, () => {
    console.log(`Servidor em execução na Port:${port}`)
});
