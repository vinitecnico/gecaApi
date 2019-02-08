const MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
const ObjectId = require('mongodb').ObjectId;
const Q = require('q');
const _ = require("lodash");
require('isomorphic-fetch'); // or another library of choice.
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: require("../conf/config").keyDropbox });


///GET gabinete
exports.getGabinete = (request, response, next) => {
    const sort = {
        active: request.query.active || 'gabineteNumber',
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
                { "gabineteNumber": { "$regex": request.query.value, "$options": "i" } },
                { "type": { "$regex": request.query.value, "$options": "i" } },
                { "subject": { "$regex": request.query.value, "$options": "i" } }
            ]
        };
    }
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            const promises = [];

            promises.push(db.db("baseinit").collection('gabinete').find(filter).count());

            promises.push(db.db('baseinit')
                .collection('gabinete')
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
                    response.status(status.NOT_FOUND).send(JSON.stringify("Gabinete nao encontrada."));
                })
                .finally(db.close);
        }
    });

}

///GET Gabinete:ID
exports.getOnlyGabinete = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            db.db("baseinit").collection("gabinete").find({ _id: ObjectId(request.params.id) }).toArray(function (err, res) {
                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {
                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.NOT_FOUND).send(JSON.stringify("gabinete não encontrada."));
                    }
                }
                db.close();
            });
        }
    });
}

///POST Gabinete
exports.postGabinete = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            /// DataBase
            var dbo = db.db("baseinit");

            ///Verifa se numero ja existe na base
            dbo.collection("gabinete").find({ "gabineteNumber": request.body.number }).toArray(function (err, res) {
                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {

                    if (res.length != 0) {
                        response.status(status.UNAUTHORIZED).send(JSON.stringify("Já existe gabinete cadastrado com esse número!"));
                    } else {
                        ///Object para inserção
                        var myobj = {
                            "gabineteNumber": request.body.gabineteNumber,
                            "type": request.body.type,
                            "subject": request.body.subject,
                            "secretary": request.body.secretary,
                            "neighborhood": request.body.neighborhood,
                            "situation": request.body.situation,
                            "url": request.body.url,
                            "fileName": request.body.fileName,
                            "userCreate": request.decoded.name,
                            "dataCreate": new Date(Date.now()),
                            "userUpdate": request.decoded.name,
                            "dataUpdate": new Date(Date.now())
                        }

                        dbo.collection("gabinete").insertOne(myobj, function (err, res) {
                            if (err) {
                                response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                            }
                            else {
                                response.status(status.OK).send(JSON.stringify("Gabinete cadastrado com sucesso"));
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

///PUT Gabinete
exports.putGabinete = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            /// DataBase            
            var newvalues = {
                $set: {
                    "gabineteNumber": request.body.gabineteNumber,
                    "type": request.body.type,
                    "subject": request.body.subject,
                    "secretary": request.body.secretary,
                    "neighborhood": request.body.neighborhood,
                    "situation": request.body.situation,
                    "url": request.body.url,
                    "fileName": request.body.fileName,
                    "userUpdate": request.decoded.name,
                    "dataUpdate": new Date(Date.now())
                }
            }

            const promises = [];

            promises.push(deleteFile(db, request.params.id, request.body.fileName));

            promises.push(db.db("baseinit").collection("gabinete")
                .updateOne({ _id: ObjectId(request.params.id) }, newvalues, function (err, res) {
                    if (err) {
                        return Q.reject(err);
                    } else {
                        if (res.modifiedCount != 0) {
                            return Q.resolve(true);
                        } else {
                            return Q.reject('Gabinete nao encontrado');
                        }
                    }
                }));

            Q.all(promises)
                .then(() => {
                    db.close();
                    response.status(status.CREATED)
                        .send(JSON.stringify("Gabinete atualizado com sucesso."));
                })
                .catch((error) => {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(error));
                });
        }
    });
}

function deleteFile(db, id, fileName) {
    const defer = Q.defer();
    db.db('baseinit')
        .collection('gabinete')
        .find({ _id: ObjectId(id) })
        .toArray(function (err, res) {
            if (err) {
                defer.reject(JSON.stringify(err));
            } else {
                const data = _.first(res);
                if (data && (!fileName && data && data.fileName) ||
                    (data.file && data.fileName && data.fileName != fileName)) {
                    dbx.filesDelete({ path: `/${data.fileName}` })
                        .then((result) => {
                            defer.resolve(true);
                        })
                        .catch((error) => {
                            defer.resolve(false);
                        });
                } else {
                    defer.resolve(true);
                }
            }
        });
    return defer.promise;
}

///DELETE Gabinete
exports.deleteGabinete = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            const promises = [];
                promises.push(deleteFile(db, request.params.id, null));

                promises.push(db.db("baseinit")
                    .collection("gabinete")
                    .deleteOne({ _id: ObjectId(request.params.id) },
                        function (err, res) {
                            if (err) {
                                return Q.reject(err);
                            } else {
                                if (res.deletedCount != 0) {
                                    return Q.resolve(true);
                                } else {
                                    return Q.reject('Gabinete nao encontrado');
                                }
                            }
                        }));

                Q.all(promises)
                    .then(() => {
                        db.close();
                        response.status(status.GONE).send(JSON.stringify("Gabinete deletado com sucesso."));
                    })
                    .catch((error) => {
                        response.status(status.BAD_REQUEST).send(JSON.stringify(error));
                    });
        }
    });
}