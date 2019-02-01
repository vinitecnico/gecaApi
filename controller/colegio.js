var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;
const Q = require('q');
const _ = require("lodash");
const httpRequest = require('request');
const htmlDecode = require('js-htmlencode').htmlDecode;

///GET Colegio
exports.getColegio = (request, response, next) => {
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
                { "electoralzone": { "$regex": request.query.value, "$options": "i" } },
                { "section": { "$regex": request.query.value, "$options": "i" } },
                { "neighborhood": { "$regex": request.query.value, "$options": "i" } },
                { "city": { "$regex": request.query.value, "$options": "i" } }
            ]
        };
    }
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            const promises = [];

            promises.push(db.db("baseinit").collection('colegios').find(filter).count());

            promises.push(db.db('baseinit')
                .collection('colegios')
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
            dbo.collection("colegios").find({ name: request.body.name, zipcode: request.body.zipcode }).toArray(function (err, res) {

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
                            //"userCreate" : request.decoded.name,
                            "dataCreate": new Date(Date.now()),
                            //"userUpdate" : request.decoded.name,
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
                    //"userUpdate" : request.decoded.name,
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

///POST import database
exports.postImportDatabase = async (request, response, next) => {
    try {
        MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

            if (erro) {

                response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

            } else {
                /// DataBase
                var dbo = db.db("baseinit");
                var StringDecoder = require('string_decoder').StringDecoder;
                var d = new StringDecoder('utf8');
                var promises = [];

                const tb_colegios = require('../dbFile/tb_colegios.json');

                for (var i = 0; i < tb_colegios.length; i++) {

                    ///Object para inserção
                    var myobj = {
                        "name": htmlDecode(tb_colegios[i].chr_nome).toLowerCase(),
                        "numbervoters": tb_colegios[i].int_eleitores,
                        "electoralzone": tb_colegios[i].int_zona,
                        "section": tb_colegios[i].chr_secao,
                        "specialsection": tb_colegios[i].chr_secaoX,
                        "zipcode": tb_colegios[i].chr_cep ? htmlDecode(tb_colegios[i].chr_cep.replace('-', '')) : null,
                        "address": tb_colegios[i].chr_rua ? htmlDecode(tb_colegios[i].chr_rua).toLowerCase() : null,
                        "numberAddress": tb_colegios[i].chr_numero,
                        "complement": tb_colegios[i].chr_complemento ? htmlDecode(tb_colegios[i].chr_complemento).toLowerCase() : null,
                        "neighborhood": tb_colegios[i].chr_bairro ? tb_colegios[i].chr_bairro.toLowerCase() : null,
                        "city": tb_colegios[i].chr_cidade ? htmlDecode(tb_colegios[i].chr_cidade).toLowerCase() : null,
                        "state": tb_colegios[i].chr_estado || 'SP',
                        "gps": tb_colegios[i].chr_gps,
                        "datacreate": new Date(Date.now()),
                        "dataUpdate": new Date(Date.now())
                    }

                    const requestAddress = (`${item.address} ${item.numberAddress}-${item.neighborhood},${item.city}`).replace(' ', '%20');

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

                            promises.push(dbo.collection("colegios").insertOne(item));
                        }
                    });

                }
                Q.all(promises)
                    .then(() => {
                        //console.log('test');
                        response.status(status.OK).send(JSON.stringify("Colégios cadastrados com sucesso"));
                    });
            }

        });
    }
    catch (e) {
        console.log(e);
    }
}