var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;
const Q = require('q');
const _ = require("lodash");

function sortPessoa(type) {
    switch (type) {
        case 'cpf':
            return 'dados_pessoais.cpf';
        case 'city':
            return 'endereco_contato.city';
        default:
            return 'dados_pessoais.name';
    }
}

///GET USER
exports.getPessoa = (request, response, next) => {
    const sort = {
        active: sortPessoa(request.query.active),
        direction: request.query.direction ? parseInt(request.query.direction) : 1
    };

    const pagination = {
        page: request.query.page ? parseInt(request.query.page) : 0,
        perPage: request.query.per_page ? parseInt(request.query.per_page) : 10
    };

    let filter = {};
    if (request.query.value) {
        filter = {
            $or: [
                { "dados_pessoais.name": { "$regex": request.query.value, "$options": "i" } },
                { "dados_pessoais.cpf": { "$regex": request.query.value, "$options": "i" } },
                { "endereco_contato.city": { "$regex": request.query.value, "$options": "i" } }
            ]
        };
    }
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            const promises = [];

            promises.push(db.db("baseinit").collection('pessoa').find(filter).count());

            promises.push(db.db('baseinit')
                .collection('pessoa')
                .find(filter)
                .skip((pagination.perPage * pagination.page) - pagination.perPage)
                .limit(pagination.perPage)
                .collation({ locale: "en", })
                .sort(sort.active, sort.direction)
                .toArray());

            Q.all(promises)
                .then((data) => {
                    let result = {};
                    _.each(data, (x) => {
                        if (_.isArray(x)) {
                            result.data = x;
                        } else {
                            result.total = x;
                        }
                    });
                    response.status(status.OK).send(result);
                })
                .catch((error) => {
                    response.status(status.NOT_FOUND).send(JSON.stringify("Colégio não encontrada."));
                })
                .finally(db.close);
        }
    });

}

///GET USER:ID
exports.getOnlyPessoa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {


            db.db("baseinit").collection("pessoa").find({ "dados_pessoais.cpf": request.params.id }).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.NOT_FOUND).send(JSON.stringify("Usuario nao encontrado"));
                    }

                }
                db.close();
            });

        }
    });

}

///POST Pessoa
exports.postPessoa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            var dbo = db.db("baseinit");

            ///Verifa se cpf ja existe na base
            dbo.collection("pessoa").find({ "dados_pessoais.cpf": request.body.dados_pessoais.cpf }).toArray(function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {

                        response.status(status.UNAUTHORIZED).send(JSON.stringify("Cadastro do usuario foi encontrado em nossa base."));

                    } else {

                        ///Object para inserção
                        var myobj = {
                            "dados_pessoais": {
                                "name": request.body.dados_pessoais.name,
                                "cpf": request.body.dados_pessoais.cpf,
                                "rg": request.body.dados_pessoais.rg,
                                "birthDate": request.body.dados_pessoais.birthDate,
                                "etnia": request.body.dados_pessoais.etnia,
                                "motherName": request.body.dados_pessoais.motherName,
                                "sexo": request.body.dados_pessoais.sexo,
                                "transgenero": request.body.dados_pessoais.transgenero,
                                "orientacosexusal": request.body.dados_pessoais.orientacosexusal,
                                "socialName": request.body.dados_pessoais.socialName
                            },
                            "endereco_contato": {
                                "zipcode": request.body.endereco_contato.zipcode,
                                "address": request.body.endereco_contato.address,
                                "numberAddress": request.body.endereco_contato.numberAddress,
                                "complement": request.body.endereco_contato.complement,
                                "neighborhood": request.body.endereco_contato.neighborhood,
                                "city": request.body.endereco_contato.city,
                                "state": request.body.endereco_contato.state,
                                "gps": request.body.endereco_contato.gps,
                                "phone": request.body.endereco_contato.phone,
                                "mobile": request.body.endereco_contato.mobile,
                                "email": request.body.endereco_contato.email,
                                "facebook": request.body.endereco_contato.facebook,
                                "twitter": request.body.endereco_contato.twitter,
                                "instagram": request.body.endereco_contato.instagram
                            },
                            "profissional_eleitoral": {
                                "company": request.body.profissional_eleitoral.company,
                                "admissionDate": request.body.profissional_eleitoral.admissionDate,
                                "terminationDate": request.body.profissional_eleitoral.terminationDate,
                                "positionCompany": request.body.profissional_eleitoral.positionCompany,
                                "workplace": request.body.profissional_eleitoral.workplace,
                                "Sindicalizado": request.body.profissional_eleitoral.Sindicalizado,
                                "associationNumber": request.body.profissional_eleitoral.associationNumber,
                                "militante": request.body.profissional_eleitoral.militante,
                                "directorsindication": request.body.profissional_eleitoral.directorsindication,
                                "electoraltitle": request.body.profissional_eleitoral.electoraltitle,
                                "zone": request.body.profissional_eleitoral.zone,
                                "section": request.body.profissional_eleitoral.section,
                                "county": request.body.profissional_eleitoral.county,
                                "state": request.body.profissional_eleitoral.state
                            },
                            "notificacoes_anotacoes": {
                                "correios": request.body.notificacoes_anotacoes.correios,
                                "telefone": request.body.notificacoes_anotacoes.telefone,
                                "sms": request.body.notificacoes_anotacoes.sms,
                                "whatsapp": request.body.notificacoes_anotacoes.whatsapp,
                                "email": request.body.notificacoes_anotacoes.email,
                                "score": request.body.notificacoes_anotacoes.score,
                                "history": request.body.notificacoes_anotacoes.history,
                                "datacreatehistory": new Date(Date.now())
                            },
                            "datacreate": new Date(Date.now()),
                            "dataUpdate": new Date(Date.now())
                        }

                        dbo.collection("pessoa").insertOne(myobj, function (err, res) {

                            if (err) {

                                response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                            }
                            else {

                                response.status(status.OK).send(JSON.stringify("Usuario cadastrado com sucesso"));

                            }

                            db.close();

                        });
                    }

                }
                db.close();

            });

        }

    });

}

///PUT Pessoa
exports.putPessoa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            /// DataBase            
            var newvalues = {
                $set: {
                    "dados_pessoais": {
                        "name": request.body.dados_pessoais.name,
                        "cpf": request.body.dados_pessoais.cpf,
                        "rg": request.body.dados_pessoais.rg,
                        "birthDate": request.body.dados_pessoais.birthDate,
                        "etnia": request.body.dados_pessoais.etnia,
                        "motherName": request.body.dados_pessoais.motherName,
                        "sexo": request.body.dados_pessoais.sexo,
                        "transgenero": request.body.dados_pessoais.transgenero,
                        "orientacosexusal": request.body.dados_pessoais.orientacosexusal,
                        "socialName": request.body.dados_pessoais.socialName
                    },
                    "endereco_contato": {
                        "zipcode": request.body.endereco_contato.zipcode,
                        "address": request.body.endereco_contato.address,
                        "numberAddress": request.body.endereco_contato.numberAddress,
                        "complement": request.body.endereco_contato.complement,
                        "neighborhood": request.body.endereco_contato.neighborhood,
                        "city": request.body.endereco_contato.city,
                        "state": request.body.endereco_contato.state,
                        "gps": request.body.endereco_contato.gps,
                        "phone": request.body.endereco_contato.phone,
                        "mobile": request.body.endereco_contato.mobile,
                        "email": request.body.endereco_contato.email,
                        "facebook": request.body.endereco_contato.facebook,
                        "twitter": request.body.endereco_contato.twitter,
                        "instagram": request.body.endereco_contato.instagram
                    },
                    "profissional_eleitoral": {
                        "company": request.body.profissional_eleitoral.company,
                        "admissionDate": request.body.profissional_eleitoral.admissionDate,
                        "terminationDate": request.body.profissional_eleitoral.terminationDate,
                        "positionCompany": request.body.profissional_eleitoral.positionCompany,
                        "workplace": request.body.profissional_eleitoral.workplace,
                        "Sindicalizado": request.body.profissional_eleitoral.Sindicalizado,
                        "associationNumber": request.body.profissional_eleitoral.associationNumber,
                        "militante": request.body.profissional_eleitoral.militante,
                        "directorsindication": request.body.profissional_eleitoral.directorsindication,
                        "electoraltitle": request.body.profissional_eleitoral.electoraltitle,
                        "zone": request.body.profissional_eleitoral.zone,
                        "section": request.body.profissional_eleitoral.section,
                        "county": request.body.profissional_eleitoral.county,
                        "state": request.body.profissional_eleitoral.state
                    },
                    "notificacoes_anotacoes": {
                        "correios": request.body.notificacoes_anotacoes.correios,
                        "telefone": request.body.notificacoes_anotacoes.telefone,
                        "sms": request.body.notificacoes_anotacoes.sms,
                        "whatsapp": request.body.notificacoes_anotacoes.whatsapp,
                        "email": request.body.notificacoes_anotacoes.email,
                        "score": request.body.notificacoes_anotacoes.score,
                        "history": request.body.notificacoes_anotacoes.history
                    },
                    "dataUpdate": new Date(Date.now())
                }
            }

            db.db("baseinit").collection("pessoa").updateOne({ "dados_pessoais.cpf": request.params.id }, newvalues, function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.modifiedCount != 0) {

                        response.status(status.CREATED).send(JSON.stringify("Usuario atualizado com sucesso."));

                    } else {

                        response.status(status.NOT_FOUND).send(JSON.stringify("Usuario nao encontrado"));

                    }
                }
                db.close();

            });

        }

    });

}

///DELETE Pessoa
exports.deletePessoa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase

            db.db("baseinit").collection("pessoa").deleteOne({ "dados_pessoais.cpf": request.params.id }, function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.deletedCount != 0) {

                        response.status(status.GONE).send(JSON.stringify("Usuario deletado com sucesso."));

                    } else {

                        response.status(status.NOT_FOUND).send(JSON.stringify("Usuario nao encontrado"));

                    }
                }
                db.close();

            });

        }
    });

}