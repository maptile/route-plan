/*
  globals
  Point
  solve
  generateName
 */
$(function(){
    var mymap = L.map('mapid', {
        center: [31.123496, 121.363906],
        zoom: 10
    });

    // var popup = L.popup();

    // function onMapClick(e) {
    //     popup
    //         .setLatLng(e.latlng)
    //         .setContent("You clicked the map at " + e.latlng.toString())
    //         .openOn(mymap);
    //     console.log(mymap.getBounds());
    //     console.log(mymap.getCenter());
    // }

    // mymap.on('click', onMapClick);

    // var options = {
    //     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //     maxZoom: 18,
    //     id: 'mapbox.streets',
    //     accessToken: ''
    // };

    // L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', options).addTo(mymap);

    L.tileLayer.chinaProvider('GaoDe.Normal.Map', {}).addTo(mymap);

    var points = [];
    var markers = [];
    var linePoints = [];
    var markersLayerGroup;
    var lineLayerGroup;

    function clearMap(){
        points = [];
        markers = [];
        linePoints = [];
        $('#result').html('');

        if(markersLayerGroup){
            markersLayerGroup.clearLayers();
        }

        if(lineLayerGroup){
            lineLayerGroup.clearLayers();
        }
    }

    function drawMarkers(){
        for(var i = 0; i < points.length; i++){
            var marker = L.marker(points[i].latlng, {
                title: points[i].name,
                draggable: true,
                xPointIndex: i
            });

            marker.on('dragend', function(e){
                var index = e.target.options.xPointIndex;
                var latlng = e.target.getLatLng();
                points[index].latlng = [latlng.lat, latlng.lng];

                calcAndDrawLine();
            });

            markers.push(marker);
        }

        markersLayerGroup = L.layerGroup(markers);
        markersLayerGroup.addTo(mymap);
    }

    function generateMarkers(){
        clearMap();
        // always add the home point
        points.push({
            name: 'start',
            latlng: [31.069445, 121.380901]
        });

        var count = $('#count').val() || 20;

        for(let i = 0; i < count; i++){
            const lat = _.random(30957590, 31228068) / 1000000;
            const lng = _.random(121043243, 121677703) / 1000000;

            var nameIndex = (i + 1).toString().padStart(2, '0');

            points.push({
                name: nameIndex + ' ' + generateName(),
                latlng: [lat, lng]
            });
        }

        drawMarkers();
    }

    function calc(){
        const tspPoints = points.map(function(point) {
            return new Point(point.latlng[0], point.latlng[1]);
        });

        const res = solve(tspPoints);
        return res;
    }

    function drawLine(order){
        linePoints = [];
        var names = [];
        for(let i = 0; i < order.length; i++){
            var pointIndex = order[i];
            var pointCord = points[pointIndex].latlng;

            linePoints.push(pointCord);
            names.push(points[pointIndex].name);
        }

        var polyline = L.polyline(linePoints, {color: 'red'});
        lineLayerGroup = L.layerGroup([polyline]);
        lineLayerGroup.addTo(mymap);

        $('#result').html(names.join('<br />'));
    }

    function calcAndDrawLine(){
        if(lineLayerGroup){
            lineLayerGroup.clearLayers();
        }

        var order = calc();
        drawLine(order);
    }

    $('#generatePoints').click(generateMarkers);

    $('#calcAndDraw').click(calcAndDrawLine);

    $('#clear').click(clearMap);
});
