const _ = require('lodash');

const companyNameGenerator = require('../components/companyNameGenerator');

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

module.exports = {
    generateRandom
};
