var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');


///GET Feira
exports.getFeira = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            
            db.db("baseinit").collection("feiras").find({}).toArray(function (err, res) {
                if (err) {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                }
                else {

                    if(res.length != 0){
                        response.status(status.OK).send(res);
                    }else{
                        response.status(status.OK).send(JSON.stringify("Nenhum Feria foi Cadastrada."));
                    }
                    
                }

                db.close();
            });

        }
    });

}

///GET Feira:ID
exports.getOnlyFeira = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
                        
            db.db("baseinit").collection("feiras").find({"cep" : parseInt(request.params.id)}).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.OK).send(JSON.stringify("Feira nao encontrada."));
                    }

                }
                db.close();
            });

        }
    });
    
}

///POST Feira
exports.postFeira = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            var dbo = db.db("baseinit");

            ///Verifa se cpf ja existe na base
            dbo.collection("feiras").find({"cep" : parseInt(request.params.id)}).toArray(function (err, res) {
                
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {

                        response.status(status.OK).send(JSON.stringify("Cadastro da Feira foi encontrado em nossa base."));

                    } else {

                        ///Object para inserção
                        var myobj = {
                            "nomefeira": request.body.nomefeira,
                            "idSemana": parseInt(request.body.idSemana),
                            "cep": parseInt(request.body.cep),
                            "end": request.body.end,
                            "num": parseInt(request.body.num),
                            "complemento": request.body.complemento,
                            "bairro": request.body.bairro,
                            "cidade": request.body.cidade,
                            "estado": request.body.estado,
                            "posgps": [
                                request.body.posgps[0],
                                request.body.posgps[1]
                            ],
                            "datacreate": new Date(Date.now()),
                            "dataUpdate": new Date(Date.now())
                        }

                        dbo.collection("feiras").insertOne(myobj, function (err, res) {

                            if (err) {

                                response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                            }
                            else {

                                response.status(status.OK).send(JSON.stringify("Feira cadastrada com sucesso"));                                
                                
                            }

                            db.close();

                        });
                    }

                }
                db.close();

            });

        }

    });

}

///PUT Feira
exports.putFeira = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            /// DataBase            
            var newvalues = {
                $set: {
                    "nomefeira": request.body.nomefeira,
                    "idSemana": parseInt(request.body.idSemana),
                    "cep": parseInt(request.body.cep),
                    "end": request.body.end,
                    "num": parseInt(request.body.num),
                    "complemento": request.body.complemento,
                    "bairro": request.body.bairro,
                    "cidade": request.body.cidade,
                    "estado": request.body.estado,
                    "posgps": [
                        request.body.posgps[0],
                        request.body.posgps[1]
                    ],
                    "dataUpdate": new Date(Date.now())
                }
            }
            
            db.db("baseinit").collection("feiras").updateOne({"cep" : parseInt(request.params.id)}, newvalues, function (err, res) {

                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.modifiedCount != 0) {

                        response.status(status.OK).send(JSON.stringify("Feira atualizada com sucesso."));

                    } else {

                        response.status(status.OK).send(JSON.stringify("Feira nao encontrado"));

                    }
                }
                db.close();

            });

        }

    });

}

///DELETE Feira
exports.deleteFeira = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase            
            db.db("baseinit").collection("feiras").deleteOne({"cep" : parseInt(request.params.id)}, function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.deletedCount != 0) {
                    
                        response.status(status.OK).send(JSON.stringify("Feira deletada com sucesso."));
                    
                    } else {
                    
                        response.status(status.OK).send(JSON.stringify("Feira nao encontrada."));
                    
                    }
                }
                db.close();

            });

        }
    });

}