const _ = require('lodash');

const companyNameGenerator = require('../components/companyNameGenerator');
const db = require('../components/simpleJsonFileDb');
const gaode = require('../components/gaode');

const sampleData = require('../sampledata/customers.json');

function generateRandom(count){
    const points = [];

    // always add the home point
    points.push({
        name: 'start',
        latlng: [31.069445, 121.380901]
    });

    const loopCount = count || 20;

    for(let i = 0; i < loopCount; i++){
        const lat = _.random(30957590, 31228068) / 1000000;
        const lng = _.random(121043243, 121677703) / 1000000;

        const nameIndex = (i + 1).toString().padStart(2, '0');

        points.push({
            name: nameIndex + ' ' + companyNameGenerator.generate(),
            latlng: [lat, lng]
        });
    }

    return points;
}

async function init(count){
    const customers = sampleData.slice(0, count);

    const arr = [];

    for(const i of customers){
        customers[i].id = i;
        const address = customers[i].address;
        const poi = await gaode.getPoiInfo(address);
        customers[i].latlng = poi.latlng;
    }

    for(const i of customers){
        const row = [];
        for(const j of customers){
            row.push(await gaode.getRoute(customers[i], customers[j]));
        }

        arr.push(row);
    }

    console.log(JSON.stringify(arr, null, 2));
}

module.exports = {
    generateRandom,
    init
};
