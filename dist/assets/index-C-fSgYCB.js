(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){window.history.pushState({},``,e),window.scrollTo({top:0,behavior:`instant`}),window.dispatchEvent(new PopStateEvent(`popstate`))}async function t(){let e=document.getElementById(`app`);if(e){if(typeof window.route==`function`){await window.route();return}e.innerHTML=`<div style="padding:2rem; text-align:center;">Loading Core Platform...</div>`}}function n(){window.removeEventListener(`popstate`,t),window.addEventListener(`popstate`,t),document.removeEventListener(`click`,r),document.addEventListener(`click`,r),document.readyState===`complete`||document.readyState===`interactive`?t():window.addEventListener(`DOMContentLoaded`,t)}function r(t){let n=t.target.closest(`a[data-link], a[href^="/"]`);if(n){let r=n.getAttribute(`href`);(r===`/`||r===``)&&(window.currentQuery!==void 0&&(window.currentQuery=null),window.currentCategory!==void 0&&(window.currentCategory=`trending`),window.currentGenreId!==void 0&&(window.currentGenreId=null)),t.preventDefault(),e(r)}}window.navigateTo=e,window.resolveRoute=t;var i=`https://image.tmdb.org/t/p`,a=async(e,t={})=>{let n=new URL(`/api/tmdb`,window.location.origin);n.searchParams.append(`endpoint`,e),Object.entries(t).forEach(([e,t])=>{t!=null&&n.searchParams.append(e,t)});let r=await fetch(n);if(!r.ok){let e=await r.json().catch(()=>({}));throw Error(e.error||`API Error dengan status ${r.status}`)}return r.json()},o=(e=1)=>a(`/trending/all/day`,{page:e}),s=(e,t=1)=>a(`/movie/${e}`,{page:t}),c=(e,t=1)=>a(`/tv/${e}`,{page:t}),l=(e,t,n=1)=>a(`/discover/${e}`,{with_genres:t,page:n}),u=(e,t=1)=>a(`/search/multi`,{query:e,page:t}),d=(e,t=`w500`)=>e?`${i}/${t}${e}`:`/assets/no-poster.svg`;function f(e){return e.toLowerCase().replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`)}var p=`https://fundingfashioned.com/scjyw84ha?key=d0124eab1e4868478095f8e9846619f5`;function m(){sessionStorage.getItem(`popunder_triggered`)!==`true`&&window.addEventListener(`click`,function e(){let t=document.createElement(`script`);t.src=`https://fundingfashioned.com/e8/6d/fb/e86dfb1927e7f50aa6adf7367c930be1.js`,document.body.appendChild(t),sessionStorage.setItem(`popunder_triggered`,`true`),console.log(`Popunder triggered on first click`),window.removeEventListener(`click`,e)},{once:!0})}var h=new Set;function g(e){let t=`${e}`;return h.has(t)||h.add(t),p}var _=1,v=!1,y=`all`,b=`trending`,x=null,S=null,C=null,w=[],T=[];document.getElementById(`app`);async function E(){let e=sessionStorage.getItem(`movieGenres`),t=sessionStorage.getItem(`tvGenres`);if(e&&t){w=JSON.parse(e),T=JSON.parse(t);return}try{let[e,t]=await Promise.all([a(`/genre/movie/list`),a(`/genre/tv/list`)]);w=e.genres||[],T=t.genres||[],sessionStorage.setItem(`movieGenres`,JSON.stringify(w)),sessionStorage.setItem(`tvGenres`,JSON.stringify(T))}catch(e){console.error(`Gagal memuat genre:`,e)}}function D(){let e=document.createElement(`div`);return e.className=`card skeleton-card`,e.innerHTML=`
    <div style="width:100%; aspect-ratio:2/3; background: #2a2a2a; border-radius: 8px;"></div>
    <div style="padding:0.5rem;">
      <div style="height:12px; background:#2a2a2a; margin-bottom:0.5rem; border-radius:4px;"></div>
      <div style="height:10px; background:#2a2a2a; width:60%; border-radius:4px;"></div>
    </div>
  `,e}function O(e,t=18){e.innerHTML=``;for(let n=0;n<t;n++)e.appendChild(D())}function k(e){let t=e.media_type||(e.first_air_date?`tv`:`movie`),n=e.title||e.name,r=(e.release_date||e.first_air_date||``).slice(0,4),i=e.vote_average?.toFixed(1)||`N/A`,a=document.createElement(`div`);return a.className=`card`,a.innerHTML=`
    <img src="${d(e.poster_path)}" alt="Watch ${n} ${r} free online" loading="lazy">
    <div class="card-info">
      <div class="card-title">${n}</div>
      <div>${r} | ★ ${i}</div>
    </div>
  `,a.onclick=()=>navigateTo(`/detail/${t}/${e.id}`),a}function A(e,t,n,r,i,a){let o=document.querySelector(`meta[name="description"]`)||document.createElement(`meta`);o.parentNode||(o.name=`description`,document.head.appendChild(o));let s=n.length>120?n.substring(0,120)+`...`:n;o.setAttribute(`content`,`Watch ${e} (${t}) free online. ${s} Rating: ${r}/10. Director: ${i}. Cast: ${a.substring(0,100)}. Stream now on CINEVORA!`);let c=document.querySelector(`meta[property="og:description"]`)||document.createElement(`meta`);c.parentNode||(c.setAttribute(`property`,`og:description`),document.head.appendChild(c)),c.setAttribute(`content`,`Watch ${e} (${t}) free online. ${s}`);let l=document.querySelector(`meta[property="og:title"]`)||document.createElement(`meta`);l.parentNode||(l.setAttribute(`property`,`og:title`),document.head.appendChild(l)),l.setAttribute(`content`,`${e} (${t}) - CINEVORA`)}function j(){if(document.getElementById(`backToTop`))return;let e=document.createElement(`button`);e.id=`backToTop`,e.innerHTML=`<i class="fas fa-arrow-up"></i>`,e.style.cssText=`
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #e50914;
    color: white;
    border: none;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    cursor: pointer;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 1.2rem;
  `,window.addEventListener(`scroll`,()=>{e.style.opacity=window.scrollY>300?`1`:`0`}),e.onclick=()=>{window.scrollTo({top:0,behavior:`smooth`})},document.body.appendChild(e)}async function M(){await E();let e=[{name:`Popular`,slug:`popular`},{name:`Now Playing`,slug:`now_playing`},{name:`Upcoming`,slug:`upcoming`},{name:`Top Rated`,slug:`top_rated`}],t=[{name:`Popular`,slug:`popular`},{name:`Airing Today`,slug:`airing_today`},{name:`On TV`,slug:`on_the_air`},{name:`Top Rated`,slug:`top_rated`}],n=w.map(e=>`<a href="/discover/movie?genre=${e.id}&name=${encodeURIComponent(e.name)}" class="dropdown-item" data-link style="text-decoration: none !important; border:none;">${e.name}</a>`).join(``),r=T.map(e=>`<a href="/discover/tv?genre=${e.id}&name=${encodeURIComponent(e.name)}" class="dropdown-item" data-link style="text-decoration: none !important; border:none;">${e.name}</a>`).join(``);return`
    <div class="navbar">
      <a href="/about" class="logo" data-link style="text-decoration: none !important;">CINEVORA</a>
      
      <div class="nav-links">
        <a href="/" class="nav-item" data-link style="text-decoration: none !important;">Home</a>
        
        <div class="nav-item dropdown">
          Movies <i class="fas fa-chevron-down"></i>
          <div class="dropdown-content" style="display: flex; flex-direction: column; gap: 1.2rem; padding: 1.2rem; width: max-content; min-width: 650px;">
            
            <div class="dropdown-group">
              <div class="dropdown-label">Category</div>
              <div style="display: flex; gap: 1.2rem; flex-wrap: wrap;">
                ${e.map(e=>`<a href="/movie/category/${e.slug}" class="dropdown-item" data-link style="text-decoration: none !important; padding: 0.2rem 0;">${e.name}</a>`).join(``)}
              </div>
            </div>
            
            <div class="dropdown-group">
              <div class="dropdown-label">Genre</div>
              <div class="genre-scroll" style="display: grid; grid-template-columns: repeat(5, minmax(110px, 1fr)); gap: 0.4rem 0.6rem;">
                ${n}
              </div>
            </div>
            
          </div>
        </div>
        
        <div class="nav-item dropdown">
          TV Shows <i class="fas fa-chevron-down"></i>
          <div class="dropdown-content" style="display: flex; flex-direction: column; gap: 1.2rem; padding: 1.2rem; width: max-content; min-width: 650px;">
            
            <div class="dropdown-group">
              <div class="dropdown-label">Category</div>
              <div style="display: flex; gap: 1.2rem; flex-wrap: wrap;">
                ${t.map(e=>`<a href="/tv/category/${e.slug}" class="dropdown-item" data-link style="text-decoration: none !important; padding: 0.2rem 0;">${e.name}</a>`).join(``)}
              </div>
            </div>
            
            <div class="dropdown-group">
              <div class="dropdown-label">Genre</div>
              <div class="genre-scroll" style="display: grid; grid-template-columns: repeat(5, minmax(110px, 1fr)); gap: 0.4rem 0.6rem;">
                ${r}
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search Movies / TV Shows...">
        <button id="searchBtn"><i class="fas fa-search"></i></button>
      </div>
    </div>
  `}async function N(e,t=!1){if(!v){v=!0,t||O(e);try{let n,r=``;C?(n=await u(C,_),r=`Search results for "${C}"`):x&&y!==`all`?(n=await l(y,x,_),r=`${y===`movie`?`Movies`:`TV Shows`} in ${S}`):b!==`trending`&&y!==`all`?(n=y===`movie`?await s(b,_):await c(b,_),r=`${y===`movie`?`Movies`:`TV Shows`} - ${b.replace(/_/g,` `).toUpperCase()}`):(n=await o(_),r=`Trending Today`);let i=n.results.filter(e=>e.media_type!==`person`),a=e.parentElement.querySelector(`.page-title`);a||(a=document.createElement(`h2`),a.className=`page-title`,e.parentElement.insertBefore(a,e)),a.textContent=r,a.style.textAlign=`center`,t||(e.innerHTML=``),i.forEach(t=>{let n=k(t),r=t.media_type||y||`movie`,i=f(t.title||t.name);n.onclick=e=>{e.preventDefault(),navigateTo(`/${r}/${i}-${t.id}`)},e.appendChild(n)});let d=e.parentElement.querySelector(`.load-more`);if(d&&d.remove(),_<n.total_pages&&i.length>0){let t=document.createElement(`div`);t.className=`load-more`;let n=document.createElement(`button`);n.textContent=`Load More`,n.onclick=async()=>{_++,await N(e,!0)},t.appendChild(n),e.parentElement.appendChild(t)}i.length===0&&!t&&(e.innerHTML=`<div style="padding:2rem; text-align:center;">No results found</div>`)}catch(n){console.error(`Error rendering content:`,n),t||(e.innerHTML=`<div style="padding:2rem; text-align:center;">Error loading data. Please check your connection.</div>`)}finally{v=!1}}}async function P(){let e=document.createElement(`div`);e.className=`home-page-container`;let t=document.createElement(`div`);t.className=`movie-grid`,e.appendChild(t);let n=window.location.pathname,r=new URLSearchParams(window.location.search);if(C=r.get(`query`)||C||null,x=r.get(`genre`)||null,S=r.get(`name`)||null,C?b=null:(b=`trending`,y=`all`),_=1,n.includes(`/category/`)){let e=n.split(`/`);e.length>=4&&(y=e[1],b=e[3],C=null)}else if(n.includes(`/discover/`)){let e=n.split(`/`);e.length>=3&&(y=e[2],C=null)}t.innerHTML=`<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #aaa;">Loading movie database...</div>`;try{await N(t)}catch(e){console.error(`🔴 Deteksi Error di dalam loadContent:`,e),t.innerHTML=`
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="color: #e50914; font-weight: bold; margin-bottom: 1rem;">Failed to load movie stream list.</p>
        <button onclick="window.location.reload()" style="background: #e50914; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Retry Connection</button>
      </div>
    `}return e}async function F(){j();let e=document.createElement(`div`);return e.style.maxWidth=`1000px`,e.style.margin=`2rem auto`,e.style.padding=`2rem`,e.style.background=`#0f0f0f`,e.style.borderRadius=`16px`,e.style.lineHeight=`1.6`,e.style.textAlign=`justify`,e.innerHTML=`
    <div style="text-align: center; margin-bottom: 2rem;">
      <h1 style="color: #e50914; font-size: 2.5rem;">About CINEVORA</h1>
      <p style="color: #aaa;">Your Ultimate Destination for Free Online Streaming</p>
    </div>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Welcome to CINEVORA</h2>
    <p>CINEVORA is a revolutionary free streaming platform that brings the magic of cinema directly to your screen. Founded in 2024, we have quickly established ourselves as one of the most trusted and user-friendly destinations for watching movies and TV shows online without any subscription fees or hidden costs.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Our Mission</h2>
    <p>At CINEVORA, we believe that great entertainment should be accessible to everyone, regardless of their budget or geographic location. Our mission is to democratize access to quality content by providing a seamless, ad-supported streaming experience that rivals premium platforms. We work tirelessly to ensure our library is constantly updated with the latest releases, timeless classics, and hidden gems from around the world.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">What Makes CINEVORA Different?</h2>
    <p>Unlike traditional streaming services that require monthly subscriptions, credit cards, and lengthy commitments, CINEVORA offers completely free access to thousands of movies and TV episodes. Our platform is designed with the user experience in mind - intuitive navigation, lightning-fast search, and multiple streaming options ensure you never miss a moment of your favorite content.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Our Content Library</h2>
    <p>CINEVORA aggregates content from the world's most comprehensive movie database, TMDB (The Movie Database). This partnership allows us to offer an extensive catalog spanning every genre imaginable - from heart-pounding action thrillers and laugh-out-loud comedies to thought-provoking documentaries and edge-of-your-seat horror films. Our TV show collection includes popular series, critically acclaimed dramas, reality shows, anime, and children's programming.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">How CINEVORA Works</h2>
    <p>Using CINEVORA is incredibly simple. Browse our homepage to discover trending content, use the search bar to find specific titles, or explore our dropdown menus to filter movies and TV shows by category (Popular, Now Playing, Upcoming, Top Rated) or by genre (Action, Comedy, Drama, Horror, Romance, Sci-Fi, Thriller, and more). Click on any poster to access detailed information including plot summaries, cast lists, directors, ratings, runtime, and release dates.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Streaming Quality & Options</h2>
    <p>CINEVORA provides multiple streaming sources to ensure reliable playback in HD quality. Our platform integrates with trusted external players that deliver smooth, buffer-free viewing experiences. Whether you're watching on a desktop computer, laptop, tablet, or smartphone, our responsive design automatically adapts to your screen size for optimal viewing.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">No Account Required</h2>
    <p>One of CINEVORA's core principles is privacy. Unlike other platforms that demand personal information, email addresses, or payment details, CINEVORA allows you to start watching immediately with zero commitment. We don't track your viewing history, we don't sell your data, and we never ask for unnecessary permissions. Your privacy is completely respected.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Daily Updates</h2>
    <p>Our team works around the clock to ensure CINEVORA's content library stays current. New movies and TV episodes are added daily, with trending titles prominently featured on our homepage. We monitor TMDB's real-time updates to bring you the most popular and talked-about content as soon as it becomes available.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Legal Compliance</h2>
    <p>CINEVORA operates as a streaming aggregator. We do not host any video files on our servers. All content accessed through our platform is sourced from external third-party streaming providers. We respect intellectual property rights and copyright laws, and we encourage users to support official releases whenever possible. CINEVORA provides convenience and accessibility while acknowledging the importance of creative industries.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Technical Requirements</h2>
    <p>To enjoy the best streaming experience on CINEVORA, we recommend a stable internet connection of at least 5 Mbps for standard definition and 10 Mbps for HD quality. Our platform works on all modern browsers including Chrome, Firefox, Safari, and Edge. JavaScript must be enabled for full functionality. CINEVORA is also compatible with smart TVs and gaming consoles through their built-in web browsers.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Popular Genres on CINEVORA</h2>
    <p>Action enthusiasts will find blockbuster franchises, superhero epics, and martial arts classics. Comedy lovers can explore everything from slapstick to sophisticated satire. Drama seekers will discover emotionally powerful narratives and award-winning performances. Horror fans can enjoy psychological thrillers, supernatural tales, and slasher classics. Sci-Fi viewers can journey through futuristic worlds and mind-bending concepts. Romance audiences will find heartwarming love stories and passionate dramas.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">International Content</h2>
    <p>CINEVORA proudly offers content from around the globe. Explore Korean dramas, Japanese anime, Bollywood musicals, European art films, Latin American telenovelas, and African cinema. Our platform celebrates diversity and brings the best of international storytelling to a worldwide audience.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Family-Friendly Options</h2>
    <p>Parents can find extensive children's programming on CINEVORA, including animated features, educational content, and family-friendly adventures. While we do not offer explicit content filtering, our search and categorization system helps families discover appropriate entertainment for viewers of all ages.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Frequently Asked Questions</h2>
    <p><strong>Is CINEVORA really free?</strong> Yes! CINEVORA is completely free with no hidden fees or premium tiers. We generate revenue through advertising partnerships that allow us to maintain and improve our service.</p>
    <p><strong>Do I need to create an account?</strong> No account is required. Simply visit our website and start watching immediately.</p>
    <p><strong>How often is content updated?</strong> Our library is updated daily with new movies and TV episodes as they become available from our content partners.</p>
    <p><strong>Can I request specific movies or shows?</strong> While we don't accept individual requests, we continuously expand our catalog based on popularity and availability.</p>
    <p><strong>Why am I seeing ads?</strong> Advertising revenue allows CINEVORA to remain free for all users. Our ads are non-intrusive and help support the platform's operational costs.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Contact Information</h2>
    <p>Have questions, suggestions, or copyright concerns? Our support team is available 24/7 to assist you. Reach out to us at <strong style="color: #e50914;">support@CINEVORA.com</strong> and we'll respond within 24 hours. We value your feedback and are committed to making CINEVORA the best free streaming platform available.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Future Development</h2>
    <p>CINEVORA is constantly evolving. Our development roadmap includes user watchlists, personalized recommendations based on viewing history (optional, privacy-focused), social sharing features, mobile apps for iOS and Android, and integration with additional streaming sources. We're also exploring watch party features that would allow friends to watch together remotely.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Join Our Community</h2>
    <p>Follow CINEVORA on social media for updates on new content, platform improvements, and exclusive features. Connect with fellow movie lovers, share recommendations, and discover hidden gems through our growing community of entertainment enthusiasts.</p>
    
    <div style="background: #1a1a1a; padding: 1.5rem; border-radius: 12px; margin-top: 2rem; text-align: center;">
      <p style="font-size: 1.2rem;"><strong>CINEVORA - Your Gateway to Unlimited Entertainment</strong></p>
      <p style="color: #666; margin-top: 0.5rem;">© 2026 CINEVORA. All rights reserved. | Powered by TMDB API</p>
    </div>
  `,e}function I(e,t){let n=document.createElement(`div`);n.className=`detail-container`,n.innerHTML=`
    <div style="padding: 2rem; text-align: center; color: #aaa;">
      <div class="skeleton-card" style="width: 50px; height: 20px; background: #222; margin-bottom: 2rem; border-radius:4px;"></div>
      <div style="display: flex; gap: 2rem; flex-wrap: wrap; justify-content: center;">
        <div class="skeleton-card" style="width: 280px; height: 420px; background: #222; border-radius: 12px;"></div>
        <div style="flex: 1; max-width: 600px; text-align: left;">
          <div class="skeleton-card" style="width: 80%; height: 35px; background: #222; margin-bottom: 1rem; border-radius:4px;"></div>
          <div class="skeleton-card" style="width: 40%; height: 20px; background: #222; margin-bottom: 2rem; border-radius:4px;"></div>
          <div class="skeleton-card" style="width: 100%; height: 100px; background: #222; border-radius:4px;"></div>
        </div>
      </div>
    </div>
  `;async function r(){try{let[r,i]=await Promise.all([a(`/${e}/${t}`),a(`/${e}/${t}/credits`)]),o=i.crew?.find(e=>e.job===`Director`)?.name||`N/A`;i.crew?.find(e=>e.job===`Writer`)?.name;let s=i.cast?.slice(0,8).map(e=>e.name).join(`, `)||`N/A`,c=r.title||r.name,l=(r.release_date||r.first_air_date||``).slice(0,4),u=r.vote_average?.toFixed(1)||`N/A`,p=e===`movie`?r.runtime?`${r.runtime} min`:`N/A`:r.number_of_seasons?`${r.number_of_seasons} seasons`:`N/A`,m=r.release_date||r.first_air_date||`Unknown`,h=r.genres?.map(e=>e.name).join(`, `)||`N/A`,_=r.overview||`No description available.`,v=`${e}-${t}`;typeof A==`function`&&A(c,l,_,u,o,s),n.innerHTML=`
        <div style="margin-bottom: 1rem; font-size: 0.8rem;">
          <a href="/" data-link style="color: #e50914; text-decoration: none;">Home</a> > <span style="color: #aaa;">${c}</span>
        </div>
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back</button>
        </div>
        <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
          <img src="${d(r.poster_path,`w342`)}" alt="Watch ${c} online" style="width: 280px; border-radius: 12px; background: #222;">
          <div style="flex: 1; text-align: justify;">
            <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">${c} <span style="font-size: 1.2rem; color: #aaa;">(${l})</span></h1>
            <div style="display: flex; gap: 1rem; margin: 1rem 0; color: #ccc;">
              <span>⭐ ${u}/10</span> <span>⏱️ ${p}</span> <span>📅 ${m}</span>
            </div>
            <div style="margin: 1rem 0;"><strong>Genres:</strong> ${h}</div>
            <div style="margin: 1rem 0;"><strong>Plot:</strong> ${_}</div>
            <div style="margin: 1rem 0;"><strong>Director:</strong> ${o}</div>
            <div style="margin: 1rem 0;"><strong>Cast:</strong> ${s}</div>
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
              <button class="trailer-btn" style="background: #e50914; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">▶ Watch Trailer</button>
              <a id="watchNowLink" href="#" style="background: #333; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; text-decoration: none; font-weight: bold;">🎬 Watch Now</a>
            </div>
          </div>
        </div>
        <div id="lazyRecommendations" style="margin-top: 3rem; border-top: 1px solid #333; padding-top: 2rem;">
          <p style="color: #666;">Loading suggestions...</p>
        </div>
      `,n.querySelector(`.back-btn`).onclick=()=>window.history.back(),n.querySelector(`.trailer-btn`).onclick=()=>navigateTo(`/trailer/${e}/${t}`);let y=n.querySelector(`#watchNowLink`);y&&(y.onclick=n=>{n.preventDefault(),typeof g==`function`&&window.open(g(v,c),`_blank`),setTimeout(()=>navigateTo(`/stream/${e}/${t}`),150)}),a(`/${e}/${t}/recommendations`).then(t=>{let r=n.querySelector(`#lazyRecommendations`);t.results&&t.results.length>0&&r?(r.innerHTML=`
            <h3 style="color: #e50914; margin-bottom: 1rem;">You May Also Like</h3>
            <div style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem;">${t.results.slice(0,6).map(t=>{let n=f(t.title||t.name);return`
              <div class="related-card" data-href="/${t.media_type||e}/${n}-${t.id}" style="cursor: pointer; text-align: center; width: 120px;">
                <img src="${d(t.poster_path,`w185`)}" style="width: 100%; border-radius: 8px; margin-bottom: 0.5rem; background: #222;">
                <div style="font-size: 0.7rem; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${t.title||t.name}</div>
              </div>
            `}).join(``)}</div>
          `,r.querySelectorAll(`.related-card`).forEach(e=>{e.onclick=()=>navigateTo(e.getAttribute(`data-href`))})):r&&r.remove()})}catch(e){console.error(e),n.innerHTML=`<div style="padding:2rem; text-align:center;">Error loading details.</div>`}}return r(),n}async function L(e,t){let n=document.createElement(`div`);n.className=`detail-container`,n.innerHTML=`<div style="padding:2rem; text-align:center;">Loading trailer...</div>`;try{let r=await a(`/${e}/${t}/videos`),i=r.results?.find(e=>e.type===`Trailer`&&e.site===`YouTube`)||r.results?.[0];i?.key?n.innerHTML=`
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
        </div>
        <h2 style="margin-bottom: 1rem; text-align:center;">Official Trailer</h2>
        <div style="position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden;">
  <iframe 
    src="https://www.youtube.com/embed/${i.key}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
    allowfullscreen
    loading="lazy"> </iframe>
</div>
      `:n.innerHTML=`
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
        </div>
        <div style="padding:2rem; text-align:center;">No trailer available for this title</div>
      `;let o=n.querySelector(`.back-btn`);o&&(o.onclick=()=>window.history.back())}catch(e){console.error(e),n.innerHTML=`<div style="padding:2rem; text-align:center;">Error loading trailer</div>`}return n}async function R(e,t){let n=document.createElement(`div`);n.className=`detail-container`,n.innerHTML=`
    <div style="margin-bottom: 1rem;">
      <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
    </div>
    <h2 style="text-align: center; margin-bottom: 2rem;">Streaming Options</h2>
    <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem;">
      <a id="stream1Link" href="#" class="stream-link" data-stream="1" style="background: #e50914; padding: 1rem 2rem; border-radius: 8px; color: white; text-decoration: none; font-weight: bold; transition: transform 0.2s;">▶️ Stream 1</a>
      <a id="stream2Link" href="#" class="stream-link" data-stream="2" style="background: #e50914; padding: 1rem 2rem; border-radius: 8px; color: white; text-decoration: none; font-weight: bold; transition: transform 0.2s;">▶️ Stream 2</a>
    </div>
    <div id="streamPlayer" style="position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden; display: none;">
      <iframe id="streamIframe" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="fullscreen" allowfullscreen></iframe>
    </div>
    <p style="text-align: center; margin-top: 2rem; font-weight: 500;">
      <span style="color: #ffaa00;">🎞️</span> <span style="color: white;">Watch Movie Select Stream 1 or Stream 2</span> <span style="color: #ffaa00;">🎞️</span>
    </p>
  `;let r=n.querySelector(`.back-btn`);r&&(r.onclick=()=>window.history.back());let i=n.querySelector(`#stream1Link`),a=n.querySelector(`#stream2Link`),o=n.querySelector(`#streamPlayer`),s=n.querySelector(`#streamIframe`);return i&&(i.onclick=n=>{n.preventDefault(),o.style.display=`block`,s.src=`https://vidsrc.me/embed/${e}/${t}`,i.style.opacity=`0.7`,a&&(a.style.opacity=`1`)}),a&&(a.onclick=n=>{n.preventDefault(),o.style.display=`block`,s.src=`https://vidsrc.to/embed/${e}/${t}`,a.style.opacity=`0.7`,i&&(i.style.opacity=`1`)}),n}function z(){let e=document.createElement(`footer`);return e.className=`footer`,e.innerHTML=`
    <div class="footer-content">
      <div class="footer-section">
        <h3>CINEVORA</h3>
        <p>Free streaming platform for movies and TV shows.</p>
      </div>
      <div class="footer-section">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="/" data-link>Home</a></li>
          <li><a href="/about" data-link>About Us</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4>Follow Us</h4>
        <div class="social-links">
          <a href="#"><i class="fab fa-facebook"></i></a>
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
        </div>
        <p>Powered by TMDB API</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 CINEVORA. All rights reserved.</p>
    </div>
  `,e}function B(){let e=document.getElementById(`searchBtn`),t=document.getElementById(`searchInput`),n=e=>{e&&(C!==void 0&&(C=e),y!==void 0&&(y=`all`),b!==void 0&&(b=null),x!==void 0&&(x=null),S!==void 0&&(S=null),_!==void 0&&(_=1),navigateTo(`/?query=${encodeURIComponent(e)}`))};e&&t&&(e.onclick=()=>n(t.value.trim()),t.onkeypress=e=>{e.key===`Enter`&&n(e.target.value.trim())},C!==void 0&&C&&(t.value=C))}async function V(){let e=window.location.pathname,t=document.getElementById(`app`);if(!t)return;t.innerHTML=``;let n=await M();if(typeof n==`string`){let e=document.createElement(`div`);e.innerHTML=n,n=e.firstElementChild||e}n&&n instanceof Node?t.appendChild(n):console.warn(`Peringatan: renderNavbar() tidak mengembalikan Node yang valid.`);let r=document.createElement(`main`);r.id=`main-content`,t.appendChild(r);let i=null;if(e===`/`||e===``)i=await P();else if(e===`/about`||e===`/about/`)i=await F();else if(e.startsWith(`/movie/`)||e.startsWith(`/tv/`)){let t=e.split(`/`).filter(Boolean),n=t[0],r=(t[1]||``).match(/-(\d+)$/),a=r?r[1]:null;i=a?I(n,a):await P()}else if(e.startsWith(`/trailer/`)){let t=e.split(`/`);i=await L(t[2],t[3])}else if(e.startsWith(`/stream/`)){let t=e.split(`/`);i=await R(t[2],t[3])}else i=(e.includes(`/category/`)||e.includes(`/discover/`),await P());r.innerHTML=``,i&&i instanceof Node?r.appendChild(i):(console.warn(`Peringatan: Fungsi halaman tidak mengembalikan DOM Node yang valid.`,i),r.innerHTML=`<div style="padding:3rem; text-align:center; color:#aaa;">Halaman gagal dimuat atau tidak ditemukan. Sila kembali ke <a href="/" data-link style="color:#e50914; text-decoration:none; font-weight:bold;">Beranda Cinevora</a>.</div>`),t.appendChild(z()),B(),j()}window.addEventListener(`DOMContentLoaded`,()=>{window.route=V,n(),typeof m==`function`&&m()});