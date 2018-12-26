const nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
const conf = require("../conf/config");

exports.sendEmail = (request, response, next) => {

    MongoClient.connect(conf.mongoURI, { useNewUrlParser: true }, function (erro, db) {

        nodemailer.createTestAccount((err, account) => {

            let transporter = nodemailer.createTransport({
                host: conf.host,
                port: conf.porthost,
                secure: conf.secure, 
                auth: {
                    user: conf.usermail, 
                    pass: conf.passmail 
                }
            });

            db.db("baseinit").collection("pessoa").find({})
                .toArray(function (err, res) {
                    if (err) {
                        response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                    }
                    else {
                        if (res.length != 0) {

                            res.forEach(function (doc) {
                                if (doc.notificacoes_anotacoes.email) {

                                    //setup email data with unicode symbols
                                    let mailOptions = {
                                        from: 'Geca email', // sender address
                                        to: doc.endereco_contato.email, // list of receivers
                                        subject: request.body.title, // Subject line
                                        //text: 'Hello world?', // plain text body
                                        html: request.body.text // html body
                                    };

                                    // send mail with defined transport object
                                    transporter.sendMail(mailOptions, (error, info) => {
                                        if (error) {
                                            console.log('Email:', doc.endereco_contato.email);
                                            return console.log(error);
                                        }
                                        console.log('Message sent: %s', doc.endereco_contato.email);
                                        console.log('Message sent: %s', info.messageId);
                                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                                    });

                                }
                                //console.log(doc);
                            });

                            response.status(status.OK).send("Email's Enviado(s) com sucesso.");
                        } else {
                            response.status(status.NOT_FOUND).send(JSON.stringify("Problemas ao envio de email"));
                        }

                    }

                    db.close();
                });
        });

    });

}