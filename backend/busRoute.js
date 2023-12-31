function loadGoogleMapsScript(apiKey) {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    document.head.appendChild(script);
}
var pos;

function initMap() {
    navigator.geolocation.getCurrentPosition((position) => {
        // convert coordinates to 6 digit 
        pos = {
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6)),
        }

        const map = new google.maps.Map(document.getElementById('map'), {
            center: pos,
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
        })

        const userMarker = new google.maps.Marker({
            position: pos,
            map: map,
            title: 'Your Location',
            icon: './image/personalPin.svg'
        });
    })
}

let params = new URL(window.location.href); //get URL of search bar
let keyword = params.searchParams.get("route"); //get value for key "id"
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is ready.');
    if (keyword) {
        useParam(keyword)
    }
})



function useKeyword() {
    var route = document.getElementById("route").value;
    if (formatRouteNo(route) && route.length != 0) {
        fetchData(route)
            .then(data => displayRoute(data))
            .catch(error => { alert('Invalid route number.'); initMap() })
    } else {
        //inform user their input is incorrect
        console.log('incorrect input')
    }
}

function useParam(param) {
    fetchData(param)
        .then(data => displayRoute(data))
        .catch(error => { alert('Server error.'); initMap() })
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


async function displayRoute(data) {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
    });
    
    var kmlLayer = new google.maps.KmlLayer({
        url: data[0].RouteMap.Href
    });

    kmlLayer.setMap(map);
    // Create an info window to share between markers.
    const infoWindow = new InfoWindow();

    const image = "image/bus.png"
    data.forEach(bus => {
        const contentString = `${bus.RouteNo} ${bus.Direction}BOUND`
        const marker = new google.maps.Marker({
            position: { lat: bus.Latitude, lng: bus.Longitude },
            map: map,
            icon: image,
            title: contentString,
        });
        
        marker.addListener("click", ({ domEvent }) => {
            const { target } = domEvent;
            infoWindow.close();
            infoWindow.setContent(marker.title);
            infoWindow.open(marker.map, marker);

        });

    })

    const userMarker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'Your Location',
        icon: './image/personalPin.svg'
    });

}