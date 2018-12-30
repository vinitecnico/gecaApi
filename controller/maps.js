var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;
const Q = require('q');

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

const queryEmpresa = {
    "cnpj": 0,
    "segment": 0,
    "activity": 0,
    "zipcode": 0,
    "address": 0,
    "numberAddress": 0,
    "complement": 0,
    "neighborhood": 0,
    "city": 0,
    "state": 0,
    "mainContact": 0,
    "phone": 0,
    "mobile": 0,
    "email": 0,
    "facebook": 0,
    "twitter": 0,
    "instagram": 0,
    "datacreate": 0,
    "dataUpdate": 0
}

function getMap(db, collectionName, ignorObject, findObject) {
    const defer = Q.defer();
    db.db("baseinit").collection(collectionName)
        .find(findObject)
        .project(ignorObject)
        .toArray(function (err, res) {
            db.close();
            if (err) {
                defer.reject(JSON.stringify(err));
            }
            else {
                if (res.length != 0) {
                    defer.resolve(res);
                } else {
                    defer.reject('Nenhum registro foi encontrado!');
                }
            }
        });
    return defer.promise;
}

///GET Pessoa
exports.getPessoaMaps = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            getMap(db, 'pessoa', querypessoa, { 'endereco_contato.gps': { $ne: null } })
                .then((data) => {
                    response.status(status.OK).send(data);
                })
                .catch((e) => {
                    response.status(status.NOT_FOUND).send(JSON.stringify(e));
                })
                .finally(db.close);
        }
    });

}

///GET Feiras
exports.getFeiraMaps = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            getMap(db, 'feiras', queryFeira, { 'gps': { $ne: null } })
                .then((data) => {
                    response.status(status.OK).send(data);
                })
                .catch((e) => {
                    response.status(status.NOT_FOUND).send(JSON.stringify(e));
                })
                .finally(db.close);
        }
    });
}

///GET Empresas
exports.getEmpresaMaps = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            getMap(db, 'empresas', queryEmpresa, { 'gps': { $ne: null } })
                .then((data) => {
                    response.status(status.OK).send(data);
                })
                .catch((e) => {
                    response.status(status.NOT_FOUND).send(JSON.stringify(e));
                })
                .finally(db.close);
        }
    });
}

exports.getAll = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            var myObjmain = [];
            var myObjinside = {};
            var promises = [];

            const Items = [{
                collectionName: 'pessoa',
                query: querypessoa,
                filter: { "endereco_contato.gps": { $ne: null } },
                fieldName: 'pessoa'
            }, {
                collectionName: 'feiras',
                query: queryFeira,
                filter: { 'gps': { $ne: null } },
                fieldName: 'feira'
            }, {
                collectionName: 'empresas',
                query: queryEmpresa,
                filter: { 'gps': { $ne: null } },
                fieldName: 'empresa'
            }];

            for (let i = 0; i < Items.length; i++) {
                promises.push(getMap(db, Items[i].collectionName, Items[i].query, Items[i].filter)
                    .then((data) => {
                        myObjinside[Items[i].fieldName] = data;
                        return Q.resolve(data);
                    })
                    .catch((e) => {
                        return Q.reject(e);
                    }));
            }

            Q.all(promises)
                .then(() => {
                    myObjmain.push(myObjinside);
                    response.status(status.OK).send(myObjmain);
                });
        }
    });

}