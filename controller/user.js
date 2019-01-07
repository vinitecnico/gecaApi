var MongoClient = require('mongodb').MongoClient;
const status    = require('http-status');
var ObjectId    = require('mongodb').ObjectId;
const Q         = require('q');
const _         = require("lodash");
var bcrypt      = require('bcryptjs');

///GET USER
exports.getUsers = (request, response, next) => {
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
                { "cpf": { "$regex": request.query.value, "$options": "i" } },
                { "email": { "$regex": request.query.value, "$options": "i" } }
            ]
        };
    }
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true },
        function (erro, db) {
            if (erro) {
                response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
            } else {
                const promises = [];

                promises.push(db.db("baseinit").collection('users').find(filter).count());

                promises.push(db.db('baseinit')
                    .collection('users')
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
                        response.status(status.NOT_FOUND).send(JSON.stringify("Usuário nao encontrado."));
                    })
                    .finally(db.close);

            }
        });

}

///GET USER:ID
exports.getOnlyUser = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            db.db("baseinit").collection("users").find({ _id: ObjectId(request.params.id) }).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.NOT_FOUND).send(JSON.stringify("Usuario nao encontrado"));
                    }

                }
                db.close();
            });

        }
    });

}

///POST USER
exports.postUser = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            var dbo = db.db("baseinit");

            ///Verifa se cpf ja existe na base
            dbo.collection("users").find({ cpf: parseInt(request.body.cpf) }).toArray(function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {

                        response.status(status.UNAUTHORIZED).send(JSON.stringify("Cadastro do usuario foi encontrado em nossa base."));

                    } else {

                        ///Object para inserção
                        var myobj = {
                            "name": request.body.name,
                            "cpf": request.body.cpf,
                            "phone": request.body.phone,
                            "email": request.body.email,
                            "password": bcrypt.hashSync(request.body.password, 10),
                            "imageTheme": request.body.imageTheme,
                            "titleTheme": request.body.titleTheme,
                            "imageUser": request.body.imageUser,
                            "defaultColor": request.body.defaultColor,
                            "menu": [request.body.menu],
                            "SubMenu": [request.body.subMenu],
                            "profile": request.body.profile,
                            "active": true,
                            "datecreate": new Date(Date.now()),
                            "dateUpdate": new Date(Date.now())
                        }

                        dbo.collection("users").insertOne(myobj, function (err, res) {

                            if (err) {

                                response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                            }
                            else {

                                response.status(status.OK).send(JSON.stringify("Usuario cadastrado com sucesso"));

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

///PUT USER
exports.putUser = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            /// DataBase
            var newvalues = {
                $set: {
                    "name": request.body.name,
                    "cpf": request.body.cpf,
                    "phone": request.body.phone,
                    "email": request.body.email,
                    "password": request.body.password,
                    "imageTheme": request.body.imageTheme,
                    "titleTheme": request.body.titleTheme,
                    "imageUser": request.body.imageUser,
                    "defaultColor": request.body.defaultColor,
                    "menu": [request.body.menu],
                    "SubMenu": [request.body.subMenu],
                    "profile": request.body.profile,
                    "active": true,
                    //"token": "#0339usdlfdk2394uslkfdwrouvkljfdk7",                    
                    "dateUpdate": new Date(Date.now())
                }
            }
            db.db("baseinit").collection("users").updateOne({ _id: ObjectId(request.params.id) }, newvalues, function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.modifiedCount != 0) {

                        response.status(status.CREATED).send(JSON.stringify("Usuario atualizado com sucesso."));

                    } else {

                        response.status(status.NOT_FOUND).send(JSON.stringify("Usuario nao encontrado"));

                    }
                }
                db.close();

            });

        }

    });

}

///DELETE USER
exports.deleteUser = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase

            db.db("baseinit").collection("users").deleteOne({ _id: ObjectId(request.params.id) }, function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.deletedCount != 0) {

                        response.status(status.GONE).send(JSON.stringify("Usuario deletado com sucesso."));

                    } else {

                        response.status(status.NOT_FOUND).send(JSON.stringify("Usuario nao encontrado"));

                    }
                }
                db.close();

            });

        }
    });

}