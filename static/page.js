/*
  globals
*/

var apiEndpoint = 'http://localhost:3001/api/v1';

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

    function getCustomers(ids, callback){
        var data = {
            ids: JSON.stringify(ids)
        };

        var url = apiEndpoint + '/customer';
        $.getJSON(url, data).done(function(data){
            if(data.status != 1){
                return callback(data.error);
            }

            callback(null, data.data);
        }).fail(function(err){
            callback(err);
        });
    }

    function generateMarkers(){
        clearMap();
        var customerIds = JSON.parse($('#count').val());
        getCustomers(customerIds, function(err, customers){
            if(err){
                return alert(err);
            }

            _.forEach(customers, function(customer){
                points.push({
                    _id: customer._id,
                    name: customer.name,
                    latlng: [
                        parseFloat(customer.latLng.lat),
                        parseFloat(customer.latLng.lng)
                    ]
                });
            });

            drawMarkers();
        });
    }

    function calc(callback){
        var url = apiEndpoint + '/plan';
        var data = {
            customerIds: JSON.parse($('#count').val())
        };

        $.post(url, data, 'json').done(function(result){
            if(result.status != 1){
                return callback(result.error);
            }

            callback(null, result);
        }).fail(function(err){
            callback(err);
        });
    }

    function drawLine(order1){
        linePoints = [];
        var names = [];

        var order = order1.order;

        for(let i = 0; i < order.length; i++){
            var pointIndex = order[i];
            var pointCord = points[pointIndex].latlng;

            linePoints.push(pointCord);
            names.push(points[pointIndex]._id + ': ' + points[pointIndex].name);
        }

        var totalWeight = 0;
        for(let i = 0; i < order1.detail.length; i++){
            totalWeight += order1.detail[i].weight;
        }

        var polyline = L.polyline(linePoints, {color: 'red'});
        lineLayerGroup = L.layerGroup([polyline]);
        lineLayerGroup.addTo(mymap);

        $('#result').html(names.join('\n') + '\n\n' + 'Total: ' + totalWeight);
    }

    function calcAndDrawLine(){
        if(lineLayerGroup){
            lineLayerGroup.clearLayers();
        }

        calc(function(err, order){
            if(err){
                return alert(err);
            }

            drawLine(order);
        });
    }

    $('#generatePoints').click(generateMarkers);

    $('#calcAndDraw').click(calcAndDrawLine);

    $('#clear').click(clearMap);
});
