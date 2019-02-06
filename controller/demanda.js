const MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
const ObjectId = require('mongodb').ObjectId;
const Q = require('q');
const _ = require("lodash");


///GET demanda
exports.getDemanda = (request, response, next) => {
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
                { "type": { "$regex": request.query.value, "$options": "i" } },
                { "responsible": { "$regex": request.query.value, "$options": "i" }},
                { "city": { "$regex": request.query.value, "$options": "i" }}
            ]
        };
    }
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            const promises = [];

            promises.push(db.db("baseinit").collection('demanda').find(filter).count());

            promises.push(db.db('baseinit')
                .collection('demanda')
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
                    response.status(status.NOT_FOUND).send(JSON.stringify("demanda nao encontrada."));
                })
                .finally(db.close);
        }
    });

}

///GET Demanda:ID
exports.getOnlyDemanda = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            db.db("baseinit").collection("demanda").find({ _id: ObjectId(request.params.id) }).toArray(function (err, res) {
                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {
                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.NOT_FOUND).send(JSON.stringify("demanda não encontrada."));
                    }
                }
                db.close();
            });
        }
    });
}

///POST Demanda
exports.postDemanda = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true },
        function (erro, db) {
            if (erro) {
                response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
            } else {
                const dbo = db.db("baseinit");
                const myobj = {
                    "name": request.body.name,
                    "type": request.body.type,
                    "secretary": request.body.secretary,
                    "responsible": request.body.responsible,
                    "zipcode": request.body.zipcode,
                    "address": request.body.address,
                    "numberAddress": request.body.numberAddress,
                    "complement": request.body.complement,
                    "neighborhood": request.body.neighborhood,
                    "city": request.body.city,
                    "state": request.body.state,
                    "gps": request.body.gps,
                    "userCreate": request.decoded.name,
                    "dataCreate": new Date(Date.now()),
                    "userUpdate": request.decoded.name,
                    "dataUpdate": new Date(Date.now())
                }

                dbo.collection("demanda").insertOne(myobj, function (err, res) {
                    if (err) {
                        response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                    } else {
                        response.status(status.OK).send(JSON.stringify("Demanda cadastrado com sucesso"));
                    }
                    db.close();
                });
            }
        });
}

///PUT Demanda
exports.putDemanda = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            /// DataBase            
            const newvalues = {
                $set: {
                    "name": request.body.name,
                    "type": request.body.type,
                    "secretary": request.body.secretary,
                    "responsible": request.body.responsible,
                    "zipcode": request.body.zipcode,
                    "address": request.body.address,
                    "numberAddress": request.body.numberAddress,
                    "complement": request.body.complement,
                    "neighborhood": request.body.neighborhood,
                    "city": request.body.city,
                    "state": request.body.state,
                    "gps": request.body.gps,
                    "userUpdate": request.decoded.name,
                    "dataUpdate": new Date(Date.now())
                }
            }

            db.db("baseinit").collection("demanda").updateOne({ _id: ObjectId(request.params.id) }, newvalues, function (err, res) {
                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {
                    if (res.modifiedCount != 0) {
                        response.status(status.CREATED).send(JSON.stringify("Demanda atualizado com sucesso."));
                    } else {
                        response.status(status.NOT_FOUND).send(JSON.stringify("Demanda não encontrado"));
                    }
                }
                db.close();
            });
        }
    });

}

///DELETE Demanda
exports.deleteDemanda = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            /// DataBase            
            db.db("baseinit").collection("demanda").deleteOne({ _id: ObjectId(request.params.id) }, function (err, res) {
                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {
                    if (res.deletedCount != 0) {
                        response.status(status.GONE).send(JSON.stringify("Demanda deletado com sucesso."));
                    } else {
                        response.status(status.NOT_FOUND).send(JSON.stringify("Demanda não encontrado."));
                    }
                }
                db.close();
            });
        }
    });
}