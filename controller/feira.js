var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;


///GET Feira
exports.getFeira = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            db.db("baseinit").collection("feiras").find({}).toArray(function (err, res) {
                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.OK).send(JSON.stringify("Nenhum Feria foi Cadastrada."));
                    }

                }

                db.close();
            });

        }
    });

}

///GET Feira:ID
exports.getOnlyFeira = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            db.db("baseinit").collection("feiras").find({ _id: ObjectId(request.params.id) }).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.OK).send(JSON.stringify("Feira nao encontrada."));
                    }

                }
                db.close();
            });

        }
    });

}

///POST Feira
exports.postFeira = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            var dbo = db.db("baseinit");

            ///Verifa se cpf ja existe na base
            dbo.collection("feiras").find({ _id: ObjectId(request.params.id) }).toArray(function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {

                        response.status(status.OK).send(JSON.stringify("Cadastro da Feira foi encontrado em nossa base."));

                    } else {

                        ///Object para inserção
                        var myobj = {
                            "name": request.body.name,
                            "weekday": request.body.weekday,
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

                        dbo.collection("feiras").insertOne(myobj, function (err, res) {

                            if (err) {

                                response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                            }
                            else {

                                response.status(status.OK).send(JSON.stringify("Feira cadastrada com sucesso"));

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

///PUT Feira
exports.putFeira = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            /// DataBase            
            var newvalues = {
                $set: {
                    "name": request.body.name,
                    "weekday": request.body.weekday,
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

            db.db("baseinit").collection("feiras").updateOne({ _id: ObjectId(request.params.id) }, newvalues, function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.modifiedCount != 0) {

                        response.status(status.OK).send(JSON.stringify("Feira atualizada com sucesso."));

                    } else {

                        response.status(status.OK).send(JSON.stringify("Feira nao encontrado"));

                    }
                }
                db.close();

            });

        }

    });

}

///DELETE Feira
exports.deleteFeira = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase            
            db.db("baseinit").collection("feiras").deleteOne({ _id: ObjectId(request.params.id) }, function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.deletedCount != 0) {

                        response.status(status.OK).send(JSON.stringify("Feira deletada com sucesso."));

                    } else {

                        response.status(status.OK).send(JSON.stringify("Feira nao encontrada."));

                    }
                }
                db.close();

            });

        }
    });

}