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
        form: { site: "agencialeak" , name : titulo  , phone: "(211)336-1440" }
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

exports.sendEmail = (request, response, next) => {
    
    var genre = request.body.criterion.genre;
    if(genre.allProcess == true){
        MongoClient.connect(conf.mongoURI, { useNewUrlParser: true }, function (erro, db) {

            db.db("baseinit").collection("pessoa").find({"notificacoes_anotacoes.email": true})
                 .toArray(function (err, res) {
                    CreateListMaile(request.body.subject).then(data => {
                        console.log(data);
                    });

                    
                 })
        })
    }
    // MongoClient.connect(conf.mongoURI, { useNewUrlParser: true }, function (erro, db) {
    //     nodemailer.createTestAccount((err, account) => {
    //         let transporter = nodemailer.createTransport({
    //             host: conf.host,
    //             port: conf.porthost,
    //             secure: conf.secure,
    //             auth: {
    //                 user: conf.usermail,
    //                 pass: conf.passmail
    //             }
    //         });

    //         db.db("baseinit").collection("pessoa").find({})
    //             .toArray(function (err, res) {
    //                 if (err) {
    //                     response.status(status.BAD_REQUEST).send(JSON.stringify(err));
    //                 }
    //                 else {
    //                     if (res.length != 0) {

    //                         res.forEach(function (doc) {
    //                             if (doc.notificacoes_anotacoes.email) {

    //                                 //setup email data with unicode symbols
    //                                 let mailOptions = {
    //                                     from: 'Geca email', // sender address
    //                                     to: doc.endereco_contato.email, // list of receivers
    //                                     subject: request.body.title, // Subject line
    //                                     //text: 'Hello world?', // plain text body
    //                                     html: request.body.text // html body
    //                                 };

    //                                 // send mail with defined transport object
    //                                 transporter.sendMail(mailOptions, (error, info) => {
    //                                     if (error) {
    //                                         console.log('Email:', doc.endereco_contato.email);
    //                                         return console.log(error);
    //                                     }
    //                                     console.log('Message sent: %s', doc.endereco_contato.email);
    //                                     console.log('Message sent: %s', info.messageId);
    //                                     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    //                                 });

    //                             }
    //                             //console.log(doc);
    //                         });

    //                         response.status(status.OK).send(JSON.stringify("Email's Enviado(s) com sucesso."));
    //                     } else {
    //                         response.status(status.NOT_FOUND).send(JSON.stringify("Problemas ao envio de email"));
    //                     }
    //                 }
    //                 db.close();
    //             });
    //     });

    // });

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

const filterType = () => {
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