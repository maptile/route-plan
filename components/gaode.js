const _ = require('lodash');

async function getPoiInfo(poi){
    return {
        latlng: {
            lat: _.random(30957590, 31228068) / 1000000,
            lng: _.random(121043243, 121677703) / 1000000
        }
    };
}

async function getRoute(poi1, poi2){
    return _.random(1, 99);
}

module.exports = {
    getPoiInfo,
    getRoute
};
