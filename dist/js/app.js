document.addEventListener("DOMContentLoaded",()=>{const b=document.getElementById("weather-map");if(!b)return;const p=L.map(b),o=document.getElementById("weather-sidebar");o.style.transform="translateX(-300px)",o.style.opacity="0",o.style.pointerEvents="none";const $=document.querySelector(".gradient-overlay"),I=document.getElementById("weather-header"),c=document.querySelector(".station-info");let h=null,l=0,m=!1,f=!1,d=localStorage.getItem("unit")!=="f",u=null,g=[];const B=document.querySelector(".sidebar-inner"),y=document.createElement("div");y.className="my-locations-link",y.innerHTML='<a href="#" class="my-locations-toggle">My Locations</a>',B.appendChild(y),JSON.parse(localStorage.getItem("bookmarkedStations")||"[]").map(String).length||(y.style.display="none");let x=0,M=0;window.addEventListener("touchstart",t=>{x=t.changedTouches[0].screenY},{passive:!0}),window.addEventListener("touchend",t=>{M=t.changedTouches[0].screenY,O()},{passive:!0});function O(){if(m)return;const t=x-M;t>50&&l===0?(l=1,T()):t<-50&&l===1&&(l=0,H())}window.addEventListener("wheel",t=>{m||(t.deltaY>0&&l===0?(l=1,T()):t.deltaY<0&&l===1&&(l=0,H()))});function T(){m=!0,I.style.transform="translateY(-100vh)",$.style.opacity="0",setTimeout(()=>{m=!1,(u||h||f)&&(w(),f=!1)},800)}function H(){m=!0,I.style.transform="translateY(0vh)",$.style.opacity="1",o.style.transform="translateX(-300px)",o.style.opacity="0",o.style.pointerEvents="none",setTimeout(()=>{m=!1,f=!0},800)}function w(){o.style.transform="translateX(0)",o.style.opacity="1",o.style.pointerEvents="auto"}p.on("zoomstart dragstart",()=>{o.style.transform="translateX(-300px)",o.style.opacity="0",o.style.pointerEvents="none"}),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors"}).addTo(p),fetch(`${weatherMap.ajaxUrl}?action=load_weather_stations`).then(t=>t.json()).then(({success:t,data:a})=>{if(!t||!a)return;g=a;const s=L.latLngBounds([]);if(a.forEach(n=>{const e=[n.lat,n.lng],i=L.marker(e,{icon:L.divIcon({className:"weather-marker",html:'<div class="marker-dot"></div>',iconSize:[20,20],iconAnchor:[10,10]})}).addTo(p);s.extend(e),i.on("click",()=>E(n))}),a.length>0?p.fitBounds(s,{padding:[30,30],maxZoom:10}):p.setView([41,21.3],7),location.hash){const n=decodeURIComponent(location.hash.replace("#","")),e=g.find(i=>i.title===n);e&&E(e)}else c.innerHTML=`
	      <div class="station-placeholder">
	        <p><strong>Click on the map to get weather data</strong></p>
	      </div>
	    `,f=!0,l===1&&w();p.on("click",n=>{const e=U(n.latlng,g);e&&E(e)})}).catch(t=>{console.error("Failed to load weather stations:",t)});function E(t,a=!1){const s=o.style.opacity==="0"||o.style.pointerEvents==="none";!a&&u&&u.id===t.id&&!s||(u=t,location.hash=`#${t.title}`,p.setView([t.lat,t.lng],12),C(t.id))}function C(t){c.innerHTML=`
	    <div class="loading-spinner">
	      <div class="spinner"></div>
	      <p>Loading weather data...</p>
	    </div>
	  `,fetch(weatherMap.ajaxUrl,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:"get_weather",station_id:t})}).then(a=>a.json()).then(a=>{if(!a.success){c.innerHTML="Weather data not found";return}h=a.data,S(h),l===1?w():f=!0})}function S(t){const s=JSON.parse(localStorage.getItem("bookmarkedStations")||"[]").includes(u.id),n=`
	    <svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M2.99994 3.5H15.9999L15.9775 20.7094L9.47748 17.2094L2.99994 20.7094V3.5Z" fill="#EEEEEE"/>
			<path fill-rule="evenodd" clip-rule="evenodd" d="M0.53125 2.25L1.8125 0.96875H17.1875L18.4688 2.25V24.9985L9.5 19.6837L0.53125 24.9985V2.25ZM3.09375 3.53125V20.5015L9.5 16.7051L15.9062 20.5015V3.53125H3.09375Z" fill="#EEEEEE"/>
			</svg>

	  `,e=`
	    <svg class="cursor-pointer" width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0.53125 2.25L1.8125 0.96875H17.1875L18.4688 2.25V24.9985L9.5 19.6837L0.53125 24.9985V2.25ZM3.09375 3.53125V20.5015L9.5 16.7051L15.9062 20.5015V3.53125H3.09375Z" fill="#EEEEEE"/>
</svg>

	  `;c.innerHTML=`
	    <div class="unit-toggle">
	      <div class="unit-labels">
	        <span class="unit ${d?"active":""}" data-unit="c">Celsius</span>
	        <span class="separator">/</span>
	        <span class="unit ${d?"":"active"}" data-unit="f">Fahrenheit</span>
	      </div>
	      <div class="bookmark-icon" role="button">${s?n:e}</div>
	    </div>
	
	    <div class="station-meta">
	      <p><strong>Location:</strong> ${t.name}</p>
	      <p><strong>Weather:</strong> ${t.weather[0].main} – ${t.weather[0].description}</p>
	      <p><strong>Temp:</strong> ${k(t.main.temp)} / ${k(t.main.feels_like)}</p>
	      <p><strong>Pressure:</strong> ${t.main.pressure} hPa</p>
	      <p><strong>Humidity:</strong> ${t.main.humidity}%</p>
	    </div>
	  `,c.querySelectorAll(".unit").forEach(r=>{r.addEventListener("click",()=>{d=r.dataset.unit==="c",localStorage.setItem("unit",d?"c":"f"),S(h)})}),c.querySelector(".bookmark-icon").addEventListener("click",()=>{if(!u)return;let r=JSON.parse(localStorage.getItem("bookmarkedStations")||"[]");const v=r.indexOf(u.id);v===-1?r.push(u.id):r.splice(v,1),localStorage.setItem("bookmarkedStations",JSON.stringify(r)),S(h),document.querySelector(".my-locations-link")?.style.setProperty("display",r.length?"block":"none")})}function V(){const t=JSON.parse(localStorage.getItem("bookmarkedStations")||"[]");if(!t.length)return;const a=(g||[]).filter(n=>t.includes(n.id));let s=`
		    <div class="saved-locations">
		      <div class="unit-toggle">
		        <div class="unit-labels">
		          <span class="unit ${d?"active":""}" data-unit="c">Celsius</span>
		          <span class="separator">/</span>
		          <span class="unit ${d?"":"active"}" data-unit="f">Fahrenheit</span>
		        </div>
				<svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M2.99994 3.5H15.9999L15.9775 20.7094L9.47748 17.2094L2.99994 20.7094V3.5Z" fill="#EEEEEE"/>
			<path fill-rule="evenodd" clip-rule="evenodd" d="M0.53125 2.25L1.8125 0.96875H17.1875L18.4688 2.25V24.9985L9.5 19.6837L0.53125 24.9985V2.25ZM3.09375 3.53125V20.5015L9.5 16.7051L15.9062 20.5015V3.53125H3.09375Z" fill="#EEEEEE"/>
			</svg>

		      </div>
		      <ul class="location-cards">
		  `;a.forEach(n=>{let e;try{e=JSON.parse(n.weather||"{}")}catch{return}if(!e.main||!e.weather)return;const i=e.name||"Unknown Station",r=e.weather?.[0]?.main||"N/A",v=e.weather?.[0]?.description||"",N=k(e.main?.temp||0),Y=k(e.main?.feels_like||0),Z=e.main?.pressure||"N/A",q=e.main?.humidity||"N/A";s+=`
		      <li class="location-card" data-id="${n.id}">
		        <div class="station-meta">
		          <p><strong>Location:</strong> ${i}</p>
		          <p><strong>Weather:</strong> ${r} – ${v}</p>
		          <p><strong>Temp:</strong> ${N} / ${Y}</p>
		          <p><strong>Pressure:</strong> ${Z} hPa</p>
		          <p><strong>Humidity:</strong> ${q}%</p>
		        </div>
		      </li>
		    `}),s+="</ul></div>",c.innerHTML=s,c.querySelectorAll(".unit").forEach(n=>{n.addEventListener("click",()=>{d=n.dataset.unit==="c",localStorage.setItem("unit",d?"c":"f"),V()})}),c.querySelectorAll(".location-card").forEach(n=>{n.addEventListener("click",()=>{const e=parseInt(n.dataset.id,10),i=g.find(r=>r.id===e);i&&E(i,!0)})})}function U(t,a){let s=null,n=1/0;return a.forEach(e=>{const i=p.distance(t,L.latLng(e.lat,e.lng));i<n&&(n=i,s=e)}),s}function k(t){return d?`${t.toFixed(1)} °C`:`${(t*9/5+32).toFixed(1)} °F`}o.addEventListener("click",t=>{t.target.closest(".my-locations-toggle")&&(t.preventDefault(),V())})});
