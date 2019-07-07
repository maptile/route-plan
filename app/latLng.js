class LatLng{
    constructor(lat, lng){
        this.lat = lat;
        this.lng = lng;
    }

    toString(){
        return `${this.lat}, ${this.lng}`;
    }
}

module.exports = LatLng;
