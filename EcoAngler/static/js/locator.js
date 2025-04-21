document.addEventListener('DOMContentLoaded', function () {
    // Map initialization
    mapboxgl.accessToken = 'pk.eyJ1IjoidHJpc3RhbmpjMiIsImEiOiJjbHRqZ241cmowcjV3MnBtdWlib3ViM2V4In0.fld_yLFSf8--zkRNSwQzNA';
    var map = initializeMap();
    var midasData; // Define midasData variable

    var currentPage = 1;
    var resultsPerPage = 10;

    // Event listeners
    document.getElementById('searchBtn').addEventListener('click', searchLocation);
    document.getElementById('see-more-button').addEventListener('click', function () {
        currentPage++;
        searchLocation();
    });
    window.addEventListener('unload', clearFormInputs);
    map.on('zoomend', function () {
        if (map.getZoom() >= 12 && midasData) {
            filterAndDisplayFeatures(map.getCenter().toArray(), parseFloat(document.getElementById('radius').value));
        }
    });

    // Functions
    function initializeMap() {
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-68.95, 45],
            zoom: 5
        });

        // Load midas.geojson data
        fetch('/static/midas/midas.geojson')
            .then(response => response.json())
            .then(data => {
                midasData = data;
            })
            .catch(error => console.error('Error loading midas.geojson:', error))
            .finally(() => {
                searchLocation(); // Call searchLocation after midasData is fetched
            });

        return map;
    }

    function searchLocation() {
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

    function filterAndDisplayFeatures(coordinates, radius) {
        var featuresWithinRadius = midasData.features.filter(feature => {
            var distance = turf.distance(coordinates, feature.geometry.coordinates, { units: 'miles' });
            return distance <= radius;
        });
        calculateDistanceAndDisplay(featuresWithinRadius);
    }

    function calculateDistanceAndDisplay(features) {
        features.sort((a, b) => {
            var distanceA = turf.distance(a.geometry.coordinates, map.getCenter().toArray(), { units: 'miles' });
            var distanceB = turf.distance(b.geometry.coordinates, map.getCenter().toArray(), { units: 'miles' });
            return distanceA - distanceB;
        });

        var startIndex = (currentPage - 1) * resultsPerPage;
        var endIndex = startIndex + resultsPerPage;
        var currentResults = features.slice(startIndex, endIndex);

        displayResults(currentResults, startIndex, endIndex, features.length);
    }

    function displayResults(currentResults, startIndex, endIndex, totalResults) {
        var resultsContainer = document.querySelector('.left-section table tbody');
        resultsContainer.innerHTML = '';

        currentResults.forEach(feature => {
            var row = createTableRow(feature);
            resultsContainer.appendChild(row);
            dropPinOnMap(feature.geometry.coordinates);
        });

        var statusText = document.getElementById('status-text');
        statusText.textContent = `Now displaying ${startIndex + 1} - ${Math.min(endIndex, totalResults)} out of ${totalResults} total results`;

        var seeMoreButton = document.getElementById('see-more-button');
        seeMoreButton.style.display = currentPage < Math.ceil(totalResults / resultsPerPage) ? 'block' : 'none';
    }

    function createTableRow(feature) {
        var row = document.createElement('tr');

        ['name', 'location', 'midas', 'miles'].forEach(header => {
            var cell = document.createElement('td');
            if (header === 'name') {
                cell.appendChild(createNameLink(feature.properties.name.split('-')[0].trim()));
            } else if (header === 'location') {
                cell.textContent = feature.properties.name.split('-')[2].trim();
            } else if (header === 'midas') {
                cell.textContent = feature.properties.midas;
            } else if (header === 'miles') {
                var distance = turf.distance(feature.geometry.coordinates, map.getCenter().toArray(), { units: 'miles' });
                cell.textContent = distance.toFixed(2);
            }
            row.appendChild(cell);
        });

        return row;
    }

    function createNameLink(name) {
        var nameLink = document.createElement('a');
        nameLink.textContent = name;
        nameLink.href = '/location';
        nameLink.classList.add('clickable');
        
        // BELOW IS USED TO TAKE LOCATION OUT OF LOCATOR PAGE AND CLEAR LOCATOR TO REUSE THE SAME PAGE FOR DISPLAYING INFO ON CLICKED BODY OF WATER.

        // nameLink.addEventListener('click', function (event) {
            // event.preventDefault();
            // clearMainSection(name);
        // });
        return nameLink;
    }

    // function clearMainSection(locationName) {
    //     var mainSection = document.querySelector('main.locator-page');
    //     mainSection.innerHTML = '';
    //     var h1 = document.createElement('h1');
    //     h1.textContent = locationName;
    //     mainSection.appendChild(h1);
    // }

    function displayError(message) {
        var errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = message;
    }

    function clearError() {
        var errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = '';
    }

    function clearFormInputs() {
        document.getElementById('city').value = '';
        document.getElementById('state').value = '';
        document.getElementById('midas').value = '';
        document.getElementById('radius').value = '';
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

    function dropPinOnMap(coordinates) {
        new mapboxgl.Marker()
            .setLngLat(coordinates)
            .addTo(map);
    }
});

