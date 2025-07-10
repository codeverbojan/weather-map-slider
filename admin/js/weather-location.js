document.addEventListener('DOMContentLoaded', function () {
    const latInput = document.querySelector('input[name="acf[field_location_group][field_latitude]"]');
    const lngInput = document.querySelector('input[name="acf[field_location_group][field_longitude]"]');

    if (!latInput || !lngInput) {
        console.warn('Lat/Lng inputs not found.');
        return;
    }

    let mapContainer = document.getElementById('weather-map');
    if (!mapContainer) {
        mapContainer = document.createElement('div');
        mapContainer.id = 'weather-map';
        mapContainer.style.height = '300px';
        mapContainer.style.marginTop = '10px';

        const searchContainer = document.getElementById('weather-location-search');
        if (searchContainer) {
            searchContainer.appendChild(mapContainer);
        } else {
            console.error('Missing #weather-location-search container.');
            return;
        }
    }

    const initialLat = parseFloat(latInput.value) || 40.0;
    const initialLng = parseFloat(lngInput.value) || -100.0;

    if (typeof L === 'undefined') {
        console.error('Leaflet.js is not loaded');
        return;
    }

    const map = L.map('weather-map').setView([initialLat, initialLng], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker = L.marker([initialLat, initialLng], {
        draggable: true
    }).addTo(map);

    marker.on('moveend', function (e) {
        const { lat, lng } = e.target.getLatLng();
        latInput.value = lat.toFixed(6);
        lngInput.value = lng.toFixed(6);
    });

    map.on('click', function (e) {
        marker.setLatLng(e.latlng);
        latInput.value = e.latlng.lat.toFixed(6);
        lngInput.value = e.latlng.lng.toFixed(6);
    });

    // ✅ Add Geocoder Search
    if (typeof L.Control.Geocoder !== 'undefined') {
        const geocoder = L.Control.geocoder({
            defaultMarkGeocode: false
        })
        .on('markgeocode', function (e) {
            const center = e.geocode.center;
            map.setView(center, 13);
            marker.setLatLng(center);
            latInput.value = center.lat.toFixed(6);
            lngInput.value = center.lng.toFixed(6);
        })
        .addTo(map);
    } else {
        console.warn('Leaflet Control Geocoder not loaded');
    }
});
