const MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
const ObjectId = require('mongodb').ObjectId;
const Q = require('q');
const _ = require("lodash");
const htmlDecode = require('js-htmlencode').htmlDecode;
const fetch = require('isomorphic-fetch'); // or another library of choice.
const Dropbox = require('dropbox').Dropbox;
const request = require('request');
const dbx = new Dropbox({ accessToken: require("../conf/config").keyDropbox, fetch: fetch });


function sortPessoa(type) {
    switch (type) {
        case 'cpf':
            return 'dados_pessoais.cpf';
        case 'city':
            return 'endereco_contato.city';
        default:
            return 'dados_pessoais.name';
    }
}

function GetMaileeContact(addressemail) {
    const defer = Q.defer();
    const clientServerOptions = {
        uri: require("../conf/config").urlMailee + 'contacts',
        qs: {
            'where[email]': addressemail,
            api_key: require("../conf/config").xrapidapikey,
            subdomain: require("../conf/config").subdomain
        },
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': require("../conf/config").tokenxrapidapikey
        }
    };

    try {
        request(clientServerOptions, (error, response, body) => {

            if (error) {
                defer.resolve(null);
            } else if (JSON.parse(body).length != 0) {
                defer.resolve(JSON.parse(body).id);
            } else {
                defer.resolve(body);
            }
        });
    } catch (error) {
        defer.resolve(null);
    }

    return defer.promise;
}

function postMaileContact(addressemail) {
    const defer = Q.defer();
    const clientServerOptions = {
        uri: require("../conf/config").urlMailee + 'contacts',
        qs: { api_key: require("../conf/config").xrapidapikey, subdomain: require("../conf/config").subdomain },
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': require("../conf/config").tokenxrapidapikey
        },
        form: { email: addressemail }
    };

    try {
        request(clientServerOptions, (error, response, body) => {
            if (error) {
                defer.resolve(null);
            } else {
                defer.resolve(JSON.parse(body).id);
            }
        });
    } catch (error) {
        defer.resolve(null);
    }

    return defer.promise;
}

///GET USER
exports.getPessoa = (request, response, next) => {
    const sort = {
        active: sortPessoa(request.query.active),
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
                { "dados_pessoais.name": { "$regex": request.query.value, "$options": "i" } },
                { "dados_pessoais.cpf": { "$regex": request.query.value, "$options": "i" } },
                { "endereco_contato.city": { "$regex": request.query.value, "$options": "i" } }
            ]
        };
    }
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        if (erro) {
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        } else {
            const promises = [];

            promises.push(db.db("baseinit").collection('pessoa').find(filter).count());

            promises.push(db.db('baseinit')
                .collection('pessoa')
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
                    response.status(status.NOT_FOUND).send(JSON.stringify("Usuario não encontrada."));
                })
                .finally(db.close);
        }
    });

}

///GET USER:ID
exports.getOnlyPessoa = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {


            db.db("baseinit").collection("pessoa").find({ _id: ObjectId(request.params.id) }).toArray(function (err, res) {
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

///POST Pessoa
exports.postPessoa = (request, response, next) => {

    var myobj = {
        "dados_pessoais": {
            "name": request.body.dados_pessoais.name,
            "cpf": request.body.dados_pessoais.cpf,
            "rg": request.body.dados_pessoais.rg,
            "birthDate": request.body.dados_pessoais.birthDate,
            "etnia": request.body.dados_pessoais.etnia,
            "motherName": request.body.dados_pessoais.motherName,
            "sexo": request.body.dados_pessoais.sexo,
            "transgenero": request.body.dados_pessoais.transgenero,
            "orientacosexusal": request.body.dados_pessoais.orientacosexusal,
            "socialName": request.body.dados_pessoais.socialName
        },
        "endereco_contato": {
            "zipcode": request.body.endereco_contato.zipcode,
            "address": request.body.endereco_contato.address,
            "numberAddress": request.body.endereco_contato.numberAddress,
            "complement": request.body.endereco_contato.complement,
            "neighborhood": request.body.endereco_contato.neighborhood,
            "city": request.body.endereco_contato.city,
            "state": request.body.endereco_contato.state,
            "gps": request.body.endereco_contato.gps,
            "phone": request.body.endereco_contato.phone,
            "mobile": request.body.endereco_contato.mobile,
            "email": request.body.endereco_contato.email,
            "facebook": request.body.endereco_contato.facebook,
            "twitter": request.body.endereco_contato.twitter,
            "instagram": request.body.endereco_contato.instagram
        },
        "profissional_eleitoral": {
            "company": request.body.profissional_eleitoral.company,
            "admissionDate": request.body.profissional_eleitoral.admissionDate,
            "terminationDate": request.body.profissional_eleitoral.terminationDate,
            "positionCompany": request.body.profissional_eleitoral.positionCompany,
            "workplace": request.body.profissional_eleitoral.workplace,
            "Sindicalizado": request.body.profissional_eleitoral.Sindicalizado,
            "associationNumber": request.body.profissional_eleitoral.associationNumber,
            "militante": request.body.profissional_eleitoral.militante,
            "directorsindication": request.body.profissional_eleitoral.directorsindication,
            "electoraltitle": request.body.profissional_eleitoral.electoraltitle,
            "zone": request.body.profissional_eleitoral.zone,
            "section": request.body.profissional_eleitoral.section,
            "county": request.body.profissional_eleitoral.county,
            "state": request.body.profissional_eleitoral.state
        },
        "notificacoes_anotacoes": {
            "correios": request.body.notificacoes_anotacoes.correios,
            "telefone": request.body.notificacoes_anotacoes.telefone,
            "sms": request.body.notificacoes_anotacoes.sms,
            "whatsapp": request.body.notificacoes_anotacoes.whatsapp,
            "telegram": request.body.notificacoes_anotacoes.telegram,
            "email": request.body.notificacoes_anotacoes.email,
            "score": request.body.notificacoes_anotacoes.score,
            "history": request.body.notificacoes_anotacoes.history
        },
        "file": {
            "url": request.body.file.url,
            "fileName": request.body.file.fileName
        },
        "id_mailee": null,
        "dataCreate": new Date(Date.now()),
        "dataUpdate": new Date(Date.now())
    }

    ///Verifica se o contato esta preenchido
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            var dbo = db.db("baseinit");

            ///Verifa se cpf ja existe na base
            dbo.collection("pessoa").find({ "dados_pessoais.cpf": request.body.dados_pessoais.cpf }).toArray(function (err, res) {

                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {

                    if (res.length != 0) {
                        response.status(status.UNAUTHORIZED).send(JSON.stringify("Cadastro do usuario foi encontrado em nossa base."));
                    } else {
                        if (myobj.endereco_contato.email != "") {
                            GetMaileeContact(myobj.endereco_contato.email)
                                .then((dataGet) => {
                                    if (dataGet != "[]") {
                                        myobj.id_mailee = dataGet;
                                    } else {
                                        return postMaileContact(myobj.endereco_contato.email)
                                            .then((dataPost) => {
                                                myobj.id_mailee = dataPost;
                                                return Q.resolve();
                                            })
                                    }

                                    return Q.resolve();
                                })
                                .then(() => {
                                    dbo.collection("pessoa").insertOne(myobj, function (err, res) {

                                        if (err) {
                                            response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                                        }
                                        else {
                                            response.status(status.OK).send(JSON.stringify("Usuario cadastrado com sucesso"));
                                        }

                                        db.close();
                                    });
                                })
                        }
                    }
                }
            });

        }

    });

}

///PUT Pessoa
exports.putPessoa = (request, response, next) => {
    GetMaileeContact(request.body.id_mailee)
        .then((dataGet) => {
            if (dataGet != "[]") {
                request.body.id_mailee = dataGet;
            } else {
                return postMaileContact(myobj.endereco_contato.email)
                    .then((dataPost) => {
                        request.body.id_mailee = dataPost;
                        return Q.resolve();
                    })
            }

            return Q.resolve();
        })
        .then(() => {
            var newvalues = {
                $set: {
                    "dados_pessoais": {
                        "name": request.body.dados_pessoais.name,
                        "cpf": request.body.dados_pessoais.cpf,
                        "rg": request.body.dados_pessoais.rg,
                        "birthDate": request.body.dados_pessoais.birthDate,
                        "etnia": request.body.dados_pessoais.etnia,
                        "motherName": request.body.dados_pessoais.motherName,
                        "sexo": request.body.dados_pessoais.sexo,
                        "transgenero": request.body.dados_pessoais.transgenero,
                        "orientacosexusal": request.body.dados_pessoais.orientacosexusal,
                        "socialName": request.body.dados_pessoais.socialName
                    },
                    "endereco_contato": {
                        "zipcode": request.body.endereco_contato.zipcode,
                        "address": request.body.endereco_contato.address,
                        "numberAddress": request.body.endereco_contato.numberAddress,
                        "complement": request.body.endereco_contato.complement,
                        "neighborhood": request.body.endereco_contato.neighborhood,
                        "city": request.body.endereco_contato.city,
                        "state": request.body.endereco_contato.state,
                        "gps": request.body.endereco_contato.gps,
                        "phone": request.body.endereco_contato.phone,
                        "mobile": request.body.endereco_contato.mobile,
                        "email": request.body.endereco_contato.email,
                        "facebook": request.body.endereco_contato.facebook,
                        "twitter": request.body.endereco_contato.twitter,
                        "instagram": request.body.endereco_contato.instagram
                    },
                    "profissional_eleitoral": {
                        "company": request.body.profissional_eleitoral.company,
                        "admissionDate": request.body.profissional_eleitoral.admissionDate,
                        "terminationDate": request.body.profissional_eleitoral.terminationDate,
                        "positionCompany": request.body.profissional_eleitoral.positionCompany,
                        "workplace": request.body.profissional_eleitoral.workplace,
                        "Sindicalizado": request.body.profissional_eleitoral.Sindicalizado,
                        "associationNumber": request.body.profissional_eleitoral.associationNumber,
                        "militante": request.body.profissional_eleitoral.militante,
                        "directorsindication": request.body.profissional_eleitoral.directorsindication,
                        "electoraltitle": request.body.profissional_eleitoral.electoraltitle,
                        "zone": request.body.profissional_eleitoral.zone,
                        "section": request.body.profissional_eleitoral.section,
                        "county": request.body.profissional_eleitoral.county,
                        "state": request.body.profissional_eleitoral.state
                    },
                    "notificacoes_anotacoes": {
                        "correios": request.body.notificacoes_anotacoes.correios,
                        "telefone": request.body.notificacoes_anotacoes.telefone,
                        "sms": request.body.notificacoes_anotacoes.sms,
                        "whatsapp": request.body.notificacoes_anotacoes.whatsapp,
                        "telegram": request.body.notificacoes_anotacoes.telegram,
                        "email": request.body.notificacoes_anotacoes.email,
                        "score": request.body.notificacoes_anotacoes.score,
                        "history": request.body.notificacoes_anotacoes.history
                    },
                    "file": {
                        "url": request.body.file.url,
                        "fileName": request.body.file.fileName
                    },
                    "id_mailee": request.body.id_mailee,
                    "userUpdate": request.decoded.name,
                    "dataUpdate": new Date(Date.now())
                }
            }

            MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true },
                function (erro, db) {
                    if (erro) {
                        response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
                    } else {
                        /// DataBase            


                        const promises = [];

                        promises.push(deleteFile(db, request.params.id, request.body.file.fileName));

                        promises.push(db.db("baseinit").collection("pessoa")
                            .updateOne({ _id: ObjectId(request.params.id) }, newvalues, function (err, res) {
                                if (err) {
                                    return Q.reject(err);
                                } else {
                                    if (res.modifiedCount != 0) {
                                        return Q.resolve(true);
                                    } else {
                                        return Q.reject('Pessoa nao encontrado');
                                    }
                                }
                            }));

                        Q.all(promises)
                            .then(() => {
                                db.close();
                                response.status(status.CREATED)
                                    .send(JSON.stringify("Pessoa atualizado com sucesso."));
                            })
                            .catch((error) => {
                                response.status(status.BAD_REQUEST).send(JSON.stringify(error));
                            });
                    }
                });
        })
}

function deleteFile(db, id, fileName) {
    const defer = Q.defer();
    db.db('baseinit')
        .collection('pessoa')
        .find({ _id: ObjectId(id) })
        .toArray(function (err, res) {
            if (err) {
                defer.reject(JSON.stringify(err));
            } else {
                const data = _.first(res);
                if (data && (!fileName && data.file && data.file.fileName) ||
                    (data.file && data.file.fileName && data.file.fileName != fileName)) {
                    dbx.filesDelete({ path: `/${data.file.fileName}` })
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

///DELETE Pessoa
exports.deletePessoa = (request, response, next) => {
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true },
        function (erro, db) {
            if (erro) {
                response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
            } else {
                /// DataBase
                const promises = [];
                promises.push(deleteFile(db, request.params.id, null));

                promises.push(db.db("baseinit")
                    .collection("pessoa")
                    .deleteOne({ _id: ObjectId(request.params.id) },
                        function (err, res) {
                            if (err) {
                                return Q.reject(err);
                            } else {
                                if (res.deletedCount != 0) {
                                    return Q.resolve(true);
                                } else {
                                    return Q.reject('Pessoa nao encontrado');
                                }
                            }
                        }));

                Q.all(promises)
                    .then(() => {
                        db.close();
                        response.status(status.GONE).send(JSON.stringify("Pessoa deletado com sucesso."));
                    })
                    .catch((error) => {
                        response.status(status.BAD_REQUEST).send(JSON.stringify(error));
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
                const dbo = db.db("baseinit");
                const promises = [];
                const tb_pessoas = require('../dbFile/tb_pessoas.json');

                for (var i = 0; i < tb_pessoas.length; i++) {
                    if (tb_pessoas[i].chr_nome) {
                        const item = {
                            "dados_pessoais": {
                                "name": htmlDecode(tb_pessoas[i].chr_nome.trim().toLowerCase()),
                                "cpf": tb_pessoas[i].chr_cpf,
                                "rg": tb_pessoas[i].chr_rg,
                                "birthDate": tb_pessoas[i].dt_aniversario,
                                "etnia": tb_pessoas[i].chr_etnia ? tb_pessoas[i].chr_etnia.toLowerCase() : null,
                                "motherName": tb_pessoas[i].chr_nome_mae ? htmlDecode(tb_pessoas[i].chr_nome_mae.trim().toLowerCase()) : null,
                                "sexo": htmlDecode(tb_pessoas[i].chr_sexo.trim()),
                                "transgenero": tb_pessoas[i].chr_trans ? tb_pessoas[i].chr_trans == '0' ? 'Travesti' : 'Transexual' : null,
                                "orientacosexusal": tb_pessoas[i].chr_orientacao ? htmlDecode(tb_pessoas[i].chr_orientacao.trim().toLowerCase()) : null,
                                "socialName": tb_pessoas[i].chr_transNome ? htmlDecode(tb_pessoas[i].chr_transNome.trim().toLowerCase()) : null
                            },
                            "endereco_contato": {
                                "zipcode": tb_pessoas[i].chr_cep,
                                "address": tb_pessoas[i].chr_rua ? htmlDecode(tb_pessoas[i].chr_rua.trim().toLowerCase()) : null,
                                "numberAddress": tb_pessoas[i].chr_numero ? htmlDecode(tb_pessoas[i].chr_numero.trim().toLowerCase()) : null,
                                "complement": tb_pessoas[i].chr_complemento ? htmlDecode(tb_pessoas[i].chr_complemento.trim().toLowerCase()) : null,
                                "neighborhood": tb_pessoas[i].chr_bairro ? htmlDecode(tb_pessoas[i].chr_bairro.trim().toLowerCase()) : null,
                                "city": tb_pessoas[i].chr_cidade ? htmlDecode(tb_pessoas[i].chr_cidade.trim().toLowerCase()) : null,
                                "state": tb_pessoas[i].chr_estado ? htmlDecode(tb_pessoas[i].chr_estado.trim().toLowerCase()) : null,
                                "gps": tb_pessoas[i].chr_gps,
                                "phone": tb_pessoas[i].chr_telefone,
                                "mobile": tb_pessoas[i].chr_celular,
                                "email": tb_pessoas[i].chr_email,
                                "facebook": tb_pessoas[i].chr_face,
                                "twitter": tb_pessoas[i].chr_twitter,
                                "instagram": null
                            },
                            "profissional_eleitoral": {
                                "company": tb_pessoas[i].chr_empresa ? htmlDecode(tb_pessoas[i].chr_empresa.trim().toLowerCase()) : null,
                                "admissionDate": tb_pessoas[i].dt_admissao,
                                "terminationDate": tb_pessoas[i].dt_demissao,
                                "positionCompany": tb_pessoas[i].chr_funcao ? htmlDecode(tb_pessoas[i].chr_funcao.trim().toLowerCase()) : null,
                                "workplace": null,
                                "Sindicalizado": tb_pessoas[i].chr_sindicalizado ? htmlDecode(tb_pessoas[i].chr_sindicalizado.trim().toLowerCase()) : null,
                                "associationNumber": tb_pessoas[i].chr_associacao,
                                "militante": tb_pessoas[i].chr_militante == '1',
                                "directorsindication": tb_pessoas[i].chr_indicado ? htmlDecode(tb_pessoas[i].chr_indicado.trim().toLowerCase()) : null,
                                "electoraltitle": tb_pessoas[i].chr_titulo,
                                "zone": tb_pessoas[i].chr_zona,
                                "section": tb_pessoas[i].chr_secao,
                                "county": tb_pessoas[i].chr_municipio ? htmlDecode(tb_pessoas[i].chr_municipio.trim().toLowerCase()) : null,
                                "state": tb_pessoas[i].chr_uf ? htmlDecode(tb_pessoas[i].chr_uf.trim().toLowerCase()) : null
                            },
                            "notificacoes_anotacoes": {
                                "correios": tb_pessoas[i].int_notifyCorreios == '1',
                                "telefone": tb_pessoas[i].int_notifyTelefones == '1',
                                "sms": tb_pessoas[i].int_notifySMS == '1',
                                "whatsapp": tb_pessoas[i].int_notifyWhatsapp == '1',
                                "telegram": false,
                                "email": tb_pessoas[i].int_notifyEmail == '1',
                                "score": tb_pessoas[i].int_pontuacao,
                                "history": tb_pessoas[i].txt_history
                            },
                            "dataCreate": new Date(Date.now()),
                            "dataUpdate": new Date(Date.now())
                        };

                        promises.push(dbo.collection("pessoa").insertOne(item));
                    }
                }

                Q.all(promises)
                    .then(() => {
                        response.status(status.OK).send(JSON.stringify("Pessoas cadastrada com sucesso"));
                    });
            }

        });
    }
    catch (e) {
        console.log(e);
    }
}