var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
const ObjectId = require('mongodb').ObjectId;
const Q = require('q');
const _ = require("lodash");
const httpRequest = require('request');
const htmlDecode = require('js-htmlencode').htmlDecode;

///GET Feira
exports.getFeira = (request, response, next) => {
    const sort = {
        active: request.query.active || 'name',
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
                { "name": { "$regex": request.query.value, "$options": "i" } },
                { "weekday": { "$regex": request.query.value, "$options": "i" } },
                { "city": { "$regex": request.query.value, "$options": "i" } }
            ]
        };
    }
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            const promises = [];

            promises.push(db.db("baseinit").collection('feiras').find(filter).count());

            promises.push(db.db('baseinit')
                .collection('feiras')
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
                    response.status(status.NOT_FOUND).send(JSON.stringify("Feira nao encontrada."));
                })
                .finally(db.close);
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
                            "name": request.body.name.toLowerCase(),
                            "weekday": request.body.weekday,
                            "zipcode": request.body.zipcode,
                            "address": request.body.address,
                            "numberAddress": request.body.numberAddress,
                            "complement": request.body.complement,
                            "neighborhood": request.body.neighborhood,
                            "city": request.body.city,
                            "state": request.body.state,
                            "gps": request.body.gps,
                            //"userCreate" : request.decoded.name,
                            "dataCreate": new Date(Date.now()),
                            //"userUpdate" : request.decoded.name,
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
                    "name": request.body.name.toLowerCase(),
                    "weekday": request.body.weekday,
                    "zipcode": request.body.zipcode,
                    "address": request.body.address,
                    "numberAddress": request.body.numberAddress,
                    "complement": request.body.complement,
                    "neighborhood": request.body.neighborhood,
                    "city": request.body.city,
                    "state": request.body.state,
                    "gps": request.body.gps,
                    //"userUpdate" : request.decoded.name,
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
exports.postImportDatabase = async (request, response, next) => {
    try {
        MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, (erro, db) => {
            if (erro) {
                response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
            } else {
                /// DataBase
                var dbo = db.db("baseinit");
                var StringDecoder = require('string_decoder').StringDecoder;
                var promises = [];

                const tb_feiras = require('../dbFile/tb_feiras.json');

                for (var i = 0; i < tb_feiras.length; i++) {
                    if (tb_feiras[i].chr_nome) {

                        const item = {
                            "name": htmlDecode(tb_feiras[i].chr_nome.trim().toLowerCase()),
                            "weekday": htmlDecode(tb_feiras[i].chr_dia.trim().toLowerCase()),
                            "zipcode": tb_feiras[i].chr_cep,
                            "address": tb_feiras[i].chr_rua ? htmlDecode(tb_feiras[i].chr_rua.trim().toLowerCase()) : null,
                            "numberAddress": tb_feiras[i].chr_numero,
                            "complement": tb_feiras[i].chr_complemento ? tb_feiras[i].chr_complemento.trim().toLowerCase() : null,
                            "neighborhood": htmlDecode(tb_feiras[i].chr_bairro.trim().toLowerCase()),
                            "city": tb_feiras[i].chr_cidade ? htmlDecode(tb_feiras[i].chr_cidade.trim().toLowerCase()) : null,
                            "state": tb_feiras[i].chr_estado,
                            "gps": tb_feiras[i].chr_gps,
                            "datacreate": new Date(Date.now()),
                            "dataUpdate": new Date(Date.now())
                        }

                        const requestAddress = (`${item.address}-${item.neighborhood},${item.city}`).replace(' ', '%20');

                        var clientServerOptions = {
                            uri: encodeURI('https://maps.googleapis.com/maps/api/geocode/json?address=' + requestAddress + '&key=' + require("../conf/config").keyGoogleMaps),
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };

                        httpRequest(clientServerOptions, (err, resp, body) => {
                            if (!err) {
                                body = JSON.parse(body);                                
                                if (!body.error_message) {
                                    const data = body && body.results ? _.first(body.results) : null;
                                    let findAddress = _.find(data.address_components, (x) => {
                                        return _.find(x.types, (y) => {
                                            return y.indexOf('route') >= 0;
                                        });
                                    });

                                    item.address = findAddress && findAddress.long_name ? findAddress.long_name : item.address;

                                    findAddress = _.find(data.address_components, (x) => {
                                        return _.find(x.types, (y) => {
                                            return y.indexOf('sublocality_level_1') >= 0;
                                        });
                                    });

                                    item.neighborhood = findAddress && findAddress.long_name ? findAddress.long_name : item.neighborhood;

                                    findAddress = _.find(data.address_components, (x) => {
                                        return _.find(x.types, (y) => {
                                            return y.indexOf('administrative_area_level_2') >= 0;
                                        });
                                    });

                                    item.city = findAddress && findAddress.long_name ? findAddress.long_name : item.city;

                                    findAddress = _.find(data.address_components, (x) => {
                                        return _.find(x.types, (y) => {
                                            return y.indexOf('administrative_area_level_1') >= 0;
                                        });
                                    });

                                    item.state = findAddress && findAddress.short_name ? findAddress.short_name : item.state;

                                    findAddress = _.find(data.address_components, (x) => {
                                        return _.find(x.types, (y) => {
                                            return y.indexOf('postal_code') >= 0;
                                        });
                                    });

                                    item.zipcode = findAddress && findAddress.long_name ? findAddress.long_name : item.zipcode;

                                    if (data.geometry && data.geometry.location) {
                                        item.gps = `${data.geometry.location.lat}, ${data.geometry.location.lng}`;
                                    }
                                }

                                promises.push(dbo.collection("feiras").insertOne(item));
                            }
                        });
                    }
                }

                Q.all(promises)
                    .then(() => {
                        response.status(status.OK).send(JSON.stringify("Feira cadastrada com sucesso"));
                    });
            }

        });
    }
    catch (e) {
        console.log(e);
    }
}