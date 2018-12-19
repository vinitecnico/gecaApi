var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;


///GET USER
exports.getPessoa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            db.db("baseinit").collection("pessoa").find({}).toArray(function (err, res) {
                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.NOT_FOUND).send(JSON.stringify("Nenhum usuario foi Cadastrado."));
                    }

                }

                db.close();
            });

        }
    });

}

///GET USER:ID
exports.getOnlyPessoa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            
            db.db("baseinit").collection("pessoa").find({ _id: ObjectId(request.params.id) }).toArray(function (err, res) {
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
                                "nome": request.body.dados_pessoais.nome,
                                "cpf": request.body.dados_pessoais.cpf,
                                "rg": request.body.dados_pessoais.rg,
                                "datanasc": "1985-05-11T00:00:00.000Z",
                                "etnia": request.body.dados_pessoais.etnia,
                                "nomemae": request.body.dados_pessoais.nomemae,
                                "idsexo": parseInt(request.body.dados_pessoais.idsexo),
                                "idtransgenero": parseInt(request.body.dados_pessoais.idtransgenero),
                                "idorientsex": parseInt(request.body.dados_pessoais.idorientsex),
                                "nomesocial": request.body.dados_pessoais.nomesocial
                            },
                            "endereco_contato": {
                                "cep": parseInt(request.body.endereco_contato.cep),
                                "end": request.body.endereco_contato.end,
                                "comp": request.body.endereco_contato.comp,
                                "bairro": request.body.endereco_contato.bairro,
                                "cidade": request.body.endereco_contato.cdade,
                                "estado": request.body.endereco_contato.estado,
                                "posgps": [
                                    request.body.endereco_contato.posgps[0],
                                    request.body.endereco_contato.posgps[1]
                                ],
                                "telefone": request.body.endereco_contato.telefone,
                                "celular": request.body.endereco_contato.celular,
                                "email": request.body.endereco_contato.email,
                                "facebook": request.body.endereco_contato.facebook,
                                "twitter": request.body.endereco_contato.twitter,
                                "instagram": request.body.endereco_contato.instagram
                            },
                            "profissional_eleitoral": {
                                "empresa": request.body.profissional_eleitoral.empresa,
                                "dataadmissao": "2018-12-14T14:57:13.371Z",
                                "datademissao": "2018-12-14T14:57:13.371Z",
                                "funcaoexercida": request.body.profissional_eleitoral.funcaoexercida,
                                "localdetrabalho": request.body.profissional_eleitoral.localdetrabalho,
                                "idSindicalizado": parseInt(request.body.profissional_eleitoral.idSindicalizado),
                                "numassociacao": parseInt(request.body.profissional_eleitoral.numassociacao),
                                "idMilitante": parseInt(request.body.profissional_eleitoral.idMilitante),
                                "indicacaodiretor": request.body.profissional_eleitoral.indicacaodiretor,
                                "tituloeleitoral": parseInt(request.body.profissional_eleitoral.tituloeleitoral),
                                "zona": parseInt(request.body.profissional_eleitoral.zona),
                                "secao": parseInt(request.body.profissional_eleitoral.secao),
                                "municipio": request.body.profissional_eleitoral.secao.municipio,
                                "uf": request.body.profissional_eleitoral.uf
                            },
                            "notificacoes_anotacoes": {
                                "correios": request.body.notificacoes_anotacoes.correios,
                                "telefone": request.body.notificacoes_anotacoes.telefone,
                                "sms": request.body.notificacoes_anotacoes.sms,
                                "whatsapp": request.body.notificacoes_anotacoes.whatsapp,
                                "email": request.body.notificacoes_anotacoes.email,
                                "pontuacao": parseInt(request.body.notificacoes_anotacoes.pontuacao),
                                "historico": request.body.notificacoes_anotacoes.historico,
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
                        "nome": request.body.dados_pessoais.nome,
                        "cpf": request.body.dados_pessoais.cpf,
                        "rg": request.body.dados_pessoais.rg,
                        "datanasc": "1985-05-11T00:00:00.000Z",
                        "etnia": request.body.dados_pessoais.etnia,
                        "nomemae": request.body.dados_pessoais.nomemae,
                        "idsexo": parseInt(request.body.dados_pessoais.idsexo),
                        "idtransgenero": parseInt(request.body.dados_pessoais.idtransgenero),
                        "idorientsex": parseInt(request.body.dados_pessoais.idorientsex),
                        "nomesocial": request.body.dados_pessoais.nomesocial
                    },
                    "endereco_contato": {
                        "cep": parseInt(request.body.endereco_contato.cep),
                        "end": request.body.endereco_contato.end,
                        "comp": request.body.endereco_contato.comp,
                        "bairro": request.body.endereco_contato.bairro,
                        "cidade": request.body.endereco_contato.cdade,
                        "estado": request.body.endereco_contato.estado,
                        "posgps": [
                            request.body.endereco_contato.posgps[0],
                            request.body.endereco_contato.posgps[1]
                        ],
                        "telefone": request.body.endereco_contato.telefone,
                        "celular": request.body.endereco_contato.celular,
                        "email": request.body.endereco_contato.email,
                        "facebook": request.body.endereco_contato.facebook,
                        "twitter": request.body.endereco_contato.twitter,
                        "instagram": request.body.endereco_contato.instagram
                    },
                    "profissional_eleitoral": {
                        "empresa": request.body.profissional_eleitoral.empresa,
                        "dataadmissao": "2018-12-14T14:57:13.371Z",
                        "datademissao": "2018-12-14T14:57:13.371Z",
                        "funcaoexercida": request.body.profissional_eleitoral.funcaoexercida,
                        "localdetrabalho": request.body.profissional_eleitoral.localdetrabalho,
                        "idSindicalizado": parseInt(request.body.profissional_eleitoral.idSindicalizado),
                        "numassociacao": parseInt(request.body.profissional_eleitoral.numassociacao),
                        "idMilitante": parseInt(request.body.profissional_eleitoral.idMilitante),
                        "indicacaodiretor": request.body.profissional_eleitoral.indicacaodiretor,
                        "tituloeleitoral": parseInt(request.body.profissional_eleitoral.tituloeleitoral),
                        "zona": parseInt(request.body.profissional_eleitoral.zona),
                        "secao": parseInt(request.body.profissional_eleitoral.secao),
                        "municipio": request.body.profissional_eleitoral.secao.municipio,
                        "uf": request.body.profissional_eleitoral.uf
                    },
                    "notificacoes_anotacoes": {
                        "correios": request.body.notificacoes_anotacoes.correios,
                        "telefone": request.body.notificacoes_anotacoes.telefone,
                        "sms": request.body.notificacoes_anotacoes.sms,
                        "whatsapp": request.body.notificacoes_anotacoes.whatsapp,
                        "email": request.body.notificacoes_anotacoes.email,
                        "pontuacao": parseInt(request.body.notificacoes_anotacoes.pontuacao),
                        "historico": request.body.notificacoes_anotacoes.historico,
                        "datacreatehistory": new Date(Date.now())
                    },                    
                    "dataUpdate": new Date(Date.now())
                }
            }
            
            db.db("baseinit").collection("pessoa").updateOne({ _id: ObjectId(request.params.id) }, newvalues, function (err, res) {

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

            db.db("baseinit").collection("pessoa").deleteOne({ _id: ObjectId(request.params.id) }, function (err, res) {
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