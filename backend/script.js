var url;
const key = '5sPTi0xZHHUeDbm2V9Hm';
const keyAlt = 'TlaRyCg6LXfJnQ48nqJL';
function fetchData(type, pos = null) {
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
        console.log(pos['lat'])
        url = `https://api.translink.ca/rttiapi/v1/stops?apikey=${key}&lat=${pos['lat']}&long=${pos['lng']}`
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

    let busLocations = []
    if (type === 'route') {
        console.log(type)
        var resultList = document.getElementById('resultList');
        resultList.innerText = ''
        data.forEach(function (element) {
            busLocations.push({ lat: element['Latitude'], lng: element['Longitude'], dir: element['Direction'] })
        })
        displayRoute(busLocations, route)
    }


    console.log(busLocations)
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is ready.')
})


function initMap() {
    navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6)),
        }
        console.log(pos)
        // Display nearby bus stops

        fetchData('initial', pos)
        new google.maps.Map(document.getElementById('map'), {
            center: pos,
            zoom: 14
        })
    })
}

function displayRoute(busLocations, routeNo) {
    var map = new google.maps.Map(document.getElementById('map'));

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
        });
    })
}