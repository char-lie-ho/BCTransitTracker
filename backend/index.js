var url;
const key = '5sPTi0xZHHUeDbm2V9Hm';
const keyAlt = 'TlaRyCg6LXfJnQ48nqJL';


function fetchData(type, pos) {
    const headers = new Headers({
        'Accept': 'application/json',
    });
    if (type === 'route') {
        var route = document.getElementById("route").value;
        url = `https://api.translink.ca/rttiapi/v1/buses?apikey=${key}&routeNo=${route}`
    }
    else if (type === 'initial') {
        url = `https://api.translink.ca/rttiapi/v1/stops?apikey=${key}&lat=${pos['lat']}&long=${pos['lng']}&radius=300`
    }
    else if (type === 'stop') {
        url = `https://api.translink.ca/rttiapi/v1/stops/${pos}/estimates?apikey=${key}&count=3&timeframe=60`
    }


    console.log(url)

    const options = {
        method: 'GET',
        headers: headers,
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => displayResult(data, type, route))
    // .catch(error => {
    //     console.error('Error:', error);
    //     alert("Invalid route number. Please use a valid active route id that is 3 digits, i.e. 003, 590.")
    // });
}

function displayResult(data, type, route) {
    console.log(data, type)

    let resultList = [];
    if (type === 'route') {
        data.forEach(function (element) {
            resultList.push({ lat: element['Latitude'], lng: element['Longitude'], dir: element['Direction'] })
        })

    }

    else if (type === 'initial') {
        document.getElementById('resultList').innerHTML = ''
        data.forEach(function (element) {
            if (element['Routes'] !== "") {
                fetchData('stop', element['StopNo'])
            }
        })

    }

    else if (type == 'stop') {
        console.log(data)
    }

}

function userLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        // convert coordinates to 6 digit 
        const pos = {
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6)),
        }; console.log(pos); fetchData('initial', pos)
    })

}

userLocation()

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is ready.')

})



