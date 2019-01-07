var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;

///GET PERFIL
exports.getPerfil = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            
            db.db("baseinit").collection("perfil").find({}).toArray(function (err, res) {

                if (err) {
                
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                
                }
                else {
                    
                    if(res.length != 0){

                        response.status(status.OK).send(res);
                    
                    }else{
                    
                        response.status(status.NOT_FOUND).send(JSON.stringify("Nenhum Perfil foi cadastrado."));
                    
                    }
                    
                
                }

                db.close();
            });
        }

    });

}

///GET PERFIL COM ID
exports.getOnlyPerfil = (request, response, next) => {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            
            db.db("baseinit").collection("perfil").find({ _id: ObjectId(request.params.id) }).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.NOT_FOUND).send(JSON.stringify("Perfil nao encontrado"));
                    }

                }
                db.close();
            });

        }
    });

}

///POST PERFIL
exports.postPerfil = (request, response, next) => {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true, poolSize: 10 }, function (erro, db) {
        
        if (erro) {
        
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        
        } else {

            var dbo = db.db("baseinit");
            dbo.collection("perfil").find({}).toArray(function (err, res) {

                if (err) {
                
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                
                }
                else {
                
                    let myobj = {
                        "nomePerfil": request.body.nomePerfil,
                        "idPerfil": res.length + 1,
                        "userCreate" : request.decoded.name,
                        "dataCreate": new Date(Date.now()),
                        "userUpdate" : request.decoded.name,
                        "dataUpdate": new Date(Date.now())
                    }      

                    dbo.collection("perfil").insertOne(myobj, function (err, res) {
                
                        if (err) {
                
                            response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                
                        }else {
                         
                            response.status(status.OK).send(JSON.stringify("Perfil Cadastrado com Sucesso."));
                        }

                        db.close();
                    });

                }
                db.close();

            });

        }

    });

}

///PUT PERFIL
exports.putPerfil = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {
        
        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            
            var newvalues = {
                $set: {
                    "nomePerfil": request.body.nomePerfil,
                    "userUpdate" : request.decoded.name,
                    "dataUpdate": new Date(Date.now())
                }
            }

            db.db("baseinit").collection("perfil").updateOne({ _id: ObjectId(request.params.id) }, newvalues, function (err, res) {
                
                if (err) {
                
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                
                }else {

                    if (res.modifiedCount != 0) {

                        response.status(status.CREATED).send(JSON.stringify("Perfil atualizado com sucesso."));
                    
                    } else {
                    
                        response.status(status.NOT_FOUND).send(JSON.stringify("Perfil nao encontrado"));
                    
                    }

                }
                db.close();

            });

        }

    });

}

///DELETE PERFIL
exports.deletePerfil = (request, response, next) => {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            
            db.db("baseinit").collection("perfil").deleteOne({ _id: ObjectId(request.params.id) }, function (err, res) {

                if (err) {
                
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                
                }else {

                    if (res.deletedCount != 0) {
                    
                        response.status(status.GONE).send(JSON.stringify("Perfil deletado com sucesso."));
                    
                    } else {
                    
                        response.status(status.NOT_FOUND).send(JSON.stringify("Perfil nao encontrado"));
                    
                    }
                }

                db.close();
            });

        }
    });

}