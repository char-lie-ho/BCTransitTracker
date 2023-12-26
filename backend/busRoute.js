function loadGoogleMapsScript(apiKey) {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    document.head.appendChild(script);
}

function initMap() {
    navigator.geolocation.getCurrentPosition((position) => {
        // convert coordinates to 6 digit 
        const pos = {
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6)),
        }

        new google.maps.Map(document.getElementById('map'), {
            center: pos,
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
        })
    })
}

let params = new URL(window.location.href); //get URL of search bar
let keyword = params.searchParams.get("route"); //get value for key "id"
console.log(keyword)



if (!keyword) {

}


function showRoute() {
    var route = document.getElementById("route").value;
    if (formatRouteNo(route) && route.length != 0) {
        fetchData(route)
            .then(data => displayRoute(data))
            .catch(error => console.error('Error processing data:', error))
    } else {
        //inform user their input is incorrect
        console.log('incorrect input')
    }
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

function fetchData(route) {
    url = `https://api.translink.ca/rttiapi/v1/buses?apikey=${key}&routeNo=${route}`

    const headers = new Headers({
        'Accept': 'application/json',
    });

    const options = {
        method: 'GET',
        headers: headers,
    };

    return fetch(url, options)
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
            alert("Invalid route number specified. Please use a valid active route id that is 3 digits, i.e. 003, 590.")
        });
}


function displayRoute(data) {
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
    });
    console.log(data[0].RouteMap.Href)
    var kmlLayer = new google.maps.KmlLayer({
        url: data[0].RouteMap.Href
    });

    kmlLayer.setMap(map);

    const image = "image/bus.png"
    data.forEach(location => {
        console.log(location)
        const marker = new google.maps.Marker({
            position: { lat: location.Latitude, lng: location.Longitude },
            map: map,
            title: location.title,
            icon: image,
        });
        console.log(marker)
    })
}