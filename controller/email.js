const nodemailer = require('nodemailer');
const MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
const conf = require("../conf/config");
const Q = require('q');
const _ = require("lodash");
const request = require('request');

function CreateListMaile(titulo) {
    const defer = Q.defer();
    const clientServerOptions = {
        uri: require("../conf/config").urlMailee + 'lists',
        qs: { api_key: require("../conf/config").xrapidapikey, subdomain: require("../conf/config").subdomain },
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': require("../conf/config").tokenxrapidapikey
        },
        form: { site: "agencialeak", name: titulo + "_" + Date.now(), phone: "(211)336-1440" }
    };

    try {
        request(clientServerOptions, (error, response, body) => {
            if (error) {
                defer.resolve(null);
            } else {
                defer.resolve(JSON.parse(body));
            }
        });
    } catch (error) {
        defer.resolve(null);
    }

    return defer.promise;
}

function AddContactList(namelist, idcontact) {
    const defer = Q.defer();
    const clientServerOptions = {
        uri: require("../conf/config").urlMailee + 'contacts/' + idcontact + '/list_subscribe',
        qs: { api_key: require("../conf/config").xrapidapikey, subdomain: require("../conf/config").subdomain },
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': require("../conf/config").tokenxrapidapikey
        },
        form: { list: namelist }
    };

    try {
        request(clientServerOptions, (error, response, body) => {
            if (error) {
                defer.resolve(null);
            } else {
                defer.resolve(JSON.parse(body));
            }
        });
    } catch (error) {
        defer.resolve(null);
    }

    return defer.promise;
}

function CreateMessage(htmlText, contacts, subject) {
    const defer = Q.defer();
    const clientServerOptions = {
        uri: require("../conf/config").urlMailee + 'messages/',
        qs: { api_key: require("../conf/config").xrapidapikey, subdomain: require("../conf/config").subdomain },
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': require("../conf/config").tokenxrapidapikey
        },
        form: {
            newsletter_id: "154274",
            html: htmlText,
            reply_email: "contato@agencialeak.com.br",
            analytics: "true",
            from_name: "AgenciaLeak.com",
            title: subject,
            subject: subject,
            from_email: "contato@agencialeak.com.br",
            template_id: "30",
            list_ids: contacts
        }
    };

    try {
        request(clientServerOptions, (error, response, body) => {
            if (error) {
                defer.resolve(null);
            } else {
                defer.resolve(SendMessage(JSON.parse(body).id));
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

function SendMessage(id) {
    const defer = Q.defer();
    const clientServerOptions = {
        uri: require("../conf/config").urlMailee + 'messages/' + id + "/ready",
        qs: { api_key: require("../conf/config").xrapidapikey, subdomain: require("../conf/config").subdomain },
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': require("../conf/config").tokenxrapidapikey
        },
        form: { when: "now" }
    };

    try {
        return setTimeout(() => {
            return request(clientServerOptions, (error, response, bodymessage) => {
                if (error) {
                    defer.resolve(null);
                } else {
                    if (JSON.parse(bodymessage).message == "Problems establishing connection with Mailee.me. Please contact support@mailee.me." || 
                        JSON.parse(bodymessage).message == undefined) {
                        request(clientServerOptions, (error, response, body) => {
                            if (error) {
                                defer.resolve(null);
                            } else {
                                //console.log(JSON.stringify(body))
                                defer.resolve(SendMessage(id));
                            }
                        })
                    } else {
                        defer.resolve(JSON.stringify(bodymessage));
                    }
                }
            });            
        }, 100);

    } catch (error) {
        defer.resolve(null);
    }

    return defer.promise;
}

exports.sendEmail = (request, response, next) => {
    var genre = request.body.criterion.genre;
    var idListMailee;

    if (genre.allProcess == true) {
        MongoClient.connect(conf.mongoURI, { useNewUrlParser: true }, function (erro, db) {

            db.db("baseinit").collection("pessoa").find({ "notificacoes_anotacoes.email": true, "dados_pessoais.sexo": request.body.criterion.genre.type.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }) })
                .toArray(function (err, res) {
                    CreateListMaile(request.body.subject)
                        .then(data => {
                            idListMailee = data.id;
                            for (var i in res) {

                                if (res[i].id_mailee != undefined) {
                                    AddContactList(data.name, res[i].id_mailee)
                                } else {
                                    postMaileContact(res[i].endereco_contato.email).then(
                                        dataContact => {

                                            AddContactList(data.name, dataContact)
                                                .then(dataContact => {
                                                    //CreateMessage(request.body.html, dataContact.id, request.body.emailTitle);                                                
                                                }).catch((err) => {
                                                    response.status(status.NOT_FOUND).send(JSON.stringify(err));
                                                });
                                        });
                                }

                            }
                    })
                    .then(() => {
                        CreateMessage(request.body.html, idListMailee, request.body.emailTitle).then(dataCreate => {
                            response.status(status.OK).send("Lista gerada com sucesso aguarde alguns minutos para envio!");
                        });
                    })
                })
        })
    }
}

const sortPessoa = (type) => {
    switch (type) {
        case 'cpf':
            return 'dados_pessoais.cpf';
        case 'city':
            return 'endereco_contato.city';
        default:
            return 'dados_pessoais.name';
    }
}

const filterType = (query) => {
    let filter = [];
    const itemFilter = {};
    itemFilter['endereco_contato.email'] = { '$exists': true, $ne: null, $ne: '' };
    if (query.filter) {
        itemFilter['dados_pessoais.name'] = { '$regex': query.filter, '$options': 'i' };
    }

    switch (query.type) {
        case 'gênero':
            itemFilter['dados_pessoais.sexo'] = { '$regex': query.value, '$options': 'i' };
            break;
    }
    filter.push(itemFilter);
    return filter;
}

const ignorObject = {
    "dados_pessoais.rg": 0,
    "dados_pessoais.etnia": 0,
    "dados_pessoais.motherName": 0,
    "dados_pessoais.transgenero": 0,
    "dados_pessoais.orientacosexusal": 0,
    "dados_pessoais.socialName": 0,
    "endereco_contato.zipcode": 0,
    "endereco_contato.address": 0,
    "endereco_contato.numberAddress": 0,
    "endereco_contato.complement": 0,
    "endereco_contato.gps": 0,
    "endereco_contato.state": 0,
    "endereco_contato.phone": 0,
    "endereco_contato.mobile": 0,
    "endereco_contato.facebook": 0,
    "endereco_contato.twitter": 0,
    "endereco_contato.instagram": 0,
    "profissional_eleitoral": 0,
    "notificacoes_anotacoes": 0,
    "file": 0,
    "datacreate": 0,
    "dataUpdate": 0,
    "dataCreate": 0,
    "userUpdate": 0
}

exports.EmailFilterPeople = (request, response, next) => {
    const sort = {
        active: sortPessoa(request.query.active),
        direction: request.query.direction ? parseInt(request.query.direction) : 1
    };

    const pagination = {
        page: request.query.page ? parseInt(request.query.page) : 0,
        perPage: request.query.per_page ? parseInt(request.query.per_page) : 10
    };

    const filter = {
        $or: filterType(request.query)
    };

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
                .project(ignorObject)
                .collation({ locale: "en" })
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
                    response.status(status.NOT_FOUND).send(JSON.stringify(error));
                })
                .finally(db.close);
        }
    });
}