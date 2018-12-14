var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');


///GET USER
exports.getUsers = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(400).send(JSON.stringify(erro));

        } else {
            
            db.db("baseinit").collection("users").find({}).toArray(function (err, res) {
                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {

                    if(res.length != 0){
                        response.status(status.OK).send(res);
                    }else{
                        response.status(status.OK).send(JSON.stringify("Nenhum usuario foi Cadastrado."));
                    }
                    
                }

                db.close();
            });

        }
    });

}

