function fetchData(type) {
    var url;
    const key = 'TlaRyCg6LXfJnQ48nqJL';
    const headers = new Headers({
        'Accept': 'application/json',
    });

    if (type === 'route') {
        var route = document.getElementById("route").value;
        url = `https://api.translink.ca/rttiapi/v1/routes/${route}?apikey=`

    } else if (type === 'stops') {
        var stop = document.getElementById("stop").value;
        url = `https://api.translink.ca/rttiapi/v1/stops/${stop}?apikey=`
    } else if (type === 'estimate') {
        var estimate = document.getElementById("estimate").value;
        url = `https://api.translink.ca/rttiapi/v1/stops/${estimate}/estimates?apikey=`
    }
    console.log(url)

    const options = {
        method: 'GET',
        headers: headers,
    };


    fetch(url + key, options)
        .then(response => response.json())
        .then(data => displayResult(data))
        .catch(error => console.error('Error:', error));
}

function displayResult(data) {
    console.log(data)
    document.getElementById("result").innerText = data[0]['RouteName']
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