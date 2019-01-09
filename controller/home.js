var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
const _ = require("lodash");
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

function getTotalCharts(db) {
    const defer = Q.defer();
    db.db('baseinit').collection('pessoa')
        .find({})
        .toArray(function (err, res) {
            if (err) {
                defer.reject(JSON.stringify(err));
            } else {
                const charts = {
                    gender: {}
                };

                charts.gender = _.chain(res)
                    .map((x) => {
                        return _.lowerCase(x.dados_pessoais.sexo) == 'masculino' ? 'male' : 'female';
                    })
                    .countBy()
                    .value();

                defer.resolve(charts);
            }
        });
    return defer.promise;
}

///GET Home
exports.getCountersHome = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            const myObjmain = []
            const myObjinside = {
                totalItems: {},
                charts: {}
            }
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
                        myObjinside.totalItems[items[i].fieldName] = data;
                        return Q.resolve(data);
                    })
                    .catch((e) => {
                        return Q.reject(e);
                    }));
            }

            promises.push(getTotalCharts(db)
                .then((data) => {
                    myObjinside.charts = data;
                    return Q.resolve(data);
                })
                .catch((e) => {
                    return Q.reject(e);
                }));

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
