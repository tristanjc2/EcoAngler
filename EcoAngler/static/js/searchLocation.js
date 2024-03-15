const searchLocation = (map, midasData, currentPage, resultsPerPage) => {
    var city = document.getElementById('city').value;
    var state = document.getElementById('state').value;
    var midasNumber = document.getElementById('midas').value;
    var radius = parseFloat(document.getElementById('radius').value);

    clearError();

    if (midasNumber && midasData) {
        searchByMidasNumber(midasNumber, radius);
    } else {
        searchByAddress(city, state, radius);
    }

    function searchByMidasNumber(midasNumber, radius) {
        var midasFeature = midasData.features.find(feature => feature.properties.midas === midasNumber);
        if (midasFeature) {
            var coordinates = midasFeature.geometry.coordinates;
            zoomToLocation(coordinates, radius);
        } else {
            displayError('Midas number not found');
        }
    }

    function searchByAddress(city, state, radius) {
        var address = city + ', ' + state;
        fetchCoordinates(address)
            .then(coordinates => zoomToLocation(coordinates, radius))
            .catch(error => console.error('Error fetching coordinates:', error));
    }

    function fetchCoordinates(address) {
        return fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(address) + '.json?access_token=' + mapboxgl.accessToken)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.features && data.features.length > 0) {
                    return data.features[0].center;
                } else {
                    throw new Error('No features found in Mapbox Geocoding API response');
                }
            });
    }

    function zoomToLocation(coordinates, radius) {
        map.flyTo({
            center: coordinates,
            zoom: 12,
            essential: true
        });
        drawCircle(coordinates, radius);
    }

    function displayError(message) {
        var errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = message;
    }

    function clearError() {
        var errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = '';
    }

    function drawCircle(center, radius) {
        if (map.getSource('circle-source')) {
            map.removeLayer('circle-layer');
            map.removeSource('circle-source');
        }
        center = center.map(coord => parseFloat(coord));
        var options = { steps: 50, units: 'miles', properties: { foo: 'bar' } };
        var circle = turf.circle(center, radius, options);
        map.addSource('circle-source', {
            type: 'geojson',
            data: circle
        });
        map.addLayer({
            id: 'circle-layer',
            type: 'fill',
            source: 'circle-source',
            paint: {
                'fill-color': '#007cbf',
                'fill-opacity': 0.3
            }
        });
    }
    displayResults.displayResults(currentResults, startIndex, endIndex, totalResults);
};

export { searchLocation };