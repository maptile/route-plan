const _ = require('lodash');
const solver = require('node-tspsolver');

const jsonDb = require('../components/simpleJsonFileDb');
const gaode = require('../components/gaode');

const sampleData = require('../sampledata/customers.json');

async function getCustomersFromSampleData(count){
    logger.debug('Getting customers from sample data');
    return sampleData.slice(0, count).map((customer, index) => {
        customer.id = index + 1;
        return customer;
    });
}

async function fillCustomerLatLng(customers){
    logger.debug('Getting customers latlng');
    const db = jsonDb.use('customer');

    for(const customer of customers){
        customer.latLng = await gaode.getLatLngByAddress(customer.address);

        db.upsert(customer);
    }

    logger.debug('Finished getting customers latlng');

    db.save();

    logger.debug('Data has been saved to db');
}

async function calcRouteBetween(c1, c2){
    let route;
    if(c1._id == c2._id){
        logger.debug('The two points is the same, simply use predefined route');
        route = {
            duration: 0
        };
    } else {
        logger.debug('Getting route from gaode');
        route = await gaode.getRoute(c1.latLng, c2.latLng);
        logger.debug('Got route');
    }

    return route;
}

async function generateRouteMatrix(customerIds){
    const routeDb = jsonDb.use('route');

    const twoDimensionalnMatrix = [];

    for(const cid1 of customerIds){
        const arr = [];
        for(const cid2 of customerIds){
            const route = routeDb.find(cid1, cid2);

            arr.push(parseInt(route.duration));
        }

        twoDimensionalnMatrix.push(arr);
    }

    return twoDimensionalnMatrix;
}

async function getNewCustomers(customers){
    const db = jsonDb.use('customer');

    const newCustomers = [];
    for(const customer of customers){
        const existingCustomer = await db.find(customer._id);

        if(!existingCustomer){
            logger.trace('No existing customer, will insert one');
            newCustomers.push(customer);
            continue;
        }

        if(customer._rev != existingCustomer._rev){
            logger.trace('Using newer customer data to replace existing one');
            newCustomers.push(customer);
            continue;
        }
    }

    return newCustomers;
}

async function calcAllAvailableRoutes(customers){
    const customerDb = jsonDb.use('customer');
    const allCustomers = customerDb.all();

    const routeDb = jsonDb.use('route');

    for(const customer of customers){
        for(const existingCustomer of allCustomers){
            await routeDb.delete(customer._id, existingCustomer._id);
            const route = await calcRouteBetween(customer, existingCustomer);

            await routeDb.insert(customer._id, existingCustomer._id, route);
        }
    }

    routeDb.save();
}

async function addCustomers(ctx){
    logger.trace('Adding new customers');

    const newCustomers = await getNewCustomers(ctx.body.data);

    if(!newCustomers){
        ctx.body = '';
        return;
    }

    await fillCustomerLatLng(newCustomers);

    await calcAllAvailableRoutes(newCustomers);

    ctx.body = makeResponseData(null, 'ok');
}

async function calcVisitOrder(ctx){
    const customerIds = ctx.body.data;

    const routeMatrix = await generateRouteMatrix(customerIds);

    logger.debug('routeMatrix is', routeMatrix);
    const order = await solver.solveTsp(routeMatrix, true, {});

    logger.debug('response body is', order);

    ctx.body = makeResponseData(null, order);
}

function makeResponseData(error, data){
    if(error){
        return {
            status: 0,
            error
        };
    }

    return {
        status: 1,
        data
    };
}

module.exports = {
    addCustomers,
    calcVisitOrder
};
