var map;
var targetsample_x = document.getElementById('map_x');
var targetsample_y = document.getElementById('map_y');
var targetsample_guid = document.getElementById("guid");
var targetsample_name = document.getElementById("name");
var show_movement = document.getElementById("show_movement");
var polygon_list = [];

var mymap = null;
var map_x = null;
var map_y = null;

if (targetsample_x !== null && targetsample_y !== null
    && targetsample_x.innerHTML !== "" && targetsample_y.innerHTML !== ""
    && targetsample_guid !== null && targetsample_name !== null) {
    var sample_name = targetsample_name.innerHTML;
    var sample_guid = targetsample_guid.innerHTML;
    map_x = parseInt(targetsample_x.innerHTML);
    map_y = parseInt(targetsample_y.innerHTML);
    var locations = convert2latlon(map_x, map_y);
    mymap = L.map('mapid').setView([locations[0], locations[1]], 8);
}
else {
    mymap = L.map('mapid').setView([53.25, -2.5], 6);
}

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWlzc3NvZnQiLCJhIjoiY2pnNjh1dGtvMnE2aTJ6bzZkeTRnam9saCJ9.gxCPunx5Hdk2_CSTRU_N0A', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);


var moveticks = document.getElementsByClassName("move_tick");

function show_movement_line() {
    if (moveticks.length > 0 && show_movement.checked) {
        var locationlist = [];
        for (i = 0; i < moveticks.length; i++) {
            var location_x = moveticks[i].id.split("_")[0];
            var location_y = moveticks[i].id.split("_")[1];
            var locations = convert2latlon(location_x, location_y);
            var lat = locations[0].toFixed(6);
            var lon = locations[1].toFixed(6);
            locationlist[i] = [lat, lon];
        }
        var polyline = L.polyline(locationlist, { color: '#CD5C5C' }).addTo(mymap);
        var markerPatterns = L.polylineDecorator(polyline, {
            patterns: [
                { offset: 25, repeat: 50, symbol: L.Symbol.arrowHead({ pixelSize: 10, pathOptions: { color: '#CD5C5C', fillOpacity: 1, weight: 0 } }) }
            ]
        }).addTo(mymap);
    }
    else {
        for (i in mymap._layers) {
            if (mymap._layers[i]._path != undefined) {
                try {
                    mymap.removeLayer(mymap._layers[i]);
                }
                catch (e) {
                    console.log("problem with " + e + mymap._layers[i]);
                }
            }
        }
    }
}


var markerGroup = L.layerGroup().addTo(mymap); 

if (map_x !== null && map_y !== null) {
    addMarker(sample_name, sample_guid, map_x, map_y);
}

function addMovement(map_click_x, map_click_y, date, stay) {
    var locations = convert2latlon(map_click_x, map_click_y);
    var lat = locations[0].toFixed(6);
    var lon = locations[1].toFixed(6);
    var origin_icon_url = "https://collectd.mmmoxford.uk/images/marker-14.png";
    var origin_icon = new L.Icon({
        iconUrl: origin_icon_url,
        iconSize: [25, 40],
        iconAnchor: [12, 40],
        popupAnchor: [1, -34],
        shadowSize: [0, 0]
    });
    var themarker = L.marker([locations[0], locations[1]], { icon: origin_icon }).addTo(markerGroup).bindPopup(date + "</br>"
        + "Stayed: " + stay + " days");
    var icon = themarker.options.icon;
    themarker.setIcon(icon);
   
}

function addMarker(sample_name, sample_guid, map_click_x, map_click_y, myIcon, cluster_no) {
    var locations = convert2latlon(map_click_x, map_click_y);
    var lat = locations[0].toFixed(6);
    var lon = locations[1].toFixed(6);
    if (myIcon !== undefined && myIcon !== null && cluster_no !== null) {
        var themarker = L.marker([locations[0], locations[1]], { icon: myIcon }).addTo(markerGroup).bindPopup("Sample Name: <strong>" + sample_name
            + "</strong></br>" + "Cluster No: <strong>" + cluster_no + "</strong></br>"
            + "Location: " + lat + "," + lon
            + "</br>Grid Ref:" + map_click_x + "," + map_click_y);
    }
    else {
        locations = convert2latlon(map_click_x, map_click_y);
        var distance = "SNPs: Origin";
        var miles = "Miles: Origin";
        var markersize_width = 25;
        var markersize_height = 41;
        var distance_element = document.getElementById("distance_" + sample_name);
        if (distance_element !== null && map_click_x !== null && map_click_y !== null) {
            var distance_value = distance_element.innerHTML;
            markersize_width = (1 - parseInt(distance_value) * parseInt(distance_value) * 0.001) * 25;
            markersize_height = (1 - parseInt(distance_value) * parseInt(distance_value) * 0.001) * 41;
            distance = "SNPs: " + distance_value;
            if (map_x !== null && map_y !== null) {
                miles = calculate_distance_in_mile(map_click_x, map_click_y, map_x, map_y);
                miles = miles + " miles ";
            }
            else {
                miles = "No Origin";
            }
        }
        if (map_click_x === map_x && map_click_y === map_y) {
            var origin_icon_url = "https://collectd.mmmoxford.uk/images/marker-20.png";
            var origin_icon = new L.Icon({
                iconUrl: origin_icon_url,
                iconSize: [25, 40],
                iconAnchor: [12, 40],
                popupAnchor: [1, -34],
                shadowSize: [0, 0]
            });
            themarker = L.marker([locations[0], locations[1]], { icon: origin_icon }).addTo(markerGroup).bindPopup(sample_name + "</br>"
                + sample_guid + "<br>" + distance + "<br>" + miles);
        }
        else {
            themarker = L.marker([locations[0], locations[1]]).addTo(markerGroup).bindPopup(sample_name + "</br>"
                 + distance + "<br>" + miles);

            var icon = themarker.options.icon;
            icon.options.iconSize = [markersize_width, markersize_height];
            icon.options.shadowSize = [0, 0];
            themarker.setIcon(icon);
        }
    }
}

function check_all() {
    if (document.getElementById('check_all').checked) {
        $('.sample_tick').each(function () {
            $(this).trigger('click');
            $(this).prop("checked", true);
        });
    }
    else {
        $('.sample_tick').each(function () {
            $(this).trigger('click');
            $(this).prop("checked", false);
        });
    }
    if (map_x !== null && map_y !== null) {
        addMarker(sample_name, sample_guid, map_x, map_y);
    }
}

function check_all_movements() {
    if (document.getElementById('check_all_movements').checked) {
        $('.move_tick').each(function () {
            $(this).trigger('click');
            $(this).prop("checked", true);
        });
    }
    else {
        $('.move_tick').each(function () {
            $(this).trigger('click');
            $(this).prop("checked", false);
        });
    }
}

function check_all_cluster(){
    if (document.getElementById('check_all_cluster').checked) {
        $('.cluster_tick').each(function () {
            $(this).trigger('click');
            $(this).prop("checked", true);
        });
    }
    else {
        $('.cluster_tick').each(function () {
            $(this).trigger('click');
            $(this).prop("checked", false);
        });
    }
}

$('.cluster_tick').click(function () {
    var id = $(this).attr('id');
    var element_id = "map_" + id;
    var cluster_id = "no_" + id;
    var cluster_no = document.getElementById(cluster_id).innerHTML;
    var mapdata = document.getElementById(element_id).children;
    var random_index = Math.floor(Math.random() * 50) + 10;
    var random_icon_url = 'https://collectd.mmmoxford.uk/images/marker-' + random_index + '.png';

    var random_icon = new L.Icon({
        iconUrl: random_icon_url,
        iconSize: [12, 20],
        iconAnchor: [6, 20],
        popupAnchor: [1, -17],
        shadowSize: [0, 0]
    });

    for (i = 1; i < mapdata.length; i++){
        var map_info = mapdata[i].innerHTML;
        var map_info_split = map_info.split(",");
        var sample_name = map_info_split[0];
        var sample_map_x = map_info_split[1];
        var sample_map_y = map_info_split[2];
        if ($(this).is(':checked')) {
            addMarker(sample_name, "", sample_map_x, sample_map_y, random_icon, cluster_no);
        }
        else {
            hideMarker(sample_map_x, sample_map_y, sample_name);
        } 
    }
});


$('.sample_tick').click(function () {
    var id = $(this).attr('id');
    var sample_guid = id;
    var mapx_id = "mapx_" + sample_guid;
    var mapy_id = "mapy_" + sample_guid;
    var mapx_element = document.getElementById(mapx_id);
    var mapy_element = document.getElementById(mapy_id);
    if (mapx_element !== null && mapy_element !== null) {
        var mapxvalue = mapx_element.innerHTML;
        var mapyvalue = mapy_element.innerHTML;
        var name_id = "name_" + sample_guid;
        var namevalue = document.getElementById(name_id).innerHTML;
        var map_click_x = parseInt(mapxvalue);
        var map_click_y = parseInt(mapyvalue);

        if ($(this).is(':checked')) {
            addMarker(namevalue, sample_guid, map_click_x, map_click_y);
        }
        else {
            hideMarker(map_click_x, map_click_y, namevalue);
        }
    }
});

$('.move_tick').click(function () {
    var id = $(this).attr('id');
    var map_click_x = id.split('_')[0];
    var map_click_y = id.split('_')[1];
    var date = id.split('_')[2];
    var stay = id.split('_')[3];

    if ($(this).is(':checked')) {
        addMovement(map_click_x, map_click_y, date, stay);
    }
    else {
        hideMarker(map_click_x, map_click_y, "");
    }

});

function calculate_distance_in_mile(map1_x, map1_y, map2_x, map2_y) {
    var distance = Math.sqrt((map1_x - map2_x) * (map1_x - map2_x) + (map1_y - map2_y) * (map1_y - map2_y));
    return Math.round(distance * 0.000621371192);
}

function convert2latlon(map_x, map_y) {
    //create a osgb coordinate
    var osgb = new GT_OSGB();
    osgb.setGridCoordinates(map_x, map_y);

    //convert to a wgs84 coordinate
    var wgs84 = osgb.getWGS84();
    var lat_location = wgs84.latitude;
    var lng_location = wgs84.longitude;
    return [lat_location, lng_location];
}

function hideMarker(map_click_x, map_click_y, sample_name) {
    var latlng_value = convert2latlon(map_click_x, map_click_y);
    for (var layer in mymap._layers) {
        var latlng = mymap._layers[layer]._latlng;
        if (latlng !== undefined) {
            if (latlng.lat === latlng_value[0] && latlng.lng === latlng_value[1]
                && mymap._layers[layer]._popup._content !== undefined && mymap._layers[layer]._popup._content.indexOf(sample_name) !== -1
            ) {
                markerGroup.removeLayer(mymap._layers[layer]);
            }
        }
    } 
}