var url;

function loadGoogleMapsScript(apiKey) {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    document.head.appendChild(script);
}

function fetchData(type, selection) {
    const headers = new Headers({
        'Accept': 'application/json',
    });

    if (type === 'route') {
        var route = document.getElementById("route").value;
        url = `https://api.translink.ca/rttiapi/v1/buses?apikey=${key}&routeNo=${route}`
    } else if (type === 'initial') {
        const { pos } = selection
        url = `https://api.translink.ca/rttiapi/v1/stops?apikey=${key}&lat=${pos['lat']}&long=${pos['lng']}`
    } else if (type === 'from_map') {
        url = `https://api.translink.ca/rttiapi/v1/stops/${selection}/estimates?apikey=${key}`
    }

    const options = {
        method: 'GET',
        headers: headers,
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => displayResult(data, type, route))
        .catch(error => {
            console.error('Error:', error);
            alert("Invalid route number specified. Please use a valid active route id that is 3 digits, i.e. 003, 590.")
        });
}

function displayResult(data, type) {
    let resultList = [];
    if (type === 'initial') {
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

            document.getElementById('resultList').innerHTML += `<div class="col-6"><div class="card" href='#'>
            <div class="card-body"><div class="card-title"><a type="button" class="btn btn-info btn-sm" href='busRoute.html?route=${element['RouteNo']}'>${element['RouteNo']}</a>  <b>${element['Direction'][0]}</b></div>
            <span class="card-subtitle mb-2 text-muted">Next bus (mins): ${expectedCountdownArray.join(', ')}</span></div></div></div>`;
        })
    }
}


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

function formatRouteNo(value) {
    // Check if the value starts with an alpha character
    const startsWithAlpha = /^[a-zA-Z]/.test(value);

    if (!startsWithAlpha) {
        return String(Number(value)).padStart(3, '0');
    } else {
        return value;
    }
}

function displayRoute(busLocations, routeNo) {
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
    });
    routeNo = formatRouteNo(routeNo)

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
        ); 
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
            zoom: 15,
            center: pos,
            mapId: "4504f8b37365c3d0",
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: false,
        })
        
        // Display user current location
        const userMarker = new google.maps.Marker({
            position: pos,
            map: map,
            title: 'Your Location',
            icon: './image/personalPin.svg'
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
            });

            // Add a click listener for each marker, and set up the info window.
            marker.addListener("click", ({ domEvent }) => {
                const { target } = domEvent;

                infoWindow.close();
                infoWindow.setContent(marker.title);
                infoWindow.open(marker.map, marker);
                // Display route details 
                stationName = document.getElementById('stationName').innerHTML = `<b>${stop.Name}</b>`
                stationNo = document.getElementById('stationNo').innerHTML = `#${stop.StopNo}`
                fetchData('from_map', stop.StopNo)

            });
        });
    })
}

