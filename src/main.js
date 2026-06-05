import { initRouter } from './router.js'; // pastikan path impor benar

// Import fungsi spesifik dari api.js untuk efisiensi kode
import { 
  searchMulti, 
  getMoviesByCategory, 
  getTvByCategory, 
  getDiscoverByGenre, 
  getTrending 
} from './api.js';

// 1. Import fungsi yang sudah dioptimasi dari api.js agar tidak duplikasi code
import { fetchTMDB, getImageUrl } from './api.js'; 

// Helper untuk membuat slug judul film yang ramah SEO
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter spesial
    .replace(/\s+/g, '-')         // Ubah spasi menjadi -
    .replace(/-+/g, '-');         // Cegah tanda hubung ganda ---
}

// ==================== SMART LINKS ====================
const SMART_LINK_WATCH = 'https://fundingfashioned.com/scjyw84ha?key=d0124eab1e4868478095f8e9846619f5';

// ==================== POPUNDER TRACKING (Global - 1x per session) ====================
function initPopunder() {
  if (sessionStorage.getItem('popunder_triggered') === 'true') return;

  window.addEventListener('click', function injectPopunder() {
    const popunderScript = document.createElement('script');
    popunderScript.src = "https://fundingfashioned.com/e8/6d/fb/e86dfb1927e7f50aa6adf7367c930be1.js";
    document.body.appendChild(popunderScript);
    
    sessionStorage.setItem('popunder_triggered', 'true');
    console.log('Popunder triggered on first click');
    
    window.removeEventListener('click', injectPopunder);
  }, { once: true });
}

// ==================== SMART LINK TRACKING PER JUDUL (1x per title) ====================
const watchedTitles = new Set();

function getSmartLinkForTitle(titleId) {
  const key = `${titleId}`;
  if (watchedTitles.has(key)) {
    // Bisa disiapkan link alternatif jika user klik judul yang sama kedua kalinya
    return SMART_LINK_WATCH; 
  }
  watchedTitles.add(key);
  return SMART_LINK_WATCH;
}

// ==================== GLOBAL STATE ====================
let currentPage = 1;
let isLoading = false;
let totalPages = 1;
let currentMediaType = 'all';
let currentCategory = 'trending';
let currentGenreId = null;
let currentGenreName = null;
let currentQuery = null;
let movieGenres = [];
let tvGenres = [];

const app = document.getElementById('app');

// ==================== API FUNCTIONS ====================
async function fetchGenres() {
  // Cek apakah data genre sudah ada di memori browser
  const cachedMovieGenres = sessionStorage.getItem('movieGenres');
  const cachedTvGenres = sessionStorage.getItem('tvGenres');

  if (cachedMovieGenres && cachedTvGenres) {
    movieGenres = JSON.parse(cachedMovieGenres);
    tvGenres = JSON.parse(cachedTvGenres);
    return; // Langsung keluar, tidak perlu nembak API TMDB lagi!
  }

  try {
    const [movieRes, tvRes] = await Promise.all([
      fetchTMDB('/genre/movie/list'),
      fetchTMDB('/genre/tv/list')
    ]);
    
    movieGenres = movieRes.genres || [];
    tvGenres = tvRes.genres || [];
    
    // Simpan ke cache browser agar kunjungan berikutnya instan
    sessionStorage.setItem('movieGenres', JSON.stringify(movieGenres));
    sessionStorage.setItem('tvGenres', JSON.stringify(tvGenres));
  } catch (err) {
    console.error("Gagal memuat genre:", err);
  }
}

// ==================== SKELETON LOADER ====================
function createSkeletonCard() {
  const skeleton = document.createElement('div');
  skeleton.className = 'card skeleton-card';
  skeleton.innerHTML = `
    <div style="width:100%; aspect-ratio:2/3; background: #2a2a2a; border-radius: 8px;"></div>
    <div style="padding:0.5rem;">
      <div style="height:12px; background:#2a2a2a; margin-bottom:0.5rem; border-radius:4px;"></div>
      <div style="height:10px; background:#2a2a2a; width:60%; border-radius:4px;"></div>
    </div>
  `;
  return skeleton;
}

function showSkeletons(grid, count = 18) {
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    grid.appendChild(createSkeletonCard());
  }
}

// ==================== COMPONENTS ====================
function createCard(item) {
  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating = item.vote_average?.toFixed(1) || 'N/A';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${getImageUrl(item.poster_path)}" alt="Watch ${title} ${year} free online" loading="lazy">
    <div class="card-info">
      <div class="card-title">${title}</div>
      <div>${year} | ★ ${rating}</div>
    </div>
  `;
  card.onclick = () => navigateTo(`/detail/${type}/${item.id}`);
  return card;
}

// ==================== DYNAMIC META DESCRIPTION ====================
function updateMetaDescription(title, year, overview, rating, director, cast) {
  let metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
  if (!metaDesc.parentNode) {
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  const shortOverview = overview.length > 120 ? overview.substring(0, 120) + '...' : overview;
  metaDesc.setAttribute('content', `Watch ${title} (${year}) free online. ${shortOverview} Rating: ${rating}/10. Director: ${director}. Cast: ${cast.substring(0, 100)}. Stream now on CINEVORA!`);
  
  let ogDesc = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
  if (!ogDesc.parentNode) {
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', `Watch ${title} (${year}) free online. ${shortOverview}`);
  
  let ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
  if (!ogTitle.parentNode) {
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', `${title} (${year}) - CINEVORA`);
}

// ==================== BACK TO TOP BUTTON ====================
function addBackToTopButton() {
  if (document.getElementById('backToTop')) return;
  
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  btn.style.cssText = `
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
  `;
  
  window.addEventListener('scroll', () => {
    btn.style.opacity = window.scrollY > 300 ? '1' : '0';
  });
  
  btn.onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  document.body.appendChild(btn);
}

// ==================== NAVBAR (Proporsional 5 Kolom & Fix Router State) ====================
async function renderNavbar() {
  await fetchGenres();
  
  const movieCategories = [
    { name: 'Popular', slug: 'popular' },
    { name: 'Now Playing', slug: 'now_playing' },
    { name: 'Upcoming', slug: 'upcoming' },
    { name: 'Top Rated', slug: 'top_rated' }
  ];
  
  const tvCategories = [
    { name: 'Popular', slug: 'popular' },
    { name: 'Airing Today', slug: 'airing_today' },
    { name: 'On TV', slug: 'on_the_air' },
    { name: 'Top Rated', slug: 'top_rated' }
  ];
  
  const movieGenreHtml = movieGenres.map(g => 
    `<a href="/discover/movie?genre=${g.id}&name=${encodeURIComponent(g.name)}" class="dropdown-item" data-link style="text-decoration: none !important; border:none;">${g.name}</a>`
  ).join('');
  
  const tvGenreHtml = tvGenres.map(g => 
    `<a href="/discover/tv?genre=${g.id}&name=${encodeURIComponent(g.name)}" class="dropdown-item" data-link style="text-decoration: none !important; border:none;">${g.name}</a>`
  ).join('');
  
  return `
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
                ${movieCategories.map(cat => `<a href="/movie/category/${cat.slug}" class="dropdown-item" data-link style="text-decoration: none !important; padding: 0.2rem 0;">${cat.name}</a>`).join('')}
              </div>
            </div>
            
            <div class="dropdown-group">
              <div class="dropdown-label">Genre</div>
              <div class="genre-scroll" style="display: grid; grid-template-columns: repeat(5, minmax(110px, 1fr)); gap: 0.4rem 0.6rem;">
                ${movieGenreHtml}
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
                ${tvCategories.map(cat => `<a href="/tv/category/${cat.slug}" class="dropdown-item" data-link style="text-decoration: none !important; padding: 0.2rem 0;">${cat.name}</a>`).join('')}
              </div>
            </div>
            
            <div class="dropdown-group">
              <div class="dropdown-label">Genre</div>
              <div class="genre-scroll" style="display: grid; grid-template-columns: repeat(5, minmax(110px, 1fr)); gap: 0.4rem 0.6rem;">
                ${tvGenreHtml}
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
  `;
}

// ==================== LOAD CONTENT ====================
async function loadContent(grid, append = false) {
  if (isLoading) return;
  isLoading = true;
  
  if (!append) {
    showSkeletons(grid);
  }
  
  try {
    let data;
    let titleText = '';
    
    if (currentQuery) {
      data = await searchMulti(currentQuery, currentPage);
      titleText = `Search results for "${currentQuery}"`;
    } else if (currentGenreId && currentMediaType !== 'all') {
      data = await getDiscoverByGenre(currentMediaType, currentGenreId, currentPage);
      titleText = `${currentMediaType === 'movie' ? 'Movies' : 'TV Shows'} in ${currentGenreName}`;
    } else if (currentCategory !== 'trending' && currentMediaType !== 'all') {
      data = currentMediaType === 'movie' 
        ? await getMoviesByCategory(currentCategory, currentPage)
        : await getTvByCategory(currentCategory, currentPage);
      titleText = `${currentMediaType === 'movie' ? 'Movies' : 'TV Shows'} - ${currentCategory.replace(/_/g, ' ').toUpperCase()}`;
    } else {
      data = await getTrending(currentPage);
      titleText = 'Trending Today';
    }
    
    // Filter out people entities
    const validResults = data.results.filter(item => item.media_type !== 'person');
    
    let titleEl = grid.parentElement.querySelector('.page-title');
    if (!titleEl) {
      titleEl = document.createElement('h2');
      titleEl.className = 'page-title';
      grid.parentElement.insertBefore(titleEl, grid);
    }
    titleEl.textContent = titleText;
    titleEl.style.textAlign = 'center';
    
    if (!append) grid.innerHTML = '';
    
    // Render Cards dengan Event Click URL SEO baru tanpa /detail/
    validResults.forEach(item => {
      const card = createCard(item); // Memanggil komponen pembuat card Anda
      
      // Ambil type & ID
      const mediaType = item.media_type || currentMediaType || 'movie';
      const itemTitle = item.title || item.name;
      const slug = createSlug(itemTitle);
      
      // Override click target ke rute baru: /movie/slug-id atau /tv/slug-id
      card.onclick = (e) => {
        e.preventDefault();
        navigateTo(`/${mediaType}/${slug}-${item.id}`);
      };
      
      grid.appendChild(card);
    });
    
    const existingBtn = grid.parentElement.querySelector('.load-more');
    if (existingBtn) existingBtn.remove();
    
    if (currentPage < data.total_pages && validResults.length > 0) {
      const loadMoreDiv = document.createElement('div');
      loadMoreDiv.className = 'load-more';
      const btn = document.createElement('button');
      btn.textContent = 'Load More';
      btn.onclick = async () => { 
        currentPage++; 
        await loadContent(grid, true);
      };
      loadMoreDiv.appendChild(btn);
      grid.parentElement.appendChild(loadMoreDiv);
    }
    
    if (validResults.length === 0 && !append) {
      grid.innerHTML = '<div style="padding:2rem; text-align:center;">No results found</div>';
    }
  } catch (err) {
    console.error('Error rendering content:', err);
    if (!append) grid.innerHTML = '<div style="padding:2rem; text-align:center;">Error loading data. Please check your connection.</div>';
  } finally {
    isLoading = false;
  }
}

// ==================== REVISI FINAL HOMEPAGE (src/main.js) ====================
async function HomePage() {
  const container = document.createElement('div');
  container.className = 'home-page-container';
  
  const grid = document.createElement('div');
  grid.className = 'movie-grid';
  container.appendChild(grid);
  
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  
  // Ambil Query Aktif
  const activeQuery = urlParams.get('query') || currentQuery || null;

  currentQuery = activeQuery;
  currentGenreId = urlParams.get('genre') || null;
  currentGenreName = urlParams.get('name') || null;
  
  if (!currentQuery) {
    currentCategory = 'trending';
    currentMediaType = 'all';
  } else {
    currentCategory = null;
  }
  
  currentPage = 1;

  if (path.includes('/category/')) {
    const parts = path.split('/');
    if (parts.length >= 4) {
      currentMediaType = parts[1]; 
      currentCategory = parts[3];   
      currentQuery = null;
    }
  } else if (path.includes('/discover/')) {
    const parts = path.split('/');
    if (parts.length >= 3) {
      currentMediaType = parts[2]; 
      currentQuery = null;
    }
  }

  // Pasang indikator loading awal di dalam grid
  grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #aaa;">Loading movie database...</div>';

  // 🟢 PERBAIKAN UTAMA: Bungkus fungsi loadContent yang rentan crash
  try {
    await loadContent(grid);
  } catch (error) {
    console.error("🔴 Deteksi Error di dalam loadContent:", error);
    // Jika API/fungsi crash, tampilkan pesan error yang rapi di layar, bukan bikin blank hitam
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="color: #e50914; font-weight: bold; margin-bottom: 1rem;">Failed to load movie stream list.</p>
        <button onclick="window.location.reload()" style="background: #e50914; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Retry Connection</button>
      </div>
    `;
  }

  // 🔴 SYARAT MUTLAK: Baris ini harus selalu dieksekusi di luar block try agar rute / tidak blank!
  return container;
}

// ==================== ABOUT PAGE ====================
async function AboutPage() {
  addBackToTopButton();
  
  const container = document.createElement('div');
  container.style.maxWidth = '1000px';
  container.style.margin = '2rem auto';
  container.style.padding = '2rem';
  container.style.background = '#0f0f0f';
  container.style.borderRadius = '16px';
  container.style.lineHeight = '1.6';
  container.style.textAlign = 'justify';
  
  container.innerHTML = `
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
  `;
  
  return container;
}

// ==================== src/main.js (Bagian DetailPage) ====================
function DetailPage(type, id) {
  // 1. Buat kontainer kosong secara instan
  const container = document.createElement('div');
  container.className = 'detail-container';
  
  // 2. Pasang skeleton loader awal
  container.innerHTML = `
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
  `;

  // Fungsi internal untuk menembak API di background
  async function populateData() {
    try {
      const [details, credits] = await Promise.all([
        fetchTMDB(`/${type}/${id}`),
        fetchTMDB(`/${type}/${id}/credits`)
      ]);
      
      const director = credits.crew?.find(m => m.job === 'Director')?.name || 'N/A';
      const writer = credits.crew?.find(m => m.job === 'Writer')?.name || 'N/A';
      const cast = credits.cast?.slice(0, 8).map(c => c.name).join(', ') || 'N/A';
      const title = details.title || details.name;
      const year = (details.release_date || details.first_air_date || '').slice(0, 4);
      const rating = details.vote_average?.toFixed(1) || 'N/A';
      const runtime = type === 'movie' ? (details.runtime ? `${details.runtime} min` : 'N/A') : (details.number_of_seasons ? `${details.number_of_seasons} seasons` : 'N/A');
      const releaseDate = details.release_date || details.first_air_date || 'Unknown';
      const genres = details.genres?.map(g => g.name).join(', ') || 'N/A';
      const overview = details.overview || 'No description available.';
      const titleId = `${type}-${id}`;
      
      if (typeof updateMetaDescription === 'function') {
        updateMetaDescription(title, year, overview, rating, director, cast);
      }
      
      // Suntikkan data asli menggantikan skeleton loading
      container.innerHTML = `
        <div style="margin-bottom: 1rem; font-size: 0.8rem;">
          <a href="/" data-link style="color: #e50914; text-decoration: none;">Home</a> > <span style="color: #aaa;">${title}</span>
        </div>
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back</button>
        </div>
        <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
          <img src="${getImageUrl(details.poster_path, 'w342')}" alt="Watch ${title} online" style="width: 280px; border-radius: 12px; background: #222;">
          <div style="flex: 1; text-align: justify;">
            <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">${title} <span style="font-size: 1.2rem; color: #aaa;">(${year})</span></h1>
            <div style="display: flex; gap: 1rem; margin: 1rem 0; color: #ccc;">
              <span>⭐ ${rating}/10</span> <span>⏱️ ${runtime}</span> <span>📅 ${releaseDate}</span>
            </div>
            <div style="margin: 1rem 0;"><strong>Genres:</strong> ${genres}</div>
            <div style="margin: 1rem 0;"><strong>Plot:</strong> ${overview}</div>
            <div style="margin: 1rem 0;"><strong>Director:</strong> ${director}</div>
            <div style="margin: 1rem 0;"><strong>Cast:</strong> ${cast}</div>
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
              <button class="trailer-btn" style="background: #e50914; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">▶ Watch Trailer</button>
              <a id="watchNowLink" href="#" style="background: #333; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; text-decoration: none; font-weight: bold;">🎬 Watch Now</a>
            </div>
          </div>
        </div>
        <div id="lazyRecommendations" style="margin-top: 3rem; border-top: 1px solid #333; padding-top: 2rem;">
          <p style="color: #666;">Loading suggestions...</p>
        </div>
      `;

      // Re-bind click buttons
      container.querySelector('.back-btn').onclick = () => window.history.back();
      container.querySelector('.trailer-btn').onclick = () => navigateTo(`/trailer/${type}/${id}`);
      
      const watchNowLink = container.querySelector('#watchNowLink');
      if (watchNowLink) {
        watchNowLink.onclick = (e) => {
          e.preventDefault();
          if (typeof getSmartLinkForTitle === 'function') {
            window.open(getSmartLinkForTitle(titleId, title), '_blank');
          }
          setTimeout(() => navigateTo(`/stream/${type}/${id}`), 150);
        };
      }

      // Lazy load rekomendasi film terkait
      fetchTMDB(`/${type}/${id}/recommendations`).then(recommendations => {
        const lazyDiv = container.querySelector('#lazyRecommendations');
        if (recommendations.results && recommendations.results.length > 0 && lazyDiv) {
          const relatedMovies = recommendations.results.slice(0, 6).map(movie => {
            const rSlug = createSlug(movie.title || movie.name);
            const rType = movie.media_type || type;
            return `
              <div class="related-card" data-href="/${rType}/${rSlug}-${movie.id}" style="cursor: pointer; text-align: center; width: 120px;">
                <img src="${getImageUrl(movie.poster_path, 'w185')}" style="width: 100%; border-radius: 8px; margin-bottom: 0.5rem; background: #222;">
                <div style="font-size: 0.7rem; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${movie.title || movie.name}</div>
              </div>
            `;
          }).join('');
          
          lazyDiv.innerHTML = `
            <h3 style="color: #e50914; margin-bottom: 1rem;">You May Also Like</h3>
            <div style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem;">${relatedMovies}</div>
          `;
          
          lazyDiv.querySelectorAll('.related-card').forEach(card => {
            card.onclick = () => navigateTo(card.getAttribute('data-href'));
          });
        } else if (lazyDiv) {
          lazyDiv.remove();
        }
      });

    } catch (err) {
      console.error(err);
      container.innerHTML = '<div style="padding:2rem; text-align:center;">Error loading details.</div>';
    }
  }

  // Jalankan pengisian data di background
  populateData();

  // 🟢 CRITICAL FIX: Pastikan baris ini ada di paling luar/bawah fungsi DetailPage Anda!
  return container; 
}

// ==================== TRAILER PAGE ====================
async function TrailerPage(type, id) {
  const container = document.createElement('div');
  container.className = 'detail-container';
  container.innerHTML = '<div style="padding:2rem; text-align:center;">Loading trailer...</div>';
  
  try {
    // 🟢 Tetap pertahankan fetchTMDB bawaan asli Anda
    const videos = await fetchTMDB(`/${type}/${id}/videos`);
    const trailer = videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.results?.[0];
    
    if (trailer?.key) {
      container.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
        </div>
        <h2 style="margin-bottom: 1rem; text-align:center;">Official Trailer</h2>
        <div style="position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden;">
  <iframe 
    src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
    allowfullscreen
    loading="lazy"> </iframe>
</div>
      `;
    } else {
      container.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
        </div>
        <div style="padding:2rem; text-align:center;">No trailer available for this title</div>
      `;
    }
    const backBtn = container.querySelector('.back-btn');
    if (backBtn) backBtn.onclick = () => window.history.back();
    
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="padding:2rem; text-align:center;">Error loading trailer</div>';
  }
  return container;
}

// ==================== STREAMING PAGE ====================
async function StreamPage(type, id) {
  const container = document.createElement('div');
  container.className = 'detail-container';
  container.innerHTML = `
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
  `;
  
  const backBtn = container.querySelector('.back-btn');
  if (backBtn) backBtn.onclick = () => window.history.back();
  
  const stream1Link = container.querySelector('#stream1Link');
  const stream2Link = container.querySelector('#stream2Link');
  const streamPlayer = container.querySelector('#streamPlayer');
  const streamIframe = container.querySelector('#streamIframe');
  
  if (stream1Link) {
    stream1Link.onclick = (e) => {
      e.preventDefault();
      streamPlayer.style.display = 'block';
      streamIframe.src = `https://vidsrc.me/embed/${type}/${id}`;
      stream1Link.style.opacity = '0.7';
      if (stream2Link) stream2Link.style.opacity = '1';
    };
  }
  
  if (stream2Link) {
    stream2Link.onclick = (e) => {
      e.preventDefault();
      streamPlayer.style.display = 'block';
      streamIframe.src = `https://vidsrc.to/embed/${type}/${id}`;
      stream2Link.style.opacity = '0.7';
      if (stream1Link) stream1Link.style.opacity = '1';
    };
  }
  
  return container;
}

// ==================== FOOTER ====================
function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
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
  `;
  return footer;
}

// ==================== EVENT LISTENERS (src/main.js) ====================
function attachEventListeners() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  
  const executeSearch = (query) => {
    if (query) {
      // Set state pencarian global Anda
      if (typeof currentQuery !== 'undefined') currentQuery = query;
      if (typeof currentMediaType !== 'undefined') currentMediaType = 'all';
      if (typeof currentCategory !== 'undefined') currentCategory = null; 
      if (typeof currentGenreId !== 'undefined') currentGenreId = null;
      if (typeof currentGenreName !== 'undefined') currentGenreName = null;
      if (typeof currentPage !== 'undefined') currentPage = 1;
      
      navigateTo(`/?query=${encodeURIComponent(query)}`);
    }
  };
  
  if (searchBtn && searchInput) {
    searchBtn.onclick = () => executeSearch(searchInput.value.trim());
    searchInput.onkeypress = (e) => {
      if (e.key === 'Enter') executeSearch(e.target.value.trim());
    };
    if (typeof currentQuery !== 'undefined' && currentQuery) {
      searchInput.value = currentQuery;
    }
  }
}

// ==================== ROUTER INTERNAL (src/main.js) ====================
// ==================== EDIT DI src/main.js ====================
async function route() {
  const path = window.location.pathname;
  const appElement = document.getElementById('app');
  if (!appElement) return;
  
  // 1. Bersihkan layar #app total di awal perpindahan rute
  appElement.innerHTML = '';
  
  // 2. Ambil data navbar
  let navbar = await renderNavbar();
  
  // 🟢 PENGAMAN NAVBAR: Jika navbar ternyata berupa STRING, ubah jadi NODE otomatis!
  if (typeof navbar === 'string') {
    const tempNavDiv = document.createElement('div');
    tempNavDiv.innerHTML = navbar;
    navbar = tempNavDiv.firstElementChild || tempNavDiv;
  }
  
  // Masukkan ke appElement hanya jika dia valid Node
  if (navbar && navbar instanceof Node) {
    appElement.appendChild(navbar);
  } else {
    console.warn("Peringatan: renderNavbar() tidak mengembalikan Node yang valid.");
  }
  
  // 3. Buat wadah penampung konten utama (Main Wrapper)
  const mainContentWrapper = document.createElement('main');
  mainContentWrapper.id = 'main-content';
  appElement.appendChild(mainContentWrapper);
  
  // 4. Deklarasikan variabel penampung halaman
  let content = null;
  
  // 5. Jalankan penyaringan rute internal SPA untuk mengisi variabel 'content'
  if (path === '/' || path === '') {
    content = await HomePage();
  } else if (path === '/about' || path === '/about/') {
    content = await AboutPage();
  } else if (path.startsWith('/movie/') || path.startsWith('/tv/')) {
    const parts = path.split('/').filter(Boolean);
    const type = parts[0];
    const slugAndId = parts[1] || '';
    const idMatch = slugAndId.match(/-(\d+)$/);
    const id = idMatch ? idMatch[1] : null;

    if (id) {
      // Memanggil DetailPage instan (Instant Async Shell Injection)
      content = DetailPage(type, id); 
    } else {
      content = await HomePage();
    }
  } else if (path.startsWith('/trailer/')) {
    const parts = path.split('/');
    content = await TrailerPage(parts[2], parts[3]);
  } else if (path.startsWith('/stream/')) {
    const parts = path.split('/');
    content = await StreamPage(parts[2], parts[3]);
  } else if (path.includes('/category/') || path.includes('/discover/')) {
    content = await HomePage();
  } else {
    content = await HomePage();
  }
  
  // 6. 🟢 PENGAMAN DISUNTIKKAN DI SINI (Setelah variabel 'content' terisi secara valid)
  mainContentWrapper.innerHTML = ''; // Bersihkan teks "Loading content..."

  if (content && content instanceof Node) {
    mainContentWrapper.appendChild(content);
  } else {
    // Fallback preventif jika ada halaman yang mengembalikan null / gagal render
    console.warn("Peringatan: Fungsi halaman tidak mengembalikan DOM Node yang valid.", content);
    mainContentWrapper.innerHTML = '<div style="padding:3rem; text-align:center; color:#aaa;">Halaman gagal dimuat atau tidak ditemukan. Sila kembali ke <a href="/" data-link style="color:#e50914; text-decoration:none; font-weight:bold;">Beranda Cinevora</a>.</div>';
  }
  
  // 7. Cetak footer sekali saja di bagian paling bawah halaman
  appElement.appendChild(renderFooter());
  
  // 8. Nyalakan ulang penanganan event click tautan internal & tombol back-to-top
  attachEventListeners();
  addBackToTopButton();
}

// ==================== INITIALIZE ====================
window.addEventListener('DOMContentLoaded', () => {
  // Pasang fungsi route ke window agar bisa dipanggil oleh router.js
  window.route = route; 
  
  // Nyalakan mesin router pusat
  initRouter();
  
  // Jalankan iklan popunder global
  if (typeof initPopunder === 'function') initPopunder(); 
});
