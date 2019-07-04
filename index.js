const winston = require('winston');
const Server = require('aok-server');
const path = require('path');

const _ = require('lodash');

const env = require('nodejslib/env');
const salesman = require('salesman.js');

const nameGenerator = require('./app/nameGenerator');

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

const server = new Server();

async function generateRandomPois(ctx){
    logger.info(`Getting locations`);

    const points = [];

    // always add the home point
    points.push({
        name: 'start',
        latlng: [31.069445, 121.380901]
    });

    // TODO: Need get this value from querystring
    const count = 20;
    const loopCount = count || 20;

    for(let i = 0; i < loopCount; i++){
        const lat = _.random(30957590, 31228068) / 1000000;
        const lng = _.random(121043243, 121677703) / 1000000;

        const nameIndex = (i + 1).toString().padStart(2, '0');

        points.push({
            name: nameIndex + ' ' + nameGenerator.generate(),
            latlng: [lat, lng]
        });
    }

    logger.debug('response body is');
    logger.debug(points);
    ctx.body = points;
}

async function calcVisitOrder(ctx){
    logger.debug(ctx.request.body);

    const points = ctx.request.body;

    const tspPoints = points.map((point) => {
        return new salesman.Point(point.latlng[0], point.latlng[1]);
    });

    const order = salesman.solve(tspPoints);

    ctx.body = order;
}

server.route.get('/server/generate-random-pois', generateRandomPois);
server.route.post('/server/calc-visit-order', calcVisitOrder);

server.route.static(path.join(env.appRoot, 'static'));
server.listen(port);
logger.info(`listening on port ${port}`);
