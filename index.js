// must present at the first line
require('./components/logger');

const Server = require('aok-server');
const path = require('path');

const env = require('nodejslib/env');

// the following code depends on global.logger
const poi = require('./app/poi');
const visitOrder = require('./app/visitOrder');

const endpointPrefix = '/api/v1';

const port = 3001;

const server = new Server();
server.route.post(endpointPrefix + '/customer', poi.addCustomers);
server.route.get(endpointPrefix + '/plan', visitOrder.calcVisitOrder);

server.route.static(path.join(env.appRoot, 'static'));
server.listen(port);
logger.info(`listening on port ${port}`);
