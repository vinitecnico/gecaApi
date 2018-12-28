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
                        response.status(status.NOT_FOUND).send(JSON.stringify("Nenhum Feria foi Cadastrada."));
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
                        response.status(status.NOT_FOUND).send(JSON.stringify("Feira nao encontrada."));
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
            dbo.collection("feiras").find({ "zipcode": request.body.zipcode }).toArray(function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {

                        response.status(status.UNAUTHORIZED).send(JSON.stringify("Já existe feira cadastrada nesse endereço!"));

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

                        response.status(status.CREATED).send(JSON.stringify("Feira atualizada com sucesso."));

                    } else {

                        response.status(status.NOT_FOUND).send(JSON.stringify("Feira nao encontrado"));

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

                        response.status(status.GONE).send(JSON.stringify("Feira deletada com sucesso."));

                    } else {

                        response.status(status.NOT_FOUND).send(JSON.stringify("Feira nao encontrada."));

                    }
                }
                db.close();

            });

        }
    });

}

///POST import database
exports.postImportDatabase = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            var dbo = db.db("baseinit");
            var StringDecoder = require('string_decoder').StringDecoder;
            var d = new StringDecoder('utf8');

            const tb_feiras = require('../dbFile/tb_feiras.json');

            for (var i = 0; i < tb_feiras.length; i++) {
                ///Verifa se cpf ja existe na base

                if (tb_feiras[i].chr_dia && tb_feiras[i].chr_cep) {

                    dbo.collection("feiras").find({ "zipcode": tb_feiras[i].chr_cep }).toArray(function (err, res) {

                        if (err) {
                            console.log(err);
                        } else {

                            if (res.length == 0) {
                                ///Object para inserção
                                var myobj = {
                                    "name": d.write(tb_feiras[i].chr_nome),
                                    "weekday": tb_feiras[i].chr_dia,
                                    "zipcode": tb_feiras[i].chr_cep.replace('-', ''),
                                    "address": d.write(tb_feiras[i].chr_rua),
                                    "numberAddress": tb_feiras[i].chr_numero,
                                    "complement": d.write(tb_feiras[i].chr_complemento),
                                    "neighborhood": tb_feiras[i].chr_bairro,
                                    "city": d.write(tb_feiras[i].chr_cidade),
                                    "state": tb_feiras[i].chr_estado,
                                    "gps": tb_feiras[i].chr_gps,
                                    "datacreate": new Date(Date.now()),
                                    "dataUpdate": new Date(Date.now())
                                }

                                dbo.collection("feiras").insertOne(myobj, function (err, res) {

                                    if (err) {
                                        // response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                                        console.log(err);
                                    }
                                    else {

                                        // response.status(status.OK).send(JSON.stringify("Feira cadastrada com sucesso"));
                                        console.log("Feira cadastrada com sucesso");
                                    }

                                    db.close();

                                });
                            }

                        }
                        db.close();
                    });
                }
            }
        }

    });

}