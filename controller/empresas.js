var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');


///GET Empresa
exports.getEmpresa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            db.db("baseinit").collection("empresas").find({}).toArray(function (err, res) {
                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.OK).send(JSON.stringify("Nenhum Empresa foi Cadastrada."));
                    }

                }

                db.close();
            });

        }
    });

}

///GET Empresa:ID
exports.getOnlyEmpresa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            db.db("baseinit").collection("empresas").find({ "cnpj": parseInt(request.params.id) }).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.OK).send(JSON.stringify("Empresa nao encontrada."));
                    }

                }
                db.close();
            });

        }
    });

}

///POST Empresa
exports.postEmpresa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            var dbo = db.db("baseinit");

            ///Verifa se cpf ja existe na base
            dbo.collection("empresas").find({ "cnpj": parseInt(request.body.cnpj) }).toArray(function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {

                        response.status(status.OK).send(JSON.stringify("Cadastro da Empresa foi encontrado em nossa base."));

                    } else {

                        ///Object para inserção
                        var myobj = {
                            "nomefantasia": request.body.nomefantasia,
                            "cnpj": parseInt(request.body.cnpj),
                            "segmento": request.body.segmento,
                            "atividade": request.body.atividade,
                            "cep": parseInt(request.body.cep),
                            "endereco": request.body.endereco,
                            "num": request.body.num,
                            "complemento": request.body.casa,
                            "bairro": request.body.bairro,
                            "cidade": request.body.cidade,
                            "estado": request.body.estado,
                            "contato_principal": request.body.contato_principal,
                            "telefone": request.body.telefone,
                            "celular": request.body.celular,
                            "email": request.body.email,
                            "facebook": request.body.facebook,
                            "twitter": request.body.twitter,
                            "instagram": request.body.instagram,
                            "datacreate": new Date(Date.now()),
                            "dataUpdate": new Date(Date.now())
                        }

                        dbo.collection("empresas").insertOne(myobj, function (err, res) {

                            if (err) {

                                response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                            }
                            else {

                                response.status(status.OK).send(JSON.stringify("Empresa cadastrada com sucesso"));

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

///PUT Empresa
exports.putEmpresa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            /// DataBase            
            var newvalues = {
                $set: {
                    "nomefantasia": request.body.nomefantasia,
                    "cnpj": parseInt(request.body.cnpj),
                    "segmento": request.body.segmento,
                    "atividade": request.body.atividade,
                    "cep": parseInt(request.body.cep),
                    "endereco": request.body.endereco,
                    "num": request.body.num,
                    "complemento": request.body.complemento,
                    "bairro": request.body.bairro,
                    "cidade": request.body.cidade,
                    "estado": request.body.estado,
                    "contato_principal": request.body.contato_principal,
                    "telefone": request.body.telefone,
                    "celular": request.body.celular,
                    "email": request.body.email,
                    "facebook": request.body.facebook,
                    "twitter": request.body.twitter,
                    "instagram": request.body.instagram,
                    "dataUpdate": new Date(Date.now())
                }
            }

            db.db("baseinit").collection("empresas").updateOne({ "cnpj": parseInt(request.params.id) }, newvalues, function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.modifiedCount != 0) {

                        response.status(status.OK).send(JSON.stringify("Empresa atualizada com sucesso."));

                    } else {

                        response.status(status.OK).send(JSON.stringify("Empresa nao encontrado"));

                    }
                }
                db.close();

            });

        }

    });

}

///DELETE Empresa
exports.deleteEmpresa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase            
            db.db("baseinit").collection("empresas").deleteOne({ "cnpj": parseInt(request.params.id) }, function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.deletedCount != 0) {

                        response.status(status.OK).send(JSON.stringify("Empresa deletada com sucesso."));

                    } else {

                        response.status(status.OK).send(JSON.stringify("Empresa nao encontrada."));

                    }
                }
                db.close();

            });

        }
    });

}