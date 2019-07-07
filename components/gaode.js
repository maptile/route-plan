const _ = require('lodash');
const request = require('request');

const apiEndpoint = 'https://restapi.amap.com/v3';
const apiKey = '9f64380a43b6e2495005a800e51bbe59';

function checkReturnBody(body){
    if(!body){
        throw new Error('no response body');
    }

    if(!body.status){
        throw new Error({
            info: body.info,
            infoCode: body.infocode
        });
    }
}

function getResponseFirstPoiLocation(body){
    checkReturnBody(body);

    if(body.pois.length == 0){
        throw new Error('no search result');
    }

    const latlng = body.pois[0].location.split(',');

    return {
        lat: latlng[0],
        lng: latlng[1]
    };
}

async function getLatLngByAddress(address){
    return new Promise((resolve, reject) => {
        const requestOptions = {
            uri: `${apiEndpoint}/place/text`,
            method: 'GET',
            qs: {
                key: apiKey,
                keywords: address,
                offset: 1
            },
            json: true
        };

        request(requestOptions, (err, res, body) => {
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

    const transits = body.route.transits;

    if(!transits || transits.length == 0){
        throw new Error('No route between the two points');
    }

    return transits[0];
}

async function getRoute(latLng1, latLng2){
    logger.trace(`Getting route from ${latLng1} to ${latLng2}`);

    return new Promise((resolve, reject) => {
        const requestOptions = {
            uri: `${apiEndpoint}/direction/transit/integrated`,
            method: 'GET',
            qs: {
                key: apiKey,
                origin: latLng1,
                destination: latLng2,
                city: '上海'
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
