var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;


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
                        response.status(status.NOT_FOUND).send(JSON.stringify("Nenhum Colegio foi Cadastrada."));
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

            db.db("baseinit").collection("colegios").find({ _id: ObjectId(request.params.id) }).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.NOT_FOUND).send(JSON.stringify("Colegio nao encontrada."));
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
            dbo.collection("colegios").find({name : request.body.name , zipcode: request.body.zipcode}).toArray(function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {

                        response.status(status.UNAUTHORIZED).send(JSON.stringify("Cadastro do Colegio foi encontrado em nossa base."));

                    } else {

                        ///Object para inserção
                        var myobj = {
                            "name": request.body.name,
                            "numbervoters": request.body.numbervoters,
                            "electoralzone": request.body.electoralzone,
                            "section": request.body.section,
                            "specialsection": request.body.specialsection,
                            "zipcode": request.body.zipcode,
                            "address": request.body.address,
                            "numberAddress": request.body.numberAddress,
                            "complement": request.body.complement,
                            "neighborhood": request.body.neighborhood,
                            "city": request.body.city,
                            "state": request.body.state,
                            "gps": request.body.gps,
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
                    "name": request.body.name,
                    "numbervoters": request.body.numbervoters,
                    "electoralzone": request.body.electoralzone,
                    "section": request.body.section,
                    "specialsection": request.body.specialsection,
                    "zipcode": request.body.zipcode,
                    "address": request.body.address,
                    "numberAddress": request.body.numberAddress,
                    "complement": request.body.complement,
                    "neighborhood": request.body.neighborhood,
                    "city": request.body.city,
                    "state": request.body.state,
                    "gps": request.body.gps,
                    "dataUpdate": new Date(Date.now())
                }
            }

            db.db("baseinit").collection("colegios").updateOne({ _id: ObjectId(request.params.id) }, newvalues, function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.modifiedCount != 0) {

                        response.status(status.CREATED).send(JSON.stringify("Colegio atualizada com sucesso."));

                    } else {

                        response.status(status.NOT_FOUND).send(JSON.stringify("Colegio nao encontrado"));

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
            db.db("baseinit").collection("colegios").deleteOne({ _id: ObjectId(request.params.id) }, function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.deletedCount != 0) {

                        response.status(status.GONE).send(JSON.stringify("Colegio deletado com sucesso."));

                    } else {

                        response.status(status.NOT_FOUND).send(JSON.stringify("Colegio nao encontrada."));

                    }
                }
                db.close();

            });

        }
    });

}