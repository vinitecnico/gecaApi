var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;

const querypessoa = {
    "dados_pessoais.cpf": 0,
    "dados_pessoais.rg": 0,
    "dados_pessoais.birthDate": 0,
    "dados_pessoais.etnia": 0,
    "dados_pessoais.motherName": 0,
    "dados_pessoais.sexo": 0,
    "dados_pessoais.transgenero": 0,
    "dados_pessoais.orientacosexusal": 0,
    "dados_pessoais.socialName": 0,
    "endereco_contato.zipcode": 0,
    "endereco_contato.address": 0,
    "endereco_contato.numberAddress": 0,
    "endereco_contato.complement": 0,
    "endereco_contato.neighborhood": 0,
    "endereco_contato.city": 0,
    "endereco_contato.state": 0,
    "endereco_contato.phone": 0,
    "endereco_contato.mobile": 0,
    "endereco_contato.email": 0,
    "endereco_contato.facebook": 0,
    "endereco_contato.twitter": 0,
    "endereco_contato.instagram": 0,
    "profissional_eleitoral": 0,
    "notificacoes_anotacoes": 0,
    "datacreate": 0,
    "dataUpdate": 0
}

const queryFeira = {
    "zipcode": 0,
    "address": 0,
    "numberAddress": 0,
    "complement": 0,
    "neighborhood": 0,
    "city": 0,
    "state": 0,
    "datacreate": 0,
    "dataUpdate": 0
}



///GET Colegio
exports.getMaps = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            db.db("baseinit").collection("pessoa").find({})
                .project(querypessoa)
                .toArray(function (err, res) {
                    if (err) {
                        response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                    }
                    else {

                        if (res.length != 0) {
                            response.status(status.OK).send(res);
                        } else {
                            response.status(status.NOT_FOUND).send(JSON.stringify("Nenhum Colegio foi Cadastrada."));
                        }

                    }

                    db.close();
                });

        }
    });

}

///GET Colegio
exports.getFeiraMaps = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            db.db("baseinit").collection("feiras").find({"gps": {$ne:null}})
                .project(queryFeira)
                .toArray(function (err, res) {
                    if (err) {
                        response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                    }
                    else {

                        if (res.length != 0) {
                            response.status(status.OK).send(res);
                        } else {
                            response.status(status.NOT_FOUND).send(JSON.stringify("Nenhuma feira foi Cadastrada."));
                        }
                    }

                    db.close();
                });

        }
    });

}


exports.getPessoas_Feiras = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            var myObjmain = []
            var myObjinside = {}

            db.db("baseinit").collection("pessoa").find({ "endereco_contato.gps": { $ne: null } })
            .project(querypessoa)
            .toArray(function (err, res) {
                myObjinside.pessoa = res;
                db.close();
            })

            
            db.db("baseinit").collection("feiras").find({ "gps": { $ne: null } })
            .project(queryFeira)
            .toArray(function (err, res) {
                myObjinside.feira = res;
                db.close();
            })

            setTimeout(() => {
                myObjmain.push(myObjinside);
                response.status(status.OK).send(myObjmain);
            }, 2500);

        }
    });

}