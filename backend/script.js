var url;
const key = '5sPTi0xZHHUeDbm2V9Hm';
const keyAlt = 'TlaRyCg6LXfJnQ48nqJL';
function fetchData(type, selection) {
    const headers = new Headers({
        'Accept': 'application/json',
    });

    if (type === 'route') {
        var route = document.getElementById("route").value;
        url = `https://api.translink.ca/rttiapi/v1/buses?apikey=${key}&routeNo=${route}`
    } else if (type === 'stops') {
        var stop = document.getElementById("stop").value;
        url = `https://api.translink.ca/rttiapi/v1/stops/${stop}?apikey=${key}`
    } else if (type === 'estimate') {
        var estimate = document.getElementById("estimate").value;
        url = `https://api.translink.ca/rttiapi/v1/stops/${estimate}/estimates?apikey=${key}`
    } else if (type === 'initial') {
        const { pos } = selection
        url = `https://api.translink.ca/rttiapi/v1/stops?apikey=${key}&lat=${pos['lat']}&long=${pos['lng']}`
    } else if (type === 'from_map') {
        url = `https://api.translink.ca/rttiapi/v1/stops/${selection}/estimates?apikey=${key}`
    }
    console.log(url)

    const options = {
        method: 'GET',
        headers: headers,
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => displayResult(data, type, route))
        .catch(error => console.error('Error:', error));
}

function displayResult(data, type, route) {
    console.log(data, type)

    let resultList = [];
    if (type === 'route') {
        data.forEach(function (element) {
            resultList.push({ lat: element['Latitude'], lng: element['Longitude'], dir: element['Direction'] })
        })
        displayRoute(resultList, route)
    } else if (type === 'initial') {
        data.forEach(function (element) {
            resultList.push({
                lat: element['Latitude'], lng: element['Longitude'], routes: element['Routes'],
                StopNo: element['StopNo'], Name: element['Name']
            })
        })
        displayStops(resultList)
    } else if (type === 'from_map') {
        document.getElementById('resultList').innerHTML = ''
        data.forEach(function (element) {
            const expectedCountdownArray = element['Schedules']
                .map(schedule => schedule['ExpectedCountdown'])
                .filter(countdown => countdown >= 0 && countdown < 60);  // Only display bus within 60 mins

            document.getElementById('resultList').innerHTML += `<div class="col-6"><div class="card" style="height:130px"href='#'>
            <div class="card-body"><div class="card-title"><button type="button" class="btn btn-info btn-sm">Route: ${element['RouteNo']}</button>  <b>${element['Direction'][0]}</b></div>
            <span class="card-subtitle mb-2 text-muted">Next bus (mins): ${expectedCountdownArray.join(', ')}</span></div></div></div>`;
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is ready.')
})


function initMap() {
    navigator.geolocation.getCurrentPosition((position) => {
        // convert coordinates to 6 digit 
        const pos = {
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6)),
        }

        // Display nearby bus stops
        fetchData('initial', { pos })
        new google.maps.Map(document.getElementById('map'), {
            center: pos,
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
        })
    })
}

function displayRoute(busLocations, routeNo) {
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
    });

    var kmlLayer = new google.maps.KmlLayer({
        url: `https://nb.translink.ca/geodata/${routeNo}.kmz`
    });

    kmlLayer.setMap(map);
    const image = "image/bus.png"
    busLocations.forEach(location => {
        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.title,
            icon: image,
        }
        ); console.log(marker)
    })
}

async function displayStops(busStops) {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
        "marker",
    );

    navigator.geolocation.getCurrentPosition((position) => {
        // convert coordinates to 6 digit 
        const pos = {
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6)),
        }
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 14,
            center: pos,
            mapId: "4504f8b37365c3d0",
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: false,
        })
        console.log(busStops)
        // Display user current location

        const userMakrer = new google.maps.Marker({
            position: pos,
            map: map,
            title: 'Your Location',
            icon: 'image/personal_pin.svg'
        });
        // Create an info window to share between markers.
        const infoWindow = new InfoWindow();

        // Create the markers.
        busStops.forEach((stop) => {
            const contentString = ` <p>${stop.Name}</p>
                                    <p>Route: ${stop.routes}</p>
                                    `
            const marker = new AdvancedMarkerElement({
                position: { lat: stop.lat, lng: stop.lng },
                map,
                title: contentString,
                // icon: 'image/personal_pin.svg'
            });

            // Add a click listener for each marker, and set up the info window.
            marker.addListener("click", ({ domEvent, latLng }) => {
                const { target } = domEvent;

                infoWindow.close();
                infoWindow.setContent(marker.title);
                infoWindow.open(marker.map, marker);
                // Display route details 
                console.log(stop.StopNo)
                stationName = document.getElementById('stationName').innerHTML = `${stop.Name}`
                stationNo = document.getElementById('stationNo').innerHTML = `#${stop.StopNo}`
                fetchData('from_map', stop.StopNo)

            });
        });
    })
}

