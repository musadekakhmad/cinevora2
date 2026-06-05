// Hapus BASE_URL karena routing dilakukan lewat Cloudflare Pages Proxy (/api/tmdb)
const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export const fetchTMDB = async (endpoint, params = {}) => {
  const url = new URL('/api/tmdb', window.location.origin);
  url.searchParams.append('endpoint', endpoint);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  const res = await fetch(url);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error dengan status ${res.status}`);
  }
  
  return res.json();
};

// --- ENDPOINT MAPPING ---
export const getTrending = (page = 1) => fetchTMDB('/trending/all/day', { page });
export const getMoviesByCategory = (category, page = 1) => fetchTMDB(`/movie/${category}`, { page });
export const getTvByCategory = (category, page = 1) => fetchTMDB(`/tv/${category}`, { page });
export const getDiscoverByGenre = (mediaType, genreId, page = 1) => fetchTMDB(`/discover/${mediaType}`, { with_genres: genreId, page });
export const searchMulti = (query, page = 1) => fetchTMDB('/search/multi', { query, page });
export const getDetails = (mediaType, id) => fetchTMDB(`/${mediaType}/${id}`);
export const getCredits = (mediaType, id) => fetchTMDB(`/${mediaType}/${id}/credits`);
export const getVideos = (mediaType, id) => fetchTMDB(`/${mediaType}/${id}/videos`);

// Penanganan fallback error untuk TV alternative titles agar tidak merusak UI jika data kosong
export const getAlternativeTitles = (mediaType, id) => {
  if (mediaType === 'movie') return fetchTMDB(`/movie/${id}/alternative_titles`);
  return fetchTMDB(`/tv/${id}/alternative_titles`).catch(() => ({ titles: [] }));
};

export const getMovieGenres = () => fetchTMDB('/genre/movie/list');
export const getTvGenres = () => fetchTMDB('/genre/tv/list');

// --- IMAGE URL RESOLVER ---
// Menggunakan fallback image lokal yang lebih cepat di-load dibanding via.placeholder.com
export const getImageUrl = (path, size = 'w500') => 
  path ? `${IMAGE_BASE}/${size}${path}` : '/assets/no-poster.svg';

export const getBackdropUrl = (path, size = 'original') => 
  path ? `${IMAGE_BASE}/${size}${path}` : '/assets/no-backdrop.svg';