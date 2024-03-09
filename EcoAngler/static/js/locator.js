mapboxgl.accessToken = 'pk.eyJ1IjoidHJpc3RhbmpjMiIsImEiOiJjbHRqZ241cmowcjV3MnBtdWlib3ViM2V4In0.fld_yLFSf8--zkRNSwQzNA';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.006, 40.7128], // Example coordinates (New York City)
        zoom: 8
    });

    // Add navigation controls to the map
    map.addControl(new mapboxgl.NavigationControl());

    // Add a simple search functionality
    document.getElementById('searchBtn').addEventListener('click', function () {
        var searchInput = document.getElementById('searchInput').value;
        if (searchInput) {
            // Use Mapbox Geocoding API to get the coordinates for the searched location
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchInput}.json?access_token=${mapboxgl.accessToken}`)
                .then(response => response.json())
                .then(data => {
                    var coordinates = data.features[0].center;
                    map.flyTo({ center: coordinates, zoom: 12 });
                })
                .catch(error => console.error(error));
        }
    });

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