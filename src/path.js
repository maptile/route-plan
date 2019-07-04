const utils = require('./utils');

/**
 * @module
 * @author Ophir LOJKINE
 * salesman npm module
 *
 * Good heuristic for the traveling salesman problem using simulated annealing.
 * @see {@link https://lovasoa.github.io/salesman.js/|demo}
 **/

/**
 * @private
 * @param {Array} points
 */
class Path {
    constructor(points){
        this.points = points;
        this.order = new Array(points.length);

        for(let i = 0; i < points.length; i++){
            this.order[i] = i;
        }

        this.distances = new Array(points.length * points.length);

        for(let i = 0; i < points.length; i++){
            for(let j = 0; j < points.length; j++){
                this.distances[j + i*points.length] = utils.distance(points[i], points[j]);
            }
        }
    }

    change(temp) {
        const i = this.randomPos();
        const j = this.randomPos();
        const delta = this.deltaDistance(i, j);
        if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
            this.swap(i, j);
        }
    }

    size() {
        let s = 0;
        for (let i = 0; i < this.points.length; i++) {
            s += this.distance(i, ((i+1)%this.points.length));
        }
        return s;
    }

    swap(i, j) {
        const tmp = this.order[i];
        this.order[i] = this.order[j];
        this.order[j] = tmp;
    }

    deltaDistance(i, j) {
        const jm1 = this.index(j-1);
        const jp1 = this.index(j+1);
        const im1 = this.index(i-1);
        const ip1 = this.index(i+1);
        let s =
            this.distance(jm1, i)
            + this.distance(i, jp1)
            + this.distance(im1, j)
            + this.distance(j, ip1)
            - this.distance(im1, i)
            - this.distance(i, ip1)
            - this.distance(jm1, j)
            - this.distance(j, jp1);

        if (jm1 === i || jp1 === i){
            s += 2*this.distance(i, j);
        }

        return s;
    }

    index(i) {
        return (i + this.points.length) % this.points.length;
    }

    access(i) {
        return this.points[this.order[this.index(i)]];
    }

    distance(i, j) {
        return this.distances[this.order[i] * this.points.length + this.order[j]];
    }

    // Random index between 1 and the last position in the array of points
    randomPos() {
        return 1 + Math.floor(Math.random() * (this.points.length - 1));
    }
}

module.exports = Path;
