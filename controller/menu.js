var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');

///GET MENU
exports.getMenu = function (request, response, next) {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(400).send(JSON.stringify(erro));

        } else {
            
            db.db("baseinit").collection("menu").find({}).toArray(function (err, res) {
                
                if (err) {
                
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                
                }else {

                    if(res.length != 0){
                    
                        response.status(status.OK).send(res);
                    
                    }else{
                     
                        response.status(status.OK).send(JSON.stringify("Nenhum Menu foi cadastrado."));
                    
                    }                    
                }
                db.close();

            });

        }

    });

}

///GET Menu COM ID
exports.getOnlyMenu = function (request, response, next) {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(400).send(JSON.stringify(erro));

        } else {
            
            var query = { idMenu: parseInt(request.params.id) };
            db.db("baseinit").collection("menu").find(query).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.OK).send(JSON.stringify("Menu nao encontrado"));
                    }

                }
                db.close();
            });

        }
    });

}

///POST MENU
exports.postMenu = function (request, response, next) {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true}, function (erro, db) {
        
        if (erro) {
        
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        
        } else {
            var dbo = db.db("baseinit") 
            ///Verifa se nome ja existe na base
            dbo.collection("menu").find({}).toArray(function (err, res) {
                
                if (err) {
                
                    response.status(400).send(JSON.stringify(err));
                
                }else {

                  let  myobj = {
                        "nomeMenu": request.body.nomeMenu,
                        "idMenu": res.length + 1,
                        "datacreate": new Date(Date.now()),
                        "dataUpdate": new Date(Date.now())
                    }      

                    dbo.collection("menu").insertOne(myobj, function (err, res) {

                        if (err) {

                            response.status(400).send(JSON.stringify(err));

                        }else {

                            response.status(200).send(JSON.stringify("Menu foi Cadastrado com Sucesso"));
                            
                        }
                        db.close();

                    });

                }
                db.close();

            });

        }

    });

}

///PUT MENU
exports.putMenu = function (request, response, next) {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(400).send(JSON.stringify(erro));

        } else {
            
            /// DataBase
            var query = { idMenu: parseInt(request.params.id) };
            var newvalues = {
                $set: {
                    "nomeMenu": request.body.nomeMenu,
                    "dataUpdate": new Date(Date.now())
                }
            }
            db.db("baseinit").collection("menu").updateOne(query, newvalues, function (err, res) {
             
                if (err) {
             
                    response.status(400).send(JSON.stringify(err));
             
                }else {

                    if (res.modifiedCount != 0) {

                        response.status(200).send(JSON.stringify("Menu atualizado com sucesso."));
                    
                    } else {
                    
                        response.status(200).send(JSON.stringify("Menu nao encontrado"));
                    
                    }
                }
                db.close();

            });

        }

    });

}

///DELETE MENU
exports.deleteMenu = function(request, response, next) {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(400).send(JSON.stringify(erro));

        } else {
                        
            var query = { idMenu: parseInt(request.params.id) };
            db.db("baseinit").collection("menu").deleteOne(query, function (err, res) {
                
                if (err) {
                
                    response.status(400).send(JSON.stringify(err));
                
                }else {

                    if (res.deletedCount != 0) {
                    
                        response.status(200).send(JSON.stringify("Menu deletado com sucesso."));
                    
                    } else {
                    
                        response.status(200).send(JSON.stringify("Menu nao encontrado"));
                    
                    }
                }

                db.close();

            });

        }

    });

}