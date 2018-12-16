var MongoClient = require('mongodb').MongoClient;
const status = require('http-status');


///GET USER
exports.getUsers = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

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

///GET USER:ID
exports.getOnlyUser = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            
            var query = { cpf: parseInt(request.params.id) };
            db.db("baseinit").collection("users").find(query).toArray(function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {
                        response.status(status.OK).send(res);
                    } else {
                        response.status(status.OK).send(JSON.stringify("Usuario nao encontrado"));
                    }

                }
                db.close();
            });

        }
    });
    
}

///POST USER
exports.postUser = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            var dbo = db.db("baseinit");

            ///Verifa se cpf ja existe na base
            var query = { cpf: parseInt(request.body.cpf) };
            dbo.collection("users").find(query).toArray(function (err, res) {
                
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.length != 0) {

                        response.status(status.OK).send(JSON.stringify("Cadastro do usuario foi encontrado em nossa base."));

                    } else {

                        ///Object para inserção
                        var myobj = {
                            "nome": request.body.nome,
                            "cpf": parseInt(request.body.cpf),
                            "telefone": request.body.telefone,
                            "email": request.body.email,
                            "senha": request.body.senha,
                            "imagemtheme": request.body.imagemtheme,
                            "tituloTheme": request.body.tituloTheme,
                            "imagemUsuario": request.body.imagemUsuario,
                            "corPadrao": request.body.corPadrao,
                            "menu": [request.body.menu],
                            "SubMenu": [request.body.subMenu],
                            "Perfil": request.body.perfil,
                            "Ativo": true,
                            //"token": "#0339usdlfdk2394uslkfdwrouvkljfdk7",
                            "datacreate": new Date(Date.now()),
                            "dataUpdate": new Date(Date.now())
                        }

                        dbo.collection("users").insertOne(myobj, function (err, res) {

                            if (err) {

                                response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                            }
                            else {

                                response.status(status.OK).send(JSON.stringify("Usuario cadastrado com sucesso"));                                
                                
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

///PUT USER
exports.putUser = (request, response, next) => {
    
    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {

            /// DataBase
            var query = { cpf: parseInt(request.params.id) };
            var newvalues = {
                $set: {
                    "nome": request.body.nome,
                    "cpf": parseInt(request.body.cpf),
                    "telefone": request.body.telefone,
                    "email": request.body.email,
                    "senha": request.body.senha,
                    "imagemtheme": request.body.imagemtheme,
                    "tituloTheme": request.body.tituloTheme,
                    "imagemUsuario": request.body.imagemUsuario,
                    "corPadrao": request.body.corPadrao,
                    "menu": [request.body.menu],
                    "SubMenu": [request.body.subMenu],
                    "Perfil": request.body.perfil,
                    "Ativo": request.body.Ativo,
                    //"token": "#0339usdlfdk2394uslkfdwrouvkljfdk7",
                    "dataUpdate": new Date(Date.now())
                }
            }
            db.db("baseinit").collection("users").updateOne(query, newvalues, function (err, res) {
                
                if (err) {
                
                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));
                
                }
                else {
                
                    if (res.modifiedCount != 0) {
                
                        response.status(status.OK).send(JSON.stringify("Usuario atualizado com sucesso."));
                
                    } else {
                
                        response.status(status.OK).send(JSON.stringify("Usuario nao encontrado"));
                
                    }
                }
                db.close();

            });

        }

    });

}

///DELETE USER
exports.deleteUser = (request, response, next) => {

    MongoClient.connect(require("../conf/config").mongoURI, { useNewUrlParser: true }, function (erro, db) {

        if (erro) {

            response.status(status.BAD_REQUEST).send(JSON.stringify(erro));

        } else {
            /// DataBase
            
            var query = { cpf: parseInt(request.params.id) };
            db.db("baseinit").collection("users").deleteOne(query, function (err, res) {
                if (err) {

                    response.status(status.BAD_REQUEST).send(JSON.stringify(err));

                }
                else {

                    if (res.deletedCount != 0) {
                    
                        response.status(status.OK).send(JSON.stringify("Usuario deletado com sucesso."));
                    
                    } else {
                    
                        response.status(status.OK).send(JSON.stringify("Usuario nao encontrado"));
                    
                    }
                }
                db.close();

            });

        }
    });

}