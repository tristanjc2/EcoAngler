document.addEventListener('DOMContentLoaded', function () {
    mapboxgl.accessToken = 'pk.eyJ1IjoidHJpc3RhbmpjMiIsImEiOiJjbHRqZ241cmowcjV3MnBtdWlib3ViM2V4In0.fld_yLFSf8--zkRNSwQzNA';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-68.95, 45],
        zoom: 5
    });

    // Load midas.geojson data
    var midasData;
    fetch('/static/midas/midas.geojson')
        .then(response => response.json())
        .then(data => {
            midasData = data;
        })
        .catch(error => console.error('Error loading midas.geojson:', error));

    // Variables to keep track of the current page and results per page
    var currentPage = 1;
    var resultsPerPage = 10;

    // Event listener for the search button
    document.getElementById('searchBtn').addEventListener('click', searchLocation);

    // Event listener for the "See More" button
    document.getElementById('see-more-button').addEventListener('click', function () {
        currentPage++;
        searchLocation(); // Trigger a new search to update the results
    });

    // Event listener for hard refresh
    window.addEventListener('unload', function () {
        // Clear form inputs
        document.getElementById('city').value = '';
        document.getElementById('state').value = '';
        document.getElementById('midas').value = '';
        document.getElementById('radius').value = '';
    });

    function searchLocation() {
        var city = document.getElementById('city').value;
        var state = document.getElementById('state').value;
        var midasNumber = document.getElementById('midas').value;
        var radius = parseFloat(document.getElementById('radius').value);
    
        // Clear previous error messages
        clearError();
    
        // If a Midas number is provided, find and zoom to its coordinates
        if (midasNumber) {
            var midasFeature = midasData.features.find(feature => feature.properties.midas === midasNumber);
            if (midasFeature) {
                var coordinates = midasFeature.geometry.coordinates;
    
                // Zoom to the location
                map.flyTo({
                    center: coordinates,
                    zoom: 12,
                    essential: true
                });
    
                // Draw a circle on the map
                drawCircle(coordinates, radius);
    
                // Filter features within the radius
                var featuresWithinRadius = midasData.features.filter(feature => {
                    var distance = turf.distance(coordinates, feature.geometry.coordinates, { units: 'miles' });
                    return distance <= radius;
                });
    
                displayResults(featuresWithinRadius);
            } else {
                // Display Midas number not found error
                displayError('Midas number not found');
            }
        } else {
            // Use Mapbox Geocoding API to get coordinates
            var address = city + ', ' + state;
            fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(address) + '.json?access_token=' + mapboxgl.accessToken)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Geocoding API response:', data);
    
                    if (data.features && data.features.length > 0) {
                        var coordinates = data.features[0].center;
    
                        console.log('Coordinates:', coordinates);
    
                        // Zoom to the location
                        map.flyTo({
                            center: coordinates,
                            zoom: 12,
                            essential: true
                        });
    
                        // Draw a circle on the map
                        drawCircle(coordinates, radius);
    
                        // Filter features within the radius
                        var featuresWithinRadius = midasData.features.filter(feature => {
                            var distance = turf.distance(coordinates, feature.geometry.coordinates, { units: 'miles' });
                            return distance <= radius;
                        });
    
                        // Display results in the left section
                        displayResults(featuresWithinRadius);
                    } else {
                        // Display no features found error
                        displayError('No features found in Mapbox Geocoding API response');
                    }
                })
                .catch(error => {
                    // Log the error to the console without displaying it in the form
                    console.error('Error fetching Mapbox Geocoding API:', error);
                });
        }
    }

    document.getElementById('see-more-button').addEventListener('click', function () {
        currentPage++;
        searchLocation(); // Trigger a new search to update the results
    });

    // Function to display error messages
    function displayError(message) {
        var errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = message;
    }

    // Function to clear error messages
    function clearError() {
        var errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = '';
    }

    // Function to draw a circle on the map
    function drawCircle(center, radius) {
        // Check if the source and layer already exist, and remove them if present
        if (map.getSource('circle-source')) {
            map.removeLayer('circle-layer');
            map.removeSource('circle-source');
        }

        // Ensure that center is an array of numbers
        center = center.map(coord => parseFloat(coord));

        // Create a Turf.js circle
        var options = { steps: 50, units: 'miles', properties: { foo: 'bar' } };
        var circle = turf.circle(center, radius, options);

        // Add the Turf.js circle to the map
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

    function displayResults(features) {
        // Sort features by distance
        features.sort((a, b) => {
            var coordinatesA = a.geometry.coordinates;
            var coordinatesB = b.geometry.coordinates;
            var distanceA = turf.distance(coordinatesA, map.getCenter().toArray(), { units: 'miles' });
            var distanceB = turf.distance(coordinatesB, map.getCenter().toArray(), { units: 'miles' });

            return distanceA - distanceB;
        });

        // Calculate the total number of pages
        var totalResults = features.length;
        var totalPages = Math.ceil(totalResults / resultsPerPage);

        // Clear existing results if it's the first page
        if (currentPage === 1) {
            var resultsContainer = document.querySelector('.left-section table tbody');
            resultsContainer.innerHTML = ''; // Clear the tbody content
        }

        // Display results for the current page
        var startIndex = (currentPage - 1) * resultsPerPage;
        var endIndex = startIndex + resultsPerPage;
        var currentResults = features.slice(startIndex, endIndex);

        // Display new results
        currentResults.forEach(feature => {
            var row = document.createElement('tr');

            // Add a different background color for alternate rows
            row.style.backgroundColor = features.indexOf(feature) % 2 === 0 ? '#f9f9f9' : '#ffffff';

            // Loop through properties and create cells
            var headers = ['name', 'location', 'midas', 'miles']; // Updated headers
            headers.forEach(header => {
                var cell = document.createElement('td');

                if (header === 'name') {
                    var nameParts = feature.properties.name.split('-');
                    cell.textContent = nameParts[0].trim(); // Displaying the first part of the name
                } else if (header === 'location') {
                    var nameParts = feature.properties.name.split('-');
                    cell.textContent = nameParts[2].trim(); // Displaying the third part of the name as location
                } else if (header === 'midas') {
                    cell.textContent = feature.properties.midas;
                } else if (header === 'miles') {
                    // Calculate and display distance
                    var coordinates = feature.geometry.coordinates;
                    var distance = turf.distance(coordinates, map.getCenter().toArray(), { units: 'miles' });
                    cell.textContent = distance.toFixed(2);
                }

                row.appendChild(cell);
            });

            resultsContainer.appendChild(row);

            // Drop a pin on the map for each result
            var coordinates = feature.geometry.coordinates;
            dropPinOnMap(coordinates);
        });

        // Display current status text
        var statusText = document.getElementById('status-text');
        statusText.textContent = `Now displaying ${startIndex + 1} - ${Math.min(endIndex, totalResults)} out of ${totalResults} total results`;

        // Display "See More" button if there are more pages
        var seeMoreButton = document.getElementById('see-more-button');
        if (currentPage < totalPages) {
            seeMoreButton.style.display = 'block';
        } else {
            seeMoreButton.style.display = 'none';
        }
    }

    // Function to drop a pin on the map
    function dropPinOnMap(coordinates) {
        new mapboxgl.Marker()
            .setLngLat(coordinates)
            .addTo(map);
    }

});



// ----------------------------------------------------------------------------------------------------------------------------------------------

// Get the button and overlay elements
const signUpBtn = document.getElementById('sign-up-btn');
const signUpOverlay = document.getElementById('sign-up-overlay');
const loginBtn = document.getElementById('login-btn');
const loginOverlay = document.getElementById('login-overlay');

// Function to toggle overlay visibility
function toggleOverlay(overlay) {
    overlay.style.display = (overlay.style.display === 'flex') ? 'none' : 'flex';
}

// Function to close overlay
function closeOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    overlay.style.display = 'none';
}

// Add click event listeners if elements are found
if (signUpBtn) {
    signUpBtn.addEventListener('click', (event) => {
        console.log('Sign Up button clicked');
        toggleOverlay(signUpOverlay);
        event.stopPropagation(); // Stop the event from reaching the document
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', (event) => {
        console.log('Login button clicked');
        toggleOverlay(loginOverlay);
        event.stopPropagation(); // Stop the event from reaching the document
    });
}

// Close the overlay when clicking outside
document.addEventListener('click', () => {
    signUpOverlay.style.display = 'none';
    loginOverlay.style.display = 'none';
});

// Prevent clicks inside the overlay from closing it
signUpOverlay.addEventListener('click', (event) => {
    event.stopPropagation();
});

loginOverlay.addEventListener('click', (event) => {
    event.stopPropagation();
});

//--------------------------------------------------------------------------------------------------------------------------------------------------


