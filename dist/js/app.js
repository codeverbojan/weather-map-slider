document.addEventListener("DOMContentLoaded",()=>{const u=L.map("weather-map").setView([41,21.3],7),s=document.getElementById("weather-sidebar");s.style.transform="translateX(-300px)",s.style.opacity="0",s.style.pointerEvents="none";const b=document.querySelector(".gradient-overlay"),$=document.getElementById("weather-header"),l=document.querySelector(".station-info");let h=null,r=0,m=!1,g=!1,c=localStorage.getItem("unit")!=="f",d=null,f=[];const N=document.querySelector(".sidebar-inner"),y=document.createElement("div");y.className="my-locations-link",y.innerHTML='<a href="#" class="my-locations-toggle">My Locations</a>',N.appendChild(y),JSON.parse(localStorage.getItem("bookmarkedStations")||"[]").map(String).length||(y.style.display="none");let I=0,M=0;window.addEventListener("touchstart",t=>{I=t.changedTouches[0].screenY},{passive:!0}),window.addEventListener("touchend",t=>{M=t.changedTouches[0].screenY,O()},{passive:!0});function O(){if(m)return;const t=I-M;t>50&&r===0?(r=1,T()):t<-50&&r===1&&(r=0,x())}window.addEventListener("wheel",t=>{m||(t.deltaY>0&&r===0?(r=1,T()):t.deltaY<0&&r===1&&(r=0,x()))});function T(){m=!0,$.style.transform="translateY(-100vh)",b.style.opacity="0",setTimeout(()=>{m=!1,(d||h||g)&&(w(),g=!1)},800)}function x(){m=!0,$.style.transform="translateY(0vh)",b.style.opacity="1",s.style.transform="translateX(-300px)",s.style.opacity="0",s.style.pointerEvents="none",setTimeout(()=>{m=!1,g=!0},800)}function w(){s.style.transform="translateX(0)",s.style.opacity="1",s.style.pointerEvents="auto"}u.on("zoomstart dragstart",()=>{s.style.transform="translateX(-300px)",s.style.opacity="0",s.style.pointerEvents="none"}),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors"}).addTo(u),fetch(`${weatherMap.ajaxUrl}?action=load_weather_stations`).then(t=>t.json()).then(({success:t,data:o})=>{if(!(!t||!o)){if(f=o,o.forEach(a=>{L.marker([a.lat,a.lng]).addTo(u).on("click",()=>k(a))}),JSON.parse(localStorage.getItem("bookmarkedStations")||"[]").map(String),location.hash){const a=decodeURIComponent(location.hash.replace("#","")),e=f.find(n=>n.title===a);e&&k(e)}else l.innerHTML=`
	      <div class="station-placeholder">
	        <p><strong>Click on the map to get weather data</strong></p>
	      </div>
	    `,g=!0,r===1&&w();u.on("click",a=>{const e=Y(a.latlng,f);e&&k(e)})}});function k(t,o=!1){const a=s.style.opacity==="0"||s.style.pointerEvents==="none";!o&&d&&d.id===t.id&&!a||(d=t,location.hash=`#${t.title}`,u.setView([t.lat,t.lng],12),U(t.id))}function U(t){l.innerHTML=`
	    <div class="loading-spinner">
	      <div class="spinner"></div>
	      <p>Loading weather data...</p>
	    </div>
	  `,fetch(weatherMap.ajaxUrl,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:"get_weather",station_id:t})}).then(o=>o.json()).then(o=>{if(!o.success){l.innerHTML="Weather data not found";return}h=o.data,S(h),r===1?w():g=!0})}function S(t){const a=JSON.parse(localStorage.getItem("bookmarkedStations")||"[]").includes(d.id),e=`
	    <svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M2.99994 3.5H15.9999L15.9775 20.7094L9.47748 17.2094L2.99994 20.7094V3.5Z" fill="#EEEEEE"/>
			<path fill-rule="evenodd" clip-rule="evenodd" d="M0.53125 2.25L1.8125 0.96875H17.1875L18.4688 2.25V24.9985L9.5 19.6837L0.53125 24.9985V2.25ZM3.09375 3.53125V20.5015L9.5 16.7051L15.9062 20.5015V3.53125H3.09375Z" fill="#EEEEEE"/>
			</svg>

	  `,n=`
	    <svg class="cursor-pointer" width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0.53125 2.25L1.8125 0.96875H17.1875L18.4688 2.25V24.9985L9.5 19.6837L0.53125 24.9985V2.25ZM3.09375 3.53125V20.5015L9.5 16.7051L15.9062 20.5015V3.53125H3.09375Z" fill="#EEEEEE"/>
</svg>

	  `;l.innerHTML=`
	    <div class="unit-toggle">
	      <div class="unit-labels">
	        <span class="unit ${c?"active":""}" data-unit="c">Celsius</span>
	        <span class="separator">/</span>
	        <span class="unit ${c?"":"active"}" data-unit="f">Fahrenheit</span>
	      </div>
	      <div class="bookmark-icon" role="button">${a?e:n}</div>
	    </div>
	
	    <div class="station-meta">
	      <p><strong>Location:</strong> ${t.name}</p>
	      <p><strong>Weather:</strong> ${t.weather[0].main} – ${t.weather[0].description}</p>
	      <p><strong>Temp:</strong> ${E(t.main.temp)} / ${E(t.main.feels_like)}</p>
	      <p><strong>Pressure:</strong> ${t.main.pressure} hPa</p>
	      <p><strong>Humidity:</strong> ${t.main.humidity}%</p>
	    </div>
	  `,l.querySelectorAll(".unit").forEach(i=>{i.addEventListener("click",()=>{c=i.dataset.unit==="c",localStorage.setItem("unit",c?"c":"f"),S(h)})}),l.querySelector(".bookmark-icon").addEventListener("click",()=>{if(!d)return;let i=JSON.parse(localStorage.getItem("bookmarkedStations")||"[]");const v=i.indexOf(d.id);v===-1?i.push(d.id):i.splice(v,1),localStorage.setItem("bookmarkedStations",JSON.stringify(i)),S(h),document.querySelector(".my-locations-link")?.style.setProperty("display",i.length?"block":"none")})}function H(){const t=JSON.parse(localStorage.getItem("bookmarkedStations")||"[]");if(!t.length)return;const o=(f||[]).filter(e=>t.includes(e.id));let a=`
		    <div class="saved-locations">
		      <div class="unit-toggle">
		        <div class="unit-labels">
		          <span class="unit ${c?"active":""}" data-unit="c">Celsius</span>
		          <span class="separator">/</span>
		          <span class="unit ${c?"":"active"}" data-unit="f">Fahrenheit</span>
		        </div>
				<svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M2.99994 3.5H15.9999L15.9775 20.7094L9.47748 17.2094L2.99994 20.7094V3.5Z" fill="#EEEEEE"/>
			<path fill-rule="evenodd" clip-rule="evenodd" d="M0.53125 2.25L1.8125 0.96875H17.1875L18.4688 2.25V24.9985L9.5 19.6837L0.53125 24.9985V2.25ZM3.09375 3.53125V20.5015L9.5 16.7051L15.9062 20.5015V3.53125H3.09375Z" fill="#EEEEEE"/>
			</svg>

		      </div>
		      <ul class="location-cards">
		  `;o.forEach(e=>{let n;try{n=JSON.parse(e.weather||"{}")}catch{return}const p=n.name||"Unknown Station",i=n.weather?.[0]?.main||"N/A",v=n.weather?.[0]?.description||"",V=E(n.main?.temp||0),q=E(n.main?.feels_like||0),C=n.main?.pressure||"N/A",Z=n.main?.humidity||"N/A";a+=`
		      <li class="location-card" data-id="${e.id}">
		        <div class="station-meta">
		          <p><strong>Location:</strong> ${p}</p>
		          <p><strong>Weather:</strong> ${i} – ${v}</p>
		          <p><strong>Temp:</strong> ${V} / ${q}</p>
		          <p><strong>Pressure:</strong> ${C} hPa</p>
		          <p><strong>Humidity:</strong> ${Z}%</p>
		        </div>
		      </li>
		    `}),a+="</ul></div>",l.innerHTML=a,l.querySelectorAll(".unit").forEach(e=>{e.addEventListener("click",()=>{c=e.dataset.unit==="c",localStorage.setItem("unit",c?"c":"f"),H()})}),l.querySelectorAll(".location-card").forEach(e=>{e.addEventListener("click",()=>{const n=parseInt(e.dataset.id,10),p=f.find(i=>i.id===n);p&&k(p,!0)})})}function Y(t,o){let a=null,e=1/0;return o.forEach(n=>{const p=u.distance(t,L.latLng(n.lat,n.lng));p<e&&(e=p,a=n)}),a}function E(t){return c?`${t.toFixed(1)} °C`:`${(t*9/5+32).toFixed(1)} °F`}s.addEventListener("click",t=>{t.target.closest(".my-locations-toggle")&&(t.preventDefault(),H())})});
