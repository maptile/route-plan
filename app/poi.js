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

async function getCustomers(ctx){
    console.log(ctx.query.ids);
    const ids = JSON.parse(ctx.query.ids);
    const customerDb = jsonDb.use('customer');

    try{
        console.log(ids);
        const customers = customerDb.find(ids);
        console.log(customers);
        ctx.body = makeResponseData(null, customers);
    } catch(e){
        ctx.body = makeResponseData(e);
    }
}

async function addCustomers(ctx){
    logger.trace('Adding new customers');

    const data = ctx.request.body.customers;

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
    customerDb.insert(newCustomers);
    jsonDb.save();
    ctx.body = makeResponseData(null, 'ok');
}

async function calcVisitOrder(ctx){
    const customerIds = ctx.request.body.customerIds;

    const routeMatrix = await generateRouteMatrix(customerIds);

    logger.debug('routeMatrix is', routeMatrix);
    const order = await solver.solveTsp(routeMatrix, true, {});

    const data = {
        order,
        detail: []
    };

    for(let i = 0; i < order.length - 1; i++){
        const fromPoint = order[i];
        const toPoint = order[i + 1];

        data.detail.push({
            start: fromPoint,
            end: toPoint,
            weight: routeMatrix[fromPoint][toPoint]
        });
    }

    ctx.body = makeResponseData(null, data);
}

function makeResponseData(error, data){
    if(error){
        return {
            status: 0,
            error
        };
    }

    let result;
    if(typeof data === 'string' || Array.isArray(data)){
        result = {
            status: 1,
            data
        };
    } else {
        result = Object.assign(data, {
            status: 1
        });
    }

    logger.debug('Response body is', result);
    return result;
}

module.exports = {
    getCustomers,
    addCustomers,
    calcVisitOrder
};
