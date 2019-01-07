var MongoClient = require('mongodb').MongoClient;
const status    = require('http-status');
var bcrypt      = require('bcryptjs');
var jwt         = require('jsonwebtoken');

var obj = {};

exports.postLogin = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro)
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        db.db("baseinit").collection("users").findOne({ email: request.body.email }, function (err, res) {
            if (err)
                response.status(status.BAD_REQUEST).send(JSON.stringify(err));
            if (!res) {

                obj = {
                    sucess : false,
                    status : status.UNAUTHORIZED ,
                    messsage : 'Autenticação do Usuário falhou. Usuário não encontrado!',
                    token: "Não há token."
                }

                response.status(status.UNAUTHORIZED).send(obj);                

            } else if (res) {

                if(!bcrypt.compareSync(request.body.password, res.password)) {

                    obj = {
                        sucess : false,
                        status : status.UNAUTHORIZED,                        
                        messsage: 'Autenticação do Usuário falhou. Senha incorreta!',
                        token: "Não há token."
                    }

                    response.status(status.UNAUTHORIZED).send(obj);                  
                }
                else{                                        

                    obj = {
                        sucess : true,
                        status : status.OK, 
                        name : res.name ,
                        messsage: 'Usuário Autenticado com Sucesso!', 
                        token : jwt.sign(res, require("../conf/config").configName, {expiresIn: require("../conf/config").expireInTime })
                    }

                    response.status(status.OK).send(obj);
                }
            }

        });
    });

}