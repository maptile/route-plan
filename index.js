const winston = require('winston');
const Server = require('aok-server');
const path = require('path');

const env = require('nodejslib/env');

const poi = require('./app/poi');
const visitOrder = require('./app/visitOrder');

const port = 3001;

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
    transports: [
        new (winston.transports.Console)(),
    ]
});

async function init(ctx){
    logger.info(`Getting locations`);

    poi.init(6);

    logger.debug('response body is');
    ctx.body = '';
}

async function generateRandomPois(ctx){
    logger.info(`Getting locations`);

    const points = poi.generateRandom(20);
    logger.debug('response body is');
    logger.debug(points);
    ctx.body = points;
}

async function calcVisitOrder(ctx){
    logger.debug(ctx.request.body);

    const points = JSON.parse(ctx.request.body.data);

    const order = visitOrder.calc(points);

    ctx.body = order;
}

const server = new Server();
server.route.post('/server/init', init);
server.route.get('/server/generate-random-pois', generateRandomPois);
server.route.post('/server/calc-visit-order', calcVisitOrder);

server.route.static(path.join(env.appRoot, 'static'));
server.listen(port);
logger.info(`listening on port ${port}`);
