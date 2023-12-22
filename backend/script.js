function fetchData(type) {
    var url;
    const key = '5sPTi0xZHHUeDbm2V9Hm';
    const keyAlt = 'TlaRyCg6LXfJnQ48nqJL';
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
    initMap(route)

    let busLocations = []
    if (type === 'route') {
        console.log(type)
        var resultList = document.getElementById('resultList');
        resultList.innerText = ''
        data.forEach(function (element) {
            busLocations.push([{ lat: element['Latitude'], lng: element['Longitude'], dir: element['Direction'] }])
        })
    }
    document.getElementById('map').style.display = "block"
    console.log(busLocations)
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is ready.')
})

// to make user to hit enter to search
function searchOnEnter(event) {
    // Check if the pressed key is Enter (key code 13)
    if (event.keyCode === 13) {
        saveSearchandRedirect();
    }
}

function initMap(routeNo) {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 2
    });

    var kmlLayer = new google.maps.KmlLayer({
        url: `https://nb.translink.ca/geodata/${routeNo}.kmz`
    });

    kmlLayer.setMap(map);
}