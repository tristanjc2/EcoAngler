const mapInitialization = () => {
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
            searchLocation.midasData = data; // Save midasData to searchLocation module
        })
        .catch(error => console.error('Error loading midas.geojson:', error))
        .finally(() => {
            searchLocation.searchLocation(); // Call searchLocation after midasData is fetched
        });

    return map;
};

export { mapInitialization };