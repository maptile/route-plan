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

/*
curl -g http://localhost:3001/api/v1/customer?ids=[1,2,3,4,5]
*/
server.route.get(endpointPrefix + '/customer', poi.getCustomers);

/*
curl -X POST -H "Content-type: application/json" -d '{"customers": [{"_id": "7", "_rev": "1", "address": "上海市徐汇区宛平南路900号"}]}' http://localhost:3001/api/v1/customer
*/
server.route.post(endpointPrefix + '/customer', poi.addCustomers);

/*
curl -X POST -d '{"customerIds": [1,2,3,4,5]}' -H "Content-type: application/json" http://localhost:3001/api/v1/plan
*/
server.route.post(endpointPrefix + '/plan', poi.calcVisitOrder);

server.route.static(path.join(env.appRoot, 'static'));
server.listen(port);
logger.info(`listening on port ${port}`);
