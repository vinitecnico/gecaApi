const status = require('http-status');
const FileReader = require('filereader');
require('isomorphic-fetch'); // or another library of choice.
var cors = require('cors');
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: require("../conf/config").keyDropbox });

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

///GET upload
exports.upload = (request, response, next) => {
    dbx.filesUpload({ path: '/texe123.txt', contents: 'Text Content', mode: 'overwrite' })
        .then((result) => {
            response.status(status.OK).send(result);
        })
        .catch((error) => {
            response.status(status.BAD_REQUEST).send(JSON.stringify(error));
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