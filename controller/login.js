var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;

///POST LOGIN
exports.postLogin = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            
            
            db.db("baseinit").collection("users").find({ email: request.body.email , senha: request.body.senha}).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(JSON.stringify(res[0].Ativo));
                    } else {
                        response.status(status.OK).send(JSON.stringify(false));
                    }

                }
                db.close();
            });

        }
    });

}