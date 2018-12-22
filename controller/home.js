var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;



///GET Colegio
exports.getCountersHome = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            var myObjmain = []
            var myObjinside = {}

            db.db("baseinit").collection("pessoa").estimatedDocumentCount({}, function (err, count) {
                myObjinside.pessoa = count;
                db.close();
            })

            db.db("baseinit").collection("feiras").estimatedDocumentCount({}, function (err, count) {
                myObjinside.feiras = count;
                db.close();
            })

            db.db("baseinit").collection("empresas").estimatedDocumentCount({}, function (err, count) {
                myObjinside.empresas = count;
                db.close();
            })

            db.db("baseinit").collection("colegios").estimatedDocumentCount({}, function (err, count) {
                myObjinside.colegios = count;
                db.close();
            })            


            setTimeout(() => {
                myObjmain.push(myObjinside);
                response.status(status.OK).send(myObjmain);
            }, 1000);

        }
        db.close();
    });

}