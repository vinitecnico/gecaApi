var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;
const Q = require('q');

function getCountCollection(db, collectionName) {
    const defer = Q.defer();
    db.db("baseinit").collection(collectionName)
        .estimatedDocumentCount({}, function (err, count) {
            if (err) {
                defer.reject(JSON.stringify(err));
            } else {
                defer.resolve(count);
            }
        });

    return defer.promise;
}

///GET Colegio
exports.getCountersHome = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            var myObjmain = []
            var myObjinside = {}
            const promises = [];

            const items = [{
                collectionName: 'pessoa',
                fieldName: 'pessoa'
            }, {
                collectionName: 'feiras',
                fieldName: 'feiras'
            }, {
                collectionName: 'empresas',
                fieldName: 'empresas'
            }, {
                collectionName: 'colegios',
                fieldName: 'colegios'
            }];

            for (let i = 0; i < items.length; i++) {
                promises.push(getCountCollection(db, items[i].collectionName)
                    .then((data) => {
                        myObjinside[items[i].fieldName] = data;
                        return Q.resolve(data);
                    })
                    .catch((e) => {
                        return Q.reject(e);
                    }));
            }


            Q.all(promises)
                .then(() => {
                    db.close();
                    myObjmain.push(myObjinside);
                    response.status(status.OK).send(myObjmain);
                });

        }
        db.close();
    });

}