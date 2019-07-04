const salesman = require('salesman.js');

function calc(points){
    const tspPoints = points.map((point) => {
        return new salesman.Point(point.latlng[0], point.latlng[1]);
    });

    const order = salesman.solve(tspPoints);

    return order;
}

module.exports = {
    calc
};
