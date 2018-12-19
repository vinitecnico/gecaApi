var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');
var ObjectId = require('mongodb').ObjectId;

///GET SubMenu
exports.getSubMenu = (request, response, next) => {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            
            db.db("baseinit").collection("submenu").find({}).toArray(function (err, res) {
                
                if (err) {
                
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                
                }else {

                    if(res.length != 0){
                    
                        response.status(status.OK).send(res);
                    
                    }else{
                     
                        response.status(status.NOT_FOUND).send(JSON.stringify("Nenhum SubMenu foi cadastrado."));
                    
                    }                    
                }
                db.close();

            });

        }

    });

}

///GET SubMenu
exports.getOnlySubMenu = (request, response, next) => {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            
            
            db.db("baseinit").collection("submenu").find({ _id: ObjectId(request.params.id) }).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.NOT_FOUND).send(JSON.stringify("SubMenu nao encontrado"));
                    }

                }
                db.close();
            });

        }
    });

}

///POST SubMenu
exports.postSubMenu = (request, response, next) => {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true}, function (erro, db) {
        
        if (erro) {
        
            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));
        
        } else {
            var dbo = db.db("baseinit") 
            ///Verifa se nome ja existe na base
            dbo.collection("submenu").find({}).toArray(function (err, res) {
                
                if (err) {
                
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                
                }else {

                  let  myobj = {
                        "nomeSubMenu": request.body.nomeSubMenu,
                        "idMenu": request.body.idMenu,
                        "idSubMenu": res.length + 1,
                        "datacreate": new Date(Date.now()),
                        "dataUpdate": new Date(Date.now())
                    }      

                    dbo.collection("submenu").insertOne(myobj, function (err, res) {

                        if (err) {

                            response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                        }else {

                            response.status(status.OK).send(JSON.stringify("SubMenu foi Cadastrado com Sucesso"));
                            
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
exports.putSubMenu = (request, response, next) => {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            
            /// DataBase
            
            var newvalues = {
                $set: {
                    "nomeSubMenu": request.body.nomeSubMenu,
                    "idMenu": parseInt(request.body.idMenu),
                    "dataUpdate": new Date(Date.now())
                }
            }
            db.db("baseinit").collection("submenu").updateOne({ _id: ObjectId(request.params.id) }, newvalues, function (err, res) {
             
                if (err) {
             
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
             
                }else {

                    if (res.modifiedCount != 0) {

                        response.status(status.CREATED).send(JSON.stringify("SubMenu atualizado com sucesso."));
                    
                    } else {
                    
                        response.status(status.NOT_FOUND).send(JSON.stringify("SubMenu nao encontrado"));
                    
                    }
                }
                db.close();

            });

        }

    });

}

///DELETE SubMenu
exports.deleteSubMenu = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            
            db.db("baseinit").collection("submenu").deleteOne({ _id: ObjectId(request.params.id) }, function (err, res) {
                
                if (err) {
                
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                
                }else {

                    if (res.deletedCount != 0) {
                    
                        response.status(status.GONE).send(JSON.stringify("SubMenu deletado com sucesso."));
                    
                    } else {
                    
                        response.status(status.NOT_FOUND).send(JSON.stringify("SubMenu nao encontrado"));
                    
                    }
                }

                db.close();

            });

        }

    });

}