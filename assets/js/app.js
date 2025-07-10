import gsap from 'gsap';
import '../scss/style.scss';

document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('weather-map').setView([41.0, 21.3], 7);
  
  // disable scroll if you want users to go to the first slide
  //map.scrollWheelZoom.disable();
  
  
  
  const sidebar = document.getElementById('weather-sidebar');
  const overlay = document.querySelector('.gradient-overlay');
  const slider = document.getElementById('weather-header');
  const infoBox = document.querySelector('.station-info');
  
  let lastWeatherData = null;
  let scrollY = 0;
  let isAnimating = false;
  let pendingSidebarReveal = false;

  let celsius = localStorage.getItem('unit') !== 'f';
  let currentStation = null;
  let stationsList = [];
  
  
  
	const sidebarInner = document.querySelector('.sidebar-inner');

	const myLocationsLink = document.createElement('div');
	myLocationsLink.className = 'my-locations-link';
	myLocationsLink.innerHTML = `<a href="#" class="my-locations-toggle">My Locations</a>`;
	sidebarInner.appendChild(myLocationsLink);
	
	// Hide if no bookmarks
	const bookmarks = (JSON.parse(localStorage.getItem('bookmarkedStations') || '[]')).map(String);
	if (!bookmarks.length) {
		myLocationsLink.style.display = 'none';
	}
  

  // Sidebar hidden on load
  gsap.set(sidebar, { x: -300, opacity: 0, pointerEvents: 'none' });

  // Custom scroll behavior using GSAP
  window.addEventListener('wheel', (e) => {
    if (isAnimating) return;

    if (e.deltaY > 0 && scrollY === 0) {
      scrollY = 1;
      animateToMap();
    } else if (e.deltaY < 0 && scrollY === 1) {
      scrollY = 0;
      animateToTop();
    }
  });

  function animateToMap() {
	  isAnimating = true;
	
	  const tl = gsap.timeline({
	    onComplete: () => {
	      isAnimating = false;
	
	      if (currentStation || lastWeatherData || pendingSidebarReveal) {
	        showSidebar();
	        pendingSidebarReveal = false;
	      }
	    }
	  });
	
	  tl.to(slider, { y: '-100vh', duration: 0.8, ease: 'expo.out' }, 0)
	    .to(overlay, { opacity: 0, duration: 1.5, ease: 'expo.out' }, 0);
	}

  function animateToTop() {
	  isAnimating = true;
	
	  const tl = gsap.timeline({
	    onComplete: () => {
	      isAnimating = false;
	      pendingSidebarReveal = true; // allow reveal on next scroll down
	    }
	  });
	
	  tl.to(slider, { y: '0vh', duration: 0.8, ease: 'expo.out' }, 0)
	    .to(overlay, { opacity: 1, duration: 0.8, ease: 'expo.out' }, 0)
	    .to(sidebar, { x: '-100%', duration: 0.3, ease: 'expo.out' }, 0);
	}

  function showSidebar() {
    gsap.to(sidebar, {
      x: 0,
      opacity: 1,
      pointerEvents: 'auto',
      duration: 0.3,
      ease: 'expo.out'
    });
  }

  // Hide sidebar on map drag/zoom
  map.on('zoomstart dragstart', () => {
    gsap.to(sidebar, {
      x: -300,
      opacity: 0,
      pointerEvents: 'none',
      duration: 0.3,
      ease: 'expo.out'
    });
  });

  // Load map tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Load weather stations
  fetch(`${weatherMap.ajaxUrl}?action=load_weather_stations`)
    .then(res => res.json())
    .then(({ success, data }) => {
	  if (!success || !data) return;
	
	  stationsList = data;
	
	  data.forEach(station => {
	    const marker = L.marker([station.lat, station.lng]).addTo(map);
	    marker.on('click', () => activateStation(station));
	  });
	
	  // Add My Locations link ONLY if user has bookmarks
	  const bookmarks = (JSON.parse(localStorage.getItem('bookmarkedStations') || '[]')).map(String);
	  
	
	  // Load station from hash if present
	  if (location.hash) {
	    const title = decodeURIComponent(location.hash.replace('#', ''));
	    const match = stationsList.find(st => st.title === title);
	    if (match) activateStation(match);
	  }else {
	    infoBox.innerHTML = `
	      <div class="station-placeholder">
	        <p><strong>Click on the map to get weather data</strong></p>
	      </div>
	    `;
	    pendingSidebarReveal = true;
	    if (scrollY === 1) showSidebar();
	  }
	
	  // Click to select closest station
	  map.on('click', e => {
	    const nearest = findClosestStation(e.latlng, stationsList);
	    if (nearest) activateStation(nearest);
	  });
	});
	
  function activateStation(station, forceReload = false) {
	  const sidebarIsHidden = sidebar.style.opacity === '0' || sidebar.style.pointerEvents === 'none';
	
	  if (!forceReload && currentStation && currentStation.id === station.id && !sidebarIsHidden) {
	    return;
	  }
	
	  currentStation = station;
	  location.hash = `#${station.title}`;
	  map.setView([station.lat, station.lng], 12);
	  loadWeatherData(station.id);
	}


  function loadWeatherData(stationId) {
	  infoBox.innerHTML = `
	    <div class="loading-spinner">
	      <div class="spinner"></div>
	      <p>Loading weather data...</p>
	    </div>
	  `;
	
	  fetch(weatherMap.ajaxUrl, {
	    method: 'POST',
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	    body: new URLSearchParams({ action: 'get_weather', station_id: stationId }),
	  })
	    .then(res => res.json())
	    .then(res => {
	      if (!res.success) {
	        infoBox.innerHTML = 'Weather data not found';
	        return;
	      }
	
	      lastWeatherData = res.data;
	      renderWeatherInfo(lastWeatherData);
	
	      if (scrollY === 1) {
	        showSidebar();
	      } else {
	        pendingSidebarReveal = true;
	      }
	    });
	}
	
	function renderWeatherInfo(w) {
	  const bookmarkedStations = JSON.parse(localStorage.getItem('bookmarkedStations') || '[]');
	  const isBookmarked = bookmarkedStations.includes(currentStation.id);
	
	  const filledIcon = `
	    <svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M2.99994 3.5H15.9999L15.9775 20.7094L9.47748 17.2094L2.99994 20.7094V3.5Z" fill="#EEEEEE"/>
			<path fill-rule="evenodd" clip-rule="evenodd" d="M0.53125 2.25L1.8125 0.96875H17.1875L18.4688 2.25V24.9985L9.5 19.6837L0.53125 24.9985V2.25ZM3.09375 3.53125V20.5015L9.5 16.7051L15.9062 20.5015V3.53125H3.09375Z" fill="#EEEEEE"/>
			</svg>

	  `;
	
	  const emptyIcon = `
	    <svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0.53125 2.25L1.8125 0.96875H17.1875L18.4688 2.25V24.9985L9.5 19.6837L0.53125 24.9985V2.25ZM3.09375 3.53125V20.5015L9.5 16.7051L15.9062 20.5015V3.53125H3.09375Z" fill="#EEEEEE"/>
</svg>

	  `;
	
	  infoBox.innerHTML = `
	    <div class="unit-toggle">
	      <div class="unit-labels">
	        <span class="unit ${celsius ? 'active' : ''}" data-unit="c">Celsius</span>
	        <span class="separator">/</span>
	        <span class="unit ${!celsius ? 'active' : ''}" data-unit="f">Fahrenheit</span>
	      </div>
	      <div class="bookmark-icon" role="button">${isBookmarked ? filledIcon : emptyIcon}</div>
	    </div>
	
	    <div class="station-meta">
	      <p><strong>Location:</strong> ${w.name}</p>
	      <p><strong>Weather:</strong> ${w.weather[0].main} – ${w.weather[0].description}</p>
	      <p><strong>Temp:</strong> ${formatTemp(w.main.temp)} / ${formatTemp(w.main.feels_like)}</p>
	      <p><strong>Pressure:</strong> ${w.main.pressure} hPa</p>
	      <p><strong>Humidity:</strong> ${w.main.humidity}%</p>
	    </div>
	  `;
	
	  // Unit switching
	  infoBox.querySelectorAll('.unit').forEach(el => {
	    el.addEventListener('click', () => {
	      const newUnit = el.dataset.unit;
	      celsius = newUnit === 'c';
	      localStorage.setItem('unit', celsius ? 'c' : 'f');
	      renderWeatherInfo(lastWeatherData); // re-render, no spinner
	    });
	  });
	
	  // Bookmark toggle
	  const bookmarkIcon = infoBox.querySelector('.bookmark-icon');
	  bookmarkIcon.addEventListener('click', () => {
	    if (!currentStation) return;
	
	    let bookmarks = JSON.parse(localStorage.getItem('bookmarkedStations') || '[]');
	    const index = bookmarks.indexOf(currentStation.id);
	
	    if (index === -1) {
	      bookmarks.push(currentStation.id);
	    } else {
	      bookmarks.splice(index, 1);
	    }
	
	    localStorage.setItem('bookmarkedStations', JSON.stringify(bookmarks));
	    renderWeatherInfo(lastWeatherData); // update icon
	
	    const myLink = document.querySelector('.my-locations-link');
	    myLink?.style.setProperty('display', bookmarks.length ? 'block' : 'none');
	  });
	}

	
	function showSavedLocations() {
		  const bookmarks = JSON.parse(localStorage.getItem('bookmarkedStations') || '[]');
		  if (!bookmarks.length) return;
		
		  const saved = (stationsList || []).filter(st => bookmarks.includes(st.id));
		
		  let html = `
		    <div class="saved-locations">
		      <div class="unit-toggle">
		        <div class="unit-labels">
		          <span class="unit ${celsius ? 'active' : ''}" data-unit="c">Celsius</span>
		          <span class="separator">/</span>
		          <span class="unit ${!celsius ? 'active' : ''}" data-unit="f">Fahrenheit</span>
		        </div>
				<svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M2.99994 3.5H15.9999L15.9775 20.7094L9.47748 17.2094L2.99994 20.7094V3.5Z" fill="#EEEEEE"/>
			<path fill-rule="evenodd" clip-rule="evenodd" d="M0.53125 2.25L1.8125 0.96875H17.1875L18.4688 2.25V24.9985L9.5 19.6837L0.53125 24.9985V2.25ZM3.09375 3.53125V20.5015L9.5 16.7051L15.9062 20.5015V3.53125H3.09375Z" fill="#EEEEEE"/>
			</svg>

		      </div>
		      <ul class="location-cards">
		  `;
		
		  saved.forEach(station => {
		    let weatherData;
		    try {
		      weatherData = JSON.parse(station.weather || '{}');
		    } catch (e) {
		      return; // skip invalid entries
		    }
		
		    const name = weatherData.name || 'Unknown Station';
		    const condition = weatherData.weather?.[0]?.main || 'N/A';
		    const description = weatherData.weather?.[0]?.description || '';
		    const temp = formatTemp(weatherData.main?.temp || 0);
		    const feels = formatTemp(weatherData.main?.feels_like || 0);
		    const pressure = weatherData.main?.pressure || 'N/A';
		    const humidity = weatherData.main?.humidity || 'N/A';
		
		    html += `
		      <li class="location-card" data-id="${station.id}">
		        <div class="station-meta">
		          <p><strong>Location:</strong> ${name}</p>
		          <p><strong>Weather:</strong> ${condition} – ${description}</p>
		          <p><strong>Temp:</strong> ${temp} / ${feels}</p>
		          <p><strong>Pressure:</strong> ${pressure} hPa</p>
		          <p><strong>Humidity:</strong> ${humidity}%</p>
		        </div>
		      </li>
		    `;
		  });
		
		  html += `</ul></div>`;
		  infoBox.innerHTML = html;
		
		  // Unit toggle logic
		  infoBox.querySelectorAll('.unit').forEach(el => {
		    el.addEventListener('click', () => {
		      const newUnit = el.dataset.unit;
		      celsius = newUnit === 'c';
		      localStorage.setItem('unit', celsius ? 'c' : 'f');
		      showSavedLocations(); // re-render saved list with new units
		    });
		  });
		
		  // Click on saved location
		  infoBox.querySelectorAll('.location-card').forEach(card => {
		    card.addEventListener('click', () => {
		      const id = parseInt(card.dataset.id, 10);
		      const station = stationsList.find(s => s.id === id);
		      if (station) activateStation(station, true);
		    });
		  });
		}

  function findClosestStation(clicked, stations) {
    let closest = null;
    let minDist = Infinity;
    stations.forEach(st => {
      const dist = map.distance(clicked, L.latLng(st.lat, st.lng));
      if (dist < minDist) {
        minDist = dist;
        closest = st;
      }
    });
    return closest;
  }

  function formatTemp(tempC) {
    return celsius
      ? `${tempC.toFixed(1)} °C`
      : `${(tempC * 9/5 + 32).toFixed(1)} °F`;
  }
  sidebar.addEventListener('click', (e) => {
	  const toggle = e.target.closest('.my-locations-toggle');
	  if (toggle) {
	    e.preventDefault();
	    showSavedLocations();
	  }
	});
  
});
