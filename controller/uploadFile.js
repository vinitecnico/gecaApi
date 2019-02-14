const status = require('http-status');
const FileReader = require('filereader');
const moment = require('moment');
const fetch = require('isomorphic-fetch');
const multer = require('multer');
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: require("../conf/config").keyDropbox, fetch: fetch });

///GET List files
exports.getFilesList = (request, response, next) => {
    dbx.filesListFolder({ path: '' })
        .then((result) => {
            response.status(status.OK).send(result);
        })
        .catch((error) => {
            response.status(status.BAD_REQUEST).send(JSON.stringify(error));
        });
};

var storage = multer.memoryStorage({});
var upload = multer({ storage: storage }).single('file');

///Post upload
exports.postUpload = (request, response, next) => {
    upload(request, response, function (err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        } else {
            dbx.filesUpload({ path: `/${request.file.originalname}`, contents: request.file.buffer, mode: 'overwrite' })
                .then((result) => {
                    dbx.sharingCreateSharedLink({ path: `/${request.file.originalname}` })
                        .then((resDpx) => {
                            resDpx.url = resDpx.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
                            resDpx.url = resDpx.url.replace('?dl=0', '');
                            const data = {
                                url: resDpx.url,
                                fileName: request.file.originalname
                            };
                            response.status(status.OK).send(data);
                        });
                })
                .catch((error) => {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(error));
                });
        }
    });
};

///Post upload
exports.postUploadEditor = (request, response, next) => {
    upload(request, response, function (err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        } else {
            const fileName = moment().format('YYYYMMDDHHmmss') + request.file.originalname;
            dbx.filesUpload({ path: `/email/${fileName}`, contents: request.file.buffer, mode: 'overwrite' })
                .then((result) => {
                    dbx.sharingCreateSharedLink({ path: `/email/${fileName}` })
                        .then((resDpx) => {
                            resDpx.url = resDpx.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
                            resDpx.url = resDpx.url.replace('?dl=0', '');
                            const data = {
                                url: resDpx.url.toString()
                            };
                            setTimeout(() => {
                                response.status(status.OK).send(data);
                            }, 200);                            
                        });
                })
                .catch((error) => {
                    response.status(status.BAD_REQUEST).send(JSON.stringify(error));
                });
        }
    });
};

///GET upload
exports.download = (request, response, next) => {
    dbx.filesDownload({ path: '/texe123.txt' })
        .then((result) => {
            var blob = result.fileBinary;
            var reader = new FileReader();
            reader.addEventListener("loadend", function () {
                response.status(status.OK).send(reader.result);
            });
            reader.readAsText(blob);
        })
        .catch((error) => {
            response.status(status.BAD_REQUEST).send(JSON.stringify(error));
        });
};

///GET remove
exports.remove = (request, response, next) => {
    dbx.filesDelete({ path: '/texe123.txt' })
        .then((result) => {
            response.status(status.OK).send(result);
        })
        .catch((error) => {
            response.status(status.BAD_REQUEST).send(JSON.stringify(error));
        });
};