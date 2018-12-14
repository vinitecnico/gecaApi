var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');

///GET SubMenu
exports.getSubMenu = function(request, response, next) {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(400).send(JSON.stringify(erro));

        } else {
            
            db.db("baseinit").collection("submenu").find({}).toArray(function (err, res) {
                
                if (err) {
                
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                
                }else {

                    if(res.length != 0){
                    
                        response.status(status.OK).send(res);
                    
                    }else{
                     
                        response.status(status.OK).send(JSON.stringify("Nenhum SubMenu foi cadastrado."));
                    
                    }                    
                }
                db.close();

            });

        }

    });

}

///GET SubMenu
exports.getOnlySubMenu = function(request, response, next) {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(400).send(JSON.stringify(erro));

        } else {
            
            var query = { idSubMenu: parseInt(request.params.id) };
            db.db("baseinit").collection("submenu").find(query).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.OK).send(JSON.stringify("SubMenu nao encontrado"));
                    }

                }
                db.close();
            });

        }
    });

}

///POST SubMenu
exports.postSubMenu = function(request, response, next) {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true}, function (erro, db) {
        
        if (erro) {
        
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        
        } else {
            var dbo = db.db("baseinit") 
            ///Verifa se nome ja existe na base
            dbo.collection("submenu").find({}).toArray(function (err, res) {
                
                if (err) {
                
                    response.status(400).send(JSON.stringify(err));
                
                }else {

                  let  myobj = {
                        "nomeSubMenu": request.body.nomeSubMenu,
                        "idMenu": parseInt(request.body.idMenu),
                        "idSubMenu": res.length + 1,
                        "datacreate": new Date(Date.now()),
                        "dataUpdate": new Date(Date.now())
                    }      

                    dbo.collection("submenu").insertOne(myobj, function (err, res) {

                        if (err) {

                            response.status(400).send(JSON.stringify(err));

                        }else {

                            response.status(200).send(JSON.stringify("SubMenu foi Cadastrado com Sucesso"));
                            
                        }
                        db.close();

                    });

                }
                db.close();

            });

        }

    });

}

///PUT SubMenu
exports.putSubMenu = function(request, response, next) {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(400).send(JSON.stringify(erro));

        } else {
            
            /// DataBase
            var query = { idSubMenu: parseInt(request.params.id) };
            var newvalues = {
                $set: {
                    "nomeSubMenu": request.body.nomeSubMenu,
                    "idMenu": parseInt(request.body.idMenu),
                    "dataUpdate": new Date(Date.now())
                }
            }
            db.db("baseinit").collection("submenu").updateOne(query, newvalues, function (err, res) {
             
                if (err) {
             
                    response.status(400).send(JSON.stringify(err));
             
                }else {

                    if (res.modifiedCount != 0) {

                        response.status(200).send(JSON.stringify("SubMenu atualizado com sucesso."));
                    
                    } else {
                    
                        response.status(200).send(JSON.stringify("SubMenu nao encontrado"));
                    
                    }
                }
                db.close();

            });

        }

    });

}

///DELETE SubMenu
exports.deleteSubMenu = function(request, response, next) {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(400).send(JSON.stringify(erro));

        } else {
                        
            var query = { idSubMenu: parseInt(request.params.id) };
            db.db("baseinit").collection("submenu").deleteOne(query, function (err, res) {
                
                if (err) {
                
                    response.status(400).send(JSON.stringify(err));
                
                }else {

                    if (res.deletedCount != 0) {
                    
                        response.status(200).send(JSON.stringify("SubMenu deletado com sucesso."));
                    
                    } else {
                    
                        response.status(200).send(JSON.stringify("SubMenu nao encontrado"));
                    
                    }
                }

                db.close();

            });

        }

    });

}