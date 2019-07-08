const solver = require('node-tspsolver');

const jsonDb = require('../components/simpleJsonFileDb');
const tencent = require('../components/tencent');

async function fillCustomerLatLng(customers){
    logger.debug('Getting customers latlng');

    for(const customer of customers){
        customer.latLng = await tencent.getLatLngByAddress(customer.address);
        logger.debug(`Customer [${customer._id}]'s latlng is ${customer.latLng.toString()}`);
    }

    logger.debug('Finished getting customers latlng');
}

async function calcRouteBetween(c1, c2){
    logger.debug('Calc route between', c1, 'and', c2);

    let route;
    if(c1._id == c2._id){
        logger.debug('The two points is the same, simply use predefined route');
        route = {
            duration: 0
        };
    } else {
        logger.debug('Getting route from tencent');

        route = await tencent.getRoute(c1.latLng, c2.latLng);
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

            console.log(customer, existingCustomer);
            await routeDb.insert(customer._id, existingCustomer._id, route);
        }
    }
}

async function addCustomers(ctx){
    logger.trace('Adding new customers');

    let data;
    try{
        data = JSON.parse(ctx.request.body.data);
    } catch(e){
        logger.error('Invalid posted data');
        ctx.body = makeResponseData(e);
        return;
    }

    const newCustomers = await getNewCustomers(data);

    if(!newCustomers){
        ctx.body = makeResponseData(null, {
            info: 'All posted customers are exist in db, and no further action will be done'
        });
        return;
    }

    await fillCustomerLatLng(newCustomers);

    await calcAllAvailableRoutes(newCustomers);

    const customerDb = jsonDb.use('customer');
    customerDb.upsert(newCustomers);
    jsonDb.save();
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

    if(typeof data === 'string'){
        return {
            status: 1,
            data
        };
    } else {
        return Object.assign(data, {
            status: 1
        });
    }
}

module.exports = {
    addCustomers,
    calcVisitOrder
};
