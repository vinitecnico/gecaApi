var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');


///GET Colegio
exports.getColegio = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            db.db("baseinit").collection("colegios").find({}).toArray(function (err, res) {
                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.OK).send(JSON.stringify("Nenhum Colegio foi Cadastrada."));
                    }

                }

                db.close();
            });

        }
    });

}

///GET Colegio:ID
exports.getOnlyColegio = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            db.db("baseinit").collection("colegios").find({ "cep": parseInt(request.params.id) }).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.OK).send(JSON.stringify("Colegio nao encontrada."));
                    }

                }
                db.close();
            });

        }
    });

}

///POST Colegio
exports.postColegio = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            var dbo = db.db("baseinit");

            ///Verifa se cpf ja existe na base
            dbo.collection("colegios").find({ "cep": parseInt(request.body.cep) }).toArray(function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {

                        response.status(status.OK).send(JSON.stringify("Cadastro da Colegio foi encontrado em nossa base."));

                    } else {

                        ///Object para inserção
                        var myobj = {
                            "nomeescolaColeg": request.body.nomeescolaColeg,
                            "numeleitores": parseInt(request.body.numeleitores),
                            "zona":  parseInt(request.body.zona),
                            "sessao":  parseInt(request.body.sessao),
                            "sessaoespecial":  parseInt(request.body.sessaoespecial),
                            "cep":  parseInt(request.body.cep),
                            "endereco": request.body.endereco,
                            "num": request.body.num,
                            "complemento": request.body.complemento,
                            "bairro": request.body.bairro,
                            "cidade": request.body.cidade,
                            "estado": request.body.estado,
                            "posgps": [
                                request.body.posgps[0],
                                request.body.posgps[1]
                            ],
                            "datacreate": new Date(Date.now()),
                            "dataUpdate": new Date(Date.now())
                        }

                        dbo.collection("colegios").insertOne(myobj, function (err, res) {

                            if (err) {

                                response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                            }
                            else {

                                response.status(status.OK).send(JSON.stringify("Colegio cadastrada com sucesso"));

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

///PUT Colegio
exports.putColegio = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            /// DataBase            
            var newvalues = {
                $set: {
                    "nomeescolaColeg": request.body.nomeescolaColeg,
                    "numeleitores": parseInt(request.body.numeleitores),
                    "zona":  parseInt(request.body.zona),
                    "sessao":  parseInt(request.body.sessao),
                    "sessaoespecial":  parseInt(request.body.sessaoespecial),
                    "cep":  parseInt(request.body.cep),
                    "endereco": request.body.endereco,
                    "num": request.body.num,
                    "complemento": request.body.complemento,
                    "bairro": request.body.bairro,
                    "cidade": request.body.cidade,
                    "estado": request.body.estado,
                    "posgps": [
                        request.body.posgps[0],
                        request.body.posgps[1]
                    ],
                    "dataUpdate": new Date(Date.now())
                }
            }

            db.db("baseinit").collection("colegios").updateOne({ "cep": parseInt(request.params.id) }, newvalues, function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.modifiedCount != 0) {

                        response.status(status.OK).send(JSON.stringify("Colegio atualizada com sucesso."));

                    } else {

                        response.status(status.OK).send(JSON.stringify("Colegio nao encontrado"));

                    }
                }
                db.close();

            });

        }

    });

}

///DELETE Colegio
exports.deleteColegio = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase            
            db.db("baseinit").collection("colegios").deleteOne({ "cep": parseInt(request.params.id) }, function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.deletedCount != 0) {

                        response.status(status.OK).send(JSON.stringify("Colegio deletada com sucesso."));

                    } else {

                        response.status(status.OK).send(JSON.stringify("Colegio nao encontrada."));

                    }
                }
                db.close();

            });

        }
    });

}