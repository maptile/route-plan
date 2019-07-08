// must present at the first line
require('./components/logger');

const Server = require('aok-server');
const path = require('path');

const env = require('nodejslib/env');

// the following code depends on global.logger
const poi = require('./app/poi');

const endpointPrefix = '/api/v1';

const port = 3001;

const server = new Server();

// curl -X POST -d 'data=[{"_id": "100", "_rev": "1", "address": "上海沪闵路9000号"}]' http://localhost:3001/api/v1/customer
server.route.post(endpointPrefix + '/customer', poi.addCustomers);
server.route.get(endpointPrefix + '/plan', poi.calcVisitOrder);

server.route.static(path.join(env.appRoot, 'static'));
server.listen(port);
logger.info(`listening on port ${port}`);
