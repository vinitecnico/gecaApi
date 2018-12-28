const status = require('http-status');
const request = require('request');

///GET CNPJ
exports.getCNPJWs = (req, res) => {
    const cnpj = req.params.cnpj;

    var clientServerOptions = {
        uri: 'https://www.receitaws.com.br/v1/cnpj/' + cnpj,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        request(clientServerOptions, (error, response, body) => {
            if (error) {
                res.status(status.BAD_REQUEST).send(error);
            } else {
                res.status(status.OK).send(JSON.parse(body));
            }
        });
    } catch (error) {
        response.status(status.UNAUTHORIZED).send(JSON.stringify('Erro para retornar CNPJ!'));
    }
}
