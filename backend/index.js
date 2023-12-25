var url;
const key = '5sPTi0xZHHUeDbm2V9Hm';
const keyAlt = 'TlaRyCg6LXfJnQ48nqJL';


function fetchData(type, info) {
    const headers = new Headers({
        'Accept': 'application/json',
    });
    if (type === 'route') {
        var route = document.getElementById("route").value;
        url = `https://api.translink.ca/rttiapi/v1/buses?apikey=${key}&routeNo=${route}`
    }
    else if (type === 'initial') {
        url = `https://api.translink.ca/rttiapi/v1/stops?apikey=${key}&lat=${info['lat']}&long=${info['lng']}&radius=250`
    }
    else if (type === 'stop') {
        url = `https://api.translink.ca/rttiapi/v1/stops/${info['stopNo']}/estimates?apikey=${key}&count=3&timeframe=60`
    }

    console.log(url)

    const options = {
        method: 'GET',
        headers: headers,
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => displayResult(data, type, info))
    // .catch(error => {
    //     console.error('Error:', error);
    //     alert("Invalid route number. Please use a valid active route id that is 3 digits, i.e. 003, 590.")
    // });
}

function displayResult(data, type, info) {
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
            if (element['Routes'].length > 0) {
                info = { 'stopNo': element['StopNo'], 'AtStreet': element['AtStreet'] }
                fetchData('stop', info)
            }
        })
    }

    else if (type == 'stop' && data.length > 0) {
        console.log(data)
        data.forEach(function (element) {
            var expectedCountdownArray = element['Schedules']
                .map(schedule => schedule['ExpectedCountdown'])
            document.getElementById('resultList').innerHTML += `<div class="col-6"><div class="card" href='#'>
            <div class="card-body"><div class="card-title"><button type="button" class="btn btn-info btn-sm">Route: ${element['RouteNo']}</button> 
            @${info['AtStreet']}   
            <b>${element['Direction'][0]}</b></div>
            <span class="card-subtitle mb-2 text-muted">Next bus (mins): ${expectedCountdownArray.join(', ')}</span></div></div></div>`
        })
        //   on line 66, change to display station name 
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



