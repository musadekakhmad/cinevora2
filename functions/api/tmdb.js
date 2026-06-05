export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url);
    let endpoint = url.searchParams.get('endpoint');

    // 1. Validasi keberadaan endpoint
    if (!endpoint) {
      return new Response(JSON.stringify({ error: "Parameter 'endpoint' wajib diisi." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Keamanan: Bersihkan endpoint agar selalu diawali dengan '/' tunggal 
    // dan mencegah manipulasi path traversal atau penyerangan domain
    endpoint = endpoint.replace(/^[\\/]+/g, ''); // Hapus semua garing di awal jika user typo menulis "//"
    endpoint = '/' + endpoint;

    // 3. Bangun URL TMDB tujuan
    const tmdbUrl = new URL(`https://api.themoviedb.org/3${endpoint}`);

    // 4. Teruskan semua query params bawaan client secara aman (kecuali parameter 'endpoint')
    url.searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        tmdbUrl.searchParams.append(key, value);
      }
    });

    // 5. Suntikkan API Key secara aman di sisi server
    tmdbUrl.searchParams.append('api_key', env.TMDB_API_KEY);

    // 6. Lakukan Fetch ke TMDB
    const res = await fetch(tmdbUrl.toString());
    
    // Jika TMDB mengembalikan status eror (4xx/5xx), teruskan status aslinya ke client
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return new Response(JSON.stringify({ 
        error: "Gagal mengambil data dari TMDB", 
        details: errorData 
      }), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await res.json();

    // 7. Kembalikan respons sukses dengan ISR Cache Header optimal
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Opsional: Jika SPA di-host di domain terpisah saat dev
        // 🔥 ISR STYLE CACHE
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
      }
    });

  } catch (error) {
    // Menangani crash internal serverless function
    return new Response(JSON.stringify({ error: "Internal Server Error", message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}