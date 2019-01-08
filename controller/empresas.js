var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;
const Q = require('q');
const _ = require("lodash");

///GET Empresa
exports.getEmpresa = (request, response, next) => {
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
                { "cnpj": { "$regex": request.query.value, "$options": "i" } },
                { "city": { "$regex": request.query.value, "$options": "i" } },
                { "mainContact": { "$regex": request.query.value, "$options": "i" } },
                { "phone": { "$regex": request.query.value, "$options": "i" } },
                { "mobile": { "$regex": request.query.value, "$options": "i" } }
            ]
        };
    }
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            const promises = [];

            promises.push(db.db("baseinit").collection('empresas').find(filter).count());

            promises.push(db.db('baseinit')
                .collection('empresas')
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
                    response.status(status.NOT_FOUND).send(JSON.stringify("Empresa não encontrada."));
                })
                .finally(db.close);
        }
    });

}

///GET Empresa:ID
exports.getOnlyEmpresa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            db.db("baseinit").collection("empresas").find({ cnpj: request.params.id }).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.NOT_FOUND).send(JSON.stringify("Empresa nao encontrada."));
                    }

                }
                db.close();
            });

        }
    });

}

///POST Empresa
exports.postEmpresa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            var dbo = db.db("baseinit");

            ///Verifa se cpf ja existe na base
            dbo.collection("empresas").find({ cnpj: request.body.cnpj }).toArray(function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {

                        response.status(status.UNAUTHORIZED).send(JSON.stringify("Cadastro da Empresa foi encontrado em nossa base."));

                    } else {

                        ///Object para inserção
                        var myobj = {
                            "name": request.body.name,
                            "cnpj": request.body.cnpj,
                            "segment": request.body.segment,
                            "activity": request.body.activity,
                            "zipcode": request.body.zipcode,
                            "address": request.body.address,
                            "numberAddress": request.body.numberAddress,
                            "complement": request.body.complement,
                            "neighborhood": request.body.neighborhood,
                            "city": request.body.city,
                            "state": request.body.state,
                            "gps": request.body.gps,
                            "mainContact": request.body.mainContact,
                            "phone": request.body.phone,
                            "mobile": request.body.mobile,
                            "email": request.body.email,
                            "facebook": request.body.facebook,
                            "twitter": request.body.twitter,
                            "instagram": request.body.instagram,
                            //"userCreate" : request.decoded.name,
                            "dataCreate": new Date(Date.now()),
                            //"userUpdate" : request.decoded.name,
                            "dataUpdate": new Date(Date.now())
                        }

                        dbo.collection("empresas").insertOne(myobj, function (err, res) {

                            if (err) {

                                response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                            }
                            else {

                                response.status(status.OK).send(JSON.stringify("Empresa cadastrada com sucesso"));

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

///PUT Empresa
exports.putEmpresa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            /// DataBase            
            var newvalues = {
                $set: {
                    "name": request.body.name,
                    "cnpj": request.body.cnpj,
                    "segment": request.body.segment,
                    "activity": request.body.activity,
                    "zipcode": request.body.zipcode,
                    "address": request.body.address,
                    "numberAddress": request.body.numberAddress,
                    "complement": request.body.complement,
                    "neighborhood": request.body.neighborhood,
                    "city": request.body.city,
                    "state": request.body.state,
                    "gps": request.body.gps,
                    "mainContact": request.body.mainContact,
                    "phone": request.body.phone,
                    "mobile": request.body.mobile,
                    "email": request.body.email,
                    "facebook": request.body.facebook,
                    "twitter": request.body.twitter,
                    "instagram": request.body.instagram,
                    "userUpdate" : request.decoded.name,
                    "dataUpdate": new Date(Date.now())
                }
            }

            db.db("baseinit").collection("empresas").updateOne({ _id: ObjectId(request.params.id) }, newvalues, function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.modifiedCount != 0) {

                        response.status(status.CREATED).send(JSON.stringify("Empresa atualizada com sucesso."));

                    } else {

                        response.status(status.NOT_FOUND).send(JSON.stringify("Empresa nao encontrado"));

                    }
                }
                db.close();

            });

        }

    });

}

///DELETE Empresa
exports.deleteEmpresa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase            
            db.db("baseinit").collection("empresas").deleteOne({ cnpj: request.params.id }, function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.deletedCount != 0) {

                        response.status(status.GONE).send(JSON.stringify("Empresa deletada com sucesso."));

                    } else {

                        response.status(status.NOT_FOUND).send(JSON.stringify("Empresa nao encontrada."));

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

                const tb_empresas = require('../dbFile/tb_empresas.json');

                for (var i = 0; i < tb_empresas.length; i++) {

                    ///Object para inserção
                    var myobj = {
                        "name": tb_empresas[i].chr_fantasia ? d.write(tb_empresas[i].chr_fantasia) : null,
                        "cnpj": tb_empresas[i].chr_cnpj.replace('.', '').replace('\/', '').replace('-', '').replace('.', ''),
                        "segment": tb_empresas[i].chr_segmento ? d.write(tb_empresas[i].chr_segmento) : null,
                        "activity": tb_empresas[i].chr_atividade ? d.write(tb_empresas[i].chr_atividade) : null,
                        "zipcode": tb_empresas[i].chr_cep ? d.write(tb_empresas[i].chr_cep.replace('-', '')) : null,
                        "address": tb_empresas[i].chr_rua ? d.write(tb_empresas[i].chr_rua) : null,
                        "numberAddress": tb_empresas[i].chr_numero,
                        "complement": tb_empresas[i].chr_complemento ? d.write(tb_empresas[i].chr_complemento) : null,
                        "neighborhood": tb_empresas[i].chr_bairro ? d.write(tb_empresas[i].chr_bairro) : null,
                        "city": tb_empresas[i].chr_cidade ? d.write(tb_empresas[i].chr_cidade) : null,
                        "state": null,
                        "gps": null,
                        "mainContact": tb_empresas[i].chr_cidade ? d.write(tb_empresas[i].chr_contato) : null,
                        "phone": tb_empresas[i].chr_telefone,
                        "mobile": tb_empresas[i].chr_celular,
                        "email": tb_empresas[i].chr_email,
                        "facebook": tb_empresas[i].chr_face,
                        "twitter": tb_empresas[i].chr_twitter,
                        "instagram": null,
                        "datacreate": new Date(Date.now()),
                        "dataUpdate": new Date(Date.now())
                    }

                    promises.push(dbo.collection("empresas").insertOne(myobj));

                }
                Q.all(promises)
                    .then(() => {
                        //console.log('test');
                        response.status(status.OK).send(JSON.stringify("Empresas cadastradas com sucesso"));
                    });
            }

        });
    }
    catch (e) {
        console.log(e);
    }
}