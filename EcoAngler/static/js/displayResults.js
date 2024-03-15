const displayResults = (currentResults, startIndex, endIndex, totalResults) => {
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
    nameLink.href = '#';
    nameLink.classList.add('clickable');
    nameLink.addEventListener('click', function (event) {
        event.preventDefault();
        clearMainSection(name);
    });
    return nameLink;
}

function clearMainSection(locationName) {
    var mainSection = document.querySelector('main.locator-page');
    mainSection.innerHTML = '';
    var h1 = document.createElement('h1');
    h1.textContent = locationName;
    mainSection.appendChild(h1);
}

function dropPinOnMap(coordinates) {
    new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);
}

export { displayResults };
