mapboxgl.accessToken = 'pk.eyJ1IjoidHJpc3RhbmpjMiIsImEiOiJjbHRqZ241cmowcjV3MnBtdWlib3ViM2V4In0.fld_yLFSf8--zkRNSwQzNA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-68.95, 45],
    zoom: 5
});

// Event listener for the search button
document.getElementById('searchBtn').addEventListener('click', searchLocation);

function searchLocation() {
    var city = document.getElementById('city').value;
    var state = document.getElementById('state').value;
    var radius = parseFloat(document.getElementById('radius').value);

    var address = city + ', ' + state;

    // Use Mapbox Geocoding API to get coordinates
    fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(address) + '.json?access_token=' + mapboxgl.accessToken)
        .then(response => response.json())
        .then(data => {
            var coordinates = data.features[0].center;

            // Zoom to the location
            map.flyTo({
                center: coordinates,
                zoom: 12,
                essential: true
            });

            // Draw a circle on the map
            drawCircle(coordinates, radius);
        })
        .catch(error => console.error('Error:', error));
}

function drawCircle(center, radius) {
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

//--------------------------------------------------------------------------------------------------------------------------------------------------


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