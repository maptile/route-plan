const request = require('request');

const apiEndpoint = 'https://apis.map.qq.com/ws';
const apiKey = '2PBBZ-5YL34-6KWUK-DZ63S-E5Q4K-TJFD5';

function checkReturnBody(body){
    if(!body){
        throw new Error('no response body');
    }

    if(body.status != '0'){
        throw new Error({
            info: body.info,
            message: body.message
        });
    }
}

function getResponseFirstPoiLocation(body){
    checkReturnBody(body);

    if(body.data.length == 0){
        throw new Error('no search result');
    }

    const latlng = body.data[0].location;

    return {
        lat: latlng.lat,
        lng: latlng.lng
    };
}

async function getLatLngByAddress(address){
    return new Promise((resolve, reject) => {
        const requestOptions = {
            uri: `${apiEndpoint}/place/v1/search`,
            method: 'GET',
            qs: {
                key: apiKey,
                keyword: encodeURIComponent(address),
                boundary: encodeURIComponent('region(上海,0)')
            },
            json: true
        };

        request(requestOptions, (err, res, body) => {
            logger.debug('Got reponse', body);
            if(err){
                return reject(err);
            }

            let location;

            try{
                location = getResponseFirstPoiLocation(body);
            } catch(e){
                return reject(e);
            }

            resolve(location);
        });
    });
}

function getResponseFirstRoute(body){
    checkReturnBody(body);

    if(!body || !body.result || !body.result.routes){
        throw new Error('Invalid return result');
    }

    const route = body.result.routes[0];

    return route;
}

async function getRoute(latLng1, latLng2){
    latLng1 = `${latLng1.lat},${latLng1.lng}`;
    latLng2 = `${latLng2.lat},${latLng2.lng}`;

    logger.trace(`Getting route from ${latLng1} to ${latLng2}`);

    return new Promise((resolve, reject) => {
        const requestOptions = {
            uri: `${apiEndpoint}/direction/v1/driving/`,
            method: 'GET',
            qs: {
                key: apiKey,
                from: latLng1,
                to: latLng2
            },
            json: true
        };

        request(requestOptions, (err, res, body) => {
            logger.trace('Got response');

            if(err){
                logger.error('getRoute failed', err);
                return reject(err);
            }

            let route;

            try{
                route = getResponseFirstRoute(body);
            } catch(e){
                return reject(e);
            }

            resolve(route);
        });
    });
}

module.exports = {
    getLatLngByAddress,
    getRoute
};
