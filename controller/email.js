const nodemailer = require('nodemailer');
const MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
const conf = require("../conf/config");
const Q = require('q');
const _ = require("lodash");
const request = require('request');
const express = require('express'); // import express module
const bodyParser = require('body-parser'); // import body parser module
const Mailchimp = require('mailchimp-api-v3'); // node js mailchimp wrapper library
const app = express(); // create express instance
app.use(bodyParser.json()); // register middleware to parse application/json
app.use(bodyParser.urlencoded({ extended: true })); // with extended true you can post nested object.

 function CreateList() {
    
 }


function AddContactList(email, idlist) {
    request.post( require("../conf/config").urlMailChimp +'/${'+ idlist +'}/actions/test')
    .set('Content-Type', 'application/json;charset=utf-8')
    .set('Authorization', 'Basic ' + new Buffer('any:' + require("../conf/config").keyMailChimp).toString('base64'))
    .send({
        test_emails: email,
        send_type: 'geca 01 com mailChimp',
    })
    .end((error, response) => {
        if (error) {
            res.send({ error });
        } else {
            res.send({ data: response });
        }
    });
}

function CreateMessage(htmlText, contacts, subject) {
    
}

function postMaileContact(addressemail) {
    app.post('/subscribe', (req, res) => {
        const list_id = '14ec44d6cc'; // list id
        const mailchimp = new Mailchimp(require("../conf/config").keyMailChimp); // create MailChimp instance
        mailchimp.post(`lists/${list_id}`, { members: [{ // send a post request to create new subscription to the list
            email_address:addressemail,
            status: "subscribed"
        }]
        }).then((reslut) => {
          return res.send(reslut);
        }).catch((error) => {
          return res.send(error);
        });
   });
}

function SendMessage(id) {

}

exports.sendEmail = (request, response, next) => {
    
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