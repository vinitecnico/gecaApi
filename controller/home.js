const MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
const ObjectId = require('mongodb').ObjectId;
const _ = require("lodash");
const Q = require('q');
const moment = require('moment');

const ignorObject = {
    "dados_pessoais.name": 0,
    "dados_pessoais.birthDate": 0,
    "dados_pessoais.cpf": 0,
    "dados_pessoais.rg": 0,
    "dados_pessoais.motherName": 0,
    "dados_pessoais.transgenero": 0,
    "dados_pessoais.orientacosexusal": 0,
    "dados_pessoais.socialName": 0,
    "endereco_contato.email": 0,
    "endereco_contato.zipcode": 0,
    "endereco_contato.address": 0,
    "endereco_contato.numberAddress": 0,
    "endereco_contato.complement": 0,
    "endereco_contato.neighborhood": 0,
    "endereco_contato.city": 0,
    "endereco_contato.gps": 0,
    "endereco_contato.state": 0,
    "endereco_contato.phone": 0,
    "endereco_contato.mobile": 0,
    "endereco_contato.facebook": 0,
    "endereco_contato.twitter": 0,
    "endereco_contato.instagram": 0,
    "profissional_eleitoral": 0,
    "notificacoes_anotacoes": 0,
    "endereco_contato": 0,
    "file": 0,
    "datacreate": 0,
    "dataUpdate": 0,
    "dataCreate": 0,
    "userUpdate": 0
}


function getCountCollection(db, collectionName) {
    const defer = Q.defer();
    db.db("baseinit").collection(collectionName)
        .estimatedDocumentCount({}, function (err, count) {
            if (err) {
                defer.reject(JSON.stringify(err));
            } else {
                defer.resolve(count);
            }
        });

    return defer.promise;
}

function getTotalCharts(db) {
    const defer = Q.defer();
    db.db('baseinit').collection('pessoa')
        .find({})
        .project(ignorObject)
        .toArray(function (err, res) {
            if (err) {
                defer.reject(JSON.stringify(err));
            } else {
                const charts = {
                    gender: {}
                };

                charts.gender = _.chain(res)
                    .map((x) => {
                        return _.lowerCase(x.dados_pessoais.sexo) == 'masculino' ? 'male' : 'female';
                    })
                    .countBy()
                    .value();

                defer.resolve(charts);
            }
        });
    return defer.promise;
}

function getTotalChartsEtnia(db) {
    const defer = Q.defer();
    db.db('baseinit')
        .collection('pessoa')
        .find({})
        .project(ignorObject)
        .toArray(function (err, res) {
            if (err) {
                defer.reject(JSON.stringify(err));
            } else {
                const charts = {
                    etnia: {}
                };

                charts.etnia = _.chain(res)
                    .map((x) => {
                        switch (_.lowerCase(x.dados_pessoais.etnia)) {
                            case "parda":
                                return 'parda';
                            case "negro":
                                return 'negro';
                            case "latino hispanico":
                                return 'latino/hispânico';
                            case "asiatico":
                                return 'asiatico';
                            case "branco":
                                return 'branco';
                            default:
                                return 'outra';
                        }
                    })
                    .sortBy()
                    .countBy()
                    .value();

                defer.resolve(charts);
            }
        });
    return defer.promise;
}

function cacheHomeData(db) {
    const defer = Q.defer();
    db.db('baseinit')
        .collection('home')
        .find({})
        .toArray(function (err, res) {
            if (err) {
                defer.reject(JSON.stringify(err));
            } else {
                if (res.length <= 0) {
                    return insertHomeData(db);
                } else {
                    const data = _.first(res);
                    const now = moment();
                    const tokenData = moment(data.expires_in);
                    if (now.diff(tokenData, 'seconds') > 0) {
                        return deleteHomeData(db, data._id)
                            .then(() => {
                                return insertHomeData(db);
                            });
                    } else {
                        defer.resolve([data]);
                    }
                }
            }
        });
    return defer.promise;
}

function insertHomeData(db) {
    const defer = Q.defer();
    const myObjinside = {
        totalItems: {},
        charts: {}
    }
    const promises = [];

    const items = [{
        collectionName: 'pessoa',
        fieldName: 'pessoa'
    }, {
        collectionName: 'feiras',
        fieldName: 'feiras'
    }, {
        collectionName: 'empresas',
        fieldName: 'empresas'
    }, {
        collectionName: 'colegios',
        fieldName: 'colegios'
    }];

    promises.push(getTotalCharts(db)
        .then((data) => {
            myObjinside.charts = data;
            return Q.resolve(data);
        })
        .catch((e) => {
            return Q.reject(e);
        }));

    promises.push(getTotalChartsEtnia(db)
        .then((data) => {
            myObjinside.charts.etnia = data.etnia;
            return Q.resolve(data);
        })
        .catch((e) => {
            return Q.reject(e);
        }));

    for (let i = 0; i < items.length; i++) {
        promises.push(getCountCollection(db, items[i].collectionName)
            .then((data) => {
                myObjinside.totalItems[items[i].fieldName] = data;
                return Q.resolve(data);
            })
            .catch((e) => {
                return Q.reject(e);
            }));
    }

    Q.all(promises)
        .then(() => {
            myObjinside.expires_in = moment().add(2, 'hours');
            db.db('baseinit')
                .collection("home")
                .insertOne(myObjinside, function (err, res) {
                    if (err) {
                        console.log(erro);
                    }
                    defer.resolve([myObjinside]);
                });
        });


    return defer.promise;
}

function deleteHomeData(db, _id) {
    const defer = Q.defer();
    db.db("baseinit")
        .collection("home")
        .deleteOne({ _id: ObjectId(_id) }, function (err, res) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(true);
            }
        });

    return defer.promise;
}

///GET Home
exports.getCountersHome = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true },
        function (erro, db) {
            if (erro) {
                db.close();
                response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
            } else {
                cacheHomeData(db)
                    .then((data) => {
                        response.status(status.OK).send(data);
                    })
                    .catch((err) => {
                        response.status(status.NOT_FOUND).send(JSON.stringify(err));
                    })
                    .finally(db.close);
            }
        });
}
