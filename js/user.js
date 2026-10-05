/* ============================================================
   user.js – User Module (dashboard, browse, search, playlists)
   ============================================================ */

// ---------- Auth Guard ----------
const currentUser = requireAuth('user');
if (!currentUser) throw new Error('Not authenticated');

// ---------- Init Player ----------
Player.init();

// ---------- State ----------
let currentPage = 'home';
let currentGenre = 'All';

// ---------- Render Header ----------
document.getElementById('headerUserName').textContent = currentUser.name;
document.getElementById('headerAvatar').textContent = currentUser.name.charAt(0).toUpperCase();

// ---------- Logout ----------
document.getElementById('logoutBtn').addEventListener('click', () => {
  logoutUser();
  window.location.href = 'index.html';
});

// ---------- Navigation ----------
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPage = btn.dataset.page;
    renderCurrentPage();
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
  });
});

// ---------- Mobile menu toggle ----------
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ---------- Global search ----------
document.getElementById('globalSearch').addEventListener('input', debounce((e) => {
  const q = e.target.value.trim();
  if (q.length > 0) {
    currentPage = 'search';
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    renderSearchResults(q);
  } else {
    renderCurrentPage();
  }
}, 300));

// ---------- Render Router ----------
function renderCurrentPage() {
  const container = document.getElementById('pageContainer');
  switch (currentPage) {
    case 'home': renderHome(container); break;
    case 'browse': renderBrowse(container); break;
    case 'search': renderSearch(container); break;
    case 'playlists': renderPlaylists(container); break;
    case 'favorites': renderFavorites(container); break;
    case 'profile': renderProfile(container); break;
    default: renderHome(container);
  }
}

/* ============================================================
   PAGE: HOME
   ============================================================ */
function renderHome(container) {
  const recent = getRecentSongs(6);
  const songs = Storage.getSongs();
  const trending = songs.slice(0, 8);
  const artists = Storage.getArtists().slice(0, 6);
  const albums = Storage.getAlbums().slice(0, 6);

  container.innerHTML = `
    ${recent.length > 0 ? `
      <section>
        <div class="section-header">
          <div>
            <h2 class="section-title">Recently Played</h2>
            <p class="section-subtitle">Pick up where you left off</p>
          </div>
        </div>
        <div class="music-grid">${recent.map(s => songCardHTML(s)).join('')}</div>
      </section>
    ` : ''}

    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Trending Now</h2>
          <p class="section-subtitle">Popular tracks this week</p>
        </div>
      </div>
      <div class="music-grid">${trending.map(s => songCardHTML(s)).join('')}</div>
    </section>

    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Popular Artists</h2>
          <p class="section-subtitle">Voices you'll love</p>
        </div>
      </div>
      <div class="artist-grid">${artists.map(a => artistCardHTML(a)).join('')}</div>
    </section>

    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Featured Albums</h2>
          <p class="section-subtitle">Curated collections</p>
        </div>
      </div>
      <div class="album-grid">${albums.map(a => albumCardHTML(a)).join('')}</div>
    </section>
  `;

  attachSongCardEvents();
}

/* ============================================================
   PAGE: BROWSE
   ============================================================ */
function renderBrowse(container) {
  const genres = ['All', ...Storage.getGenres()];
  const allSongs = Storage.getSongs();
  const filtered = currentGenre === 'All'
    ? allSongs
    : allSongs.filter(s => s.genre === currentGenre);

  container.innerHTML = `
    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Browse Music</h2>
          <p class="section-subtitle">${filtered.length} tracks available</p>
        </div>
      </div>
      <div class="category-row" style="margin-bottom:20px;">
        ${genres.map(g => `
          <button class="category-pill ${g === currentGenre ? 'active' : ''}" data-genre="${g}">${g}</button>
        `).join('')}
      </div>
      ${filtered.length > 0
        ? `<div class="music-grid">${filtered.map(s => songCardHTML(s)).join('')}</div>`
        : emptyStateHTML('🎵', 'No songs found', 'Try a different genre or add songs from admin panel.')}
    </section>
  `;

  container.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      currentGenre = pill.dataset.genre;
      renderBrowse(container);
    });
  });

  attachSongCardEvents();
}

/* ============================================================
   PAGE: SEARCH
   ============================================================ */
function renderSearch(container) {
  container.innerHTML = `
    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Search</h2>
          <p class="section-subtitle">Find songs, artists, and albums</p>
        </div>
      </div>
      <div id="searchResults">
        ${emptyStateHTML('🔍', 'Start typing to search', 'Use the search bar above to discover music.')}
      </div>
    </section>
  `;
}

function renderSearchResults(query) {
  const container = document.getElementById('pageContainer');
  const results = searchSongs(query);
  const total = results.songs.length + results.artists.length + results.albums.length;

  if (total === 0) {
    container.innerHTML = `
      <section>
        <div class="section-header">
          <div>
            <h2 class="section-title">Search results for "${escapeHtml(query)}"</h2>
          </div>
        </div>
        ${emptyStateHTML('🔍', 'No results found', 'Try a different keyword.')}
      </section>
    `;
    return;
  }

  container.innerHTML = `
    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Results for "${escapeHtml(query)}"</h2>
          <p class="section-subtitle">${total} result(s) found</p>
        </div>
      </div>

      ${results.songs.length > 0 ? `
        <h3 style="margin:20px 0 12px;font-size:16px;color:var(--text-secondary);">Songs</h3>
        <div class="music-grid">${results.songs.map(s => songCardHTML(s)).join('')}</div>
      ` : ''}

      ${results.artists.length > 0 ? `
        <h3 style="margin:28px 0 12px;font-size:16px;color:var(--text-secondary);">Artists</h3>
        <div class="artist-grid">${results.artists.map(a => artistCardHTML(a)).join('')}</div>
      ` : ''}

      ${results.albums.length > 0 ? `
        <h3 style="margin:28px 0 12px;font-size:16px;color:var(--text-secondary);">Albums</h3>
        <div class="album-grid">${results.albums.map(a => albumCardHTML(a)).join('')}</div>
      ` : ''}
    </section>
  `;

  attachSongCardEvents();
}

/* ============================================================
   PAGE: PLAYLISTS
   ============================================================ */
function renderPlaylists(container) {
  const playlists = getUserPlaylists();

  container.innerHTML = `
    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Your Playlists</h2>
          <p class="section-subtitle">${playlists.length} playlist(s)</p>
        </div>
        <button class="btn btn-primary" id="createPlaylistBtn">+ New Playlist</button>
      </div>
      ${playlists.length === 0
        ? emptyStateHTML('📂', 'No playlists yet', 'Create your first playlist to organize your music.')
        : `<div class="music-grid">${playlists.map(p => playlistCardHTML(p)).join('')}</div>`
      }
    </section>
  `;

  const createBtn = document.getElementById('createPlaylistBtn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openModal(`
        <h3>Create Playlist</h3>
        <div class="form-group">
          <label for="playlistName">Playlist Name</label>
          <input type="text" id="playlistName" placeholder="My Awesome Playlist">
          <span class="error-msg" id="playlistNameError"></span>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" id="confirmCreatePlaylist">Create</button>
        </div>
      `);

      document.getElementById('confirmCreatePlaylist').addEventListener('click', () => {
        const name = document.getElementById('playlistName').value.trim();
        if (!name) {
          showError('playlistNameError', 'Playlist name is required');
          return;
        }
        createPlaylist(name);
        closeModal();
        showToast('Playlist created!', 'success');
        renderPlaylists(container);
      });
    });
  }

  // Playlist card click → view playlist
  container.querySelectorAll('.playlist-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.playlist-delete')) return;
      viewPlaylist(card.dataset.id);
    });
  });

  // Delete playlist
  container.querySelectorAll('.playlist-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirmAction('Delete this playlist?')) {
        deletePlaylist(btn.dataset.id);
        showToast('Playlist deleted', 'success');
        renderPlaylists(container);
      }
    });
  });
}

function playlistCardHTML(p) {
  return `
    <div class="song-card playlist-card" data-id="${p.id}">
      <div class="song-art" style="display:grid;place-items:center;background:var(--gradient-main);font-size:48px;">📂</div>
      <div class="song-meta">
        <span class="song-title">${escapeHtml(p.name)}</span>
        <span class="song-artist">${p.songs.length} song(s)</span>
      </div>
      <div class="song-actions">
        <button class="icon-btn delete playlist-delete" data-id="${p.id}" title="Delete">🗑</button>
      </div>
    </div>
  `;
}

function viewPlaylist(playlistId) {
  const playlist = Storage.getPlaylists().find(p => p.id === playlistId);
  if (!playlist) return;

  const songs = playlist.songs.map(id => getSongById(id)).filter(Boolean);
  const container = document.getElementById('pageContainer');

  container.innerHTML = `
    <section>
      <div class="section-header">
        <div>
          <button class="btn btn-outline btn-sm" id="backToPlaylists" style="margin-bottom:12px;">← Back to Playlists</button>
          <h2 class="section-title">${escapeHtml(playlist.name)}</h2>
          <p class="section-subtitle">${songs.length} song(s)</p>
        </div>
        ${songs.length > 0 ? `<button class="btn btn-primary" id="playAllPlaylist">▶ Play All</button>` : ''}
      </div>
      ${songs.length === 0
        ? emptyStateHTML('🎵', 'This playlist is empty', 'Add songs from the Browse page.')
        : `<div class="music-grid">${songs.map(s => songCardHTML(s, true, playlistId)).join('')}</div>`
      }
    </section>
  `;

  document.getElementById('backToPlaylists').addEventListener('click', () => {
    currentPage = 'playlists';
    renderPlaylists(container);
  });

  const playAllBtn = document.getElementById('playAllPlaylist');
  if (playAllBtn) {
    playAllBtn.addEventListener('click', () => {
      if (songs.length > 0) {
        Player.loadSong(songs[0], songs);
        showToast('Playing playlist', 'success');
      }
    });
  }

  attachSongCardEvents(playlistId);
}

/* ============================================================
   PAGE: FAVORITES
   ============================================================ */
function renderFavorites(container) {
  const favorites = getUserFavorites();

  container.innerHTML = `
    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Your Favorites</h2>
          <p class="section-subtitle">${favorites.length} song(s)</p>
        </div>
        ${favorites.length > 0 ? `<button class="btn btn-primary" id="playAllFav">▶ Play All</button>` : ''}
      </div>
      ${favorites.length === 0
        ? emptyStateHTML('❤️', 'No favorites yet', 'Tap the heart icon on any song to save it here.')
        : `<div class="music-grid">${favorites.map(s => songCardHTML(s)).join('')}</div>`
      }
    </section>
  `;

  const playAllBtn = document.getElementById('playAllFav');
  if (playAllBtn) {
    playAllBtn.addEventListener('click', () => {
      Player.loadSong(favorites[0], favorites);
      showToast('Playing favorites', 'success');
    });
  }

  attachSongCardEvents();
}

/* ============================================================
   PAGE: PROFILE
   ============================================================ */
function renderProfile(container) {
  const favCount = getUserFavorites().length;
  const playlistCount = getUserPlaylists().length;
  const recentCount = getRecentSongs(50).length;

  container.innerHTML = `
    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Your Profile</h2>
          <p class="section-subtitle">Account information and stats</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">❤️</div>
          <div class="stat-info">
            <span class="stat-value">${favCount}</span>
            <span class="stat-label">Favorites</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📂</div>
          <div class="stat-info">
            <span class="stat-value">${playlistCount}</span>
            <span class="stat-label">Playlists</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎵</div>
          <div class="stat-info">
            <span class="stat-value">${recentCount}</span>
            <span class="stat-label">Songs Played</span>
          </div>
        </div>
      </div>

      <div class="table-wrapper" style="margin-top:24px;">
        <div style="padding:24px;display:grid;gap:16px;">
          <div style="display:grid;grid-template-columns:140px 1fr;gap:12px;align-items:center;">
            <strong style="color:var(--text-secondary);">Name</strong>
            <span>${escapeHtml(currentUser.name)}</span>
          </div>
          <div style="display:grid;grid-template-columns:140px 1fr;gap:12px;align-items:center;">
            <strong style="color:var(--text-secondary);">Email</strong>
            <span>${escapeHtml(currentUser.email)}</span>
          </div>
          <div style="display:grid;grid-template-columns:140px 1fr;gap:12px;align-items:center;">
            <strong style="color:var(--text-secondary);">Role</strong>
            <span style="text-transform:capitalize;">${escapeHtml(currentUser.role)}</span>
          </div>
          <div style="display:grid;grid-template-columns:140px 1fr;gap:12px;align-items:center;">
            <strong style="color:var(--text-secondary);">Member Since</strong>
            <span>${new Date(currentUser.loginAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ============================================================
   COMPONENT HTML TEMPLATES
   ============================================================ */
function songCardHTML(song, showRemove = false, playlistId = null) {
  const artist = getArtistById(song.artistId);
  const fav = isFavorite(song.id);

  return `
    <div class="song-card" data-song-id="${song.id}">
      <div class="song-art">
        <img src="${song.cover || artist.image}" alt="${escapeHtml(song.title)}" loading="lazy">
        <div class="song-play-overlay">▶</div>
      </div>
      <div class="song-meta">
        <span class="song-title">${escapeHtml(song.title)}</span>
        <span class="song-artist">${escapeHtml(artist.name)}</span>
      </div>
      <div class="song-actions">
        <button class="fav-btn ${fav ? 'active' : ''}" data-fav-id="${song.id}" title="Favorite">
          ${fav ? '♥' : '♡'}
        </button>
        <span class="song-duration">${formatDuration(song.duration)}</span>
      </div>
      ${showRemove ? `
        <button class="icon-btn delete" data-remove-id="${song.id}" data-playlist="${playlistId}"
          style="position:absolute;top:8px;right:8px;" title="Remove from playlist">✕</button>
      ` : ''}
    </div>
  `;
}

function artistCardHTML(artist) {
  const songCount = Storage.getSongs().filter(s => s.artistId === artist.id).length;
  return `
    <div class="artist-card" data-artist-id="${artist.id}">
      <div class="artist-img">
        <img src="${artist.image}" alt="${escapeHtml(artist.name)}" loading="lazy">
      </div>
      <span class="artist-name">${escapeHtml(artist.name)}</span>
      <span class="artist-meta">${artist.genre} • ${songCount} songs</span>
    </div>
  `;
}

function albumCardHTML(album) {
  const artist = getArtistById(album.artistId);
  return `
    <div class="album-card" data-album-id="${album.id}">
      <div class="album-cover">
        <img src="${album.cover}" alt="${escapeHtml(album.title)}" loading="lazy">
      </div>
      <div class="song-meta">
        <span class="song-title">${escapeHtml(album.title)}</span>
        <span class="song-artist">${escapeHtml(artist.name)} • ${album.year}</span>
      </div>
    </div>
  `;
}

function emptyStateHTML(icon, title, text) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <div class="empty-title">${title}</div>
      <div class="empty-text">${text}</div>
    </div>
  `;
}

/* ============================================================
   EVENT ATTACHMENT FOR SONG CARDS
   ============================================================ */
function attachSongCardEvents(playlistId = null) {
  // Play song on card click
  document.querySelectorAll('.song-card[data-song-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.fav-btn') || e.target.closest('[data-remove-id]')) return;
      const songId = card.dataset.songId;
      const song = getSongById(songId);
      if (!song) return;

      // Build queue from visible cards
      const visibleSongs = Array.from(document.querySelectorAll('.song-card[data-song-id]'))
        .map(c => getSongById(c.dataset.songId))
        .filter(Boolean);

      Player.loadSong(song, visibleSongs);
      showToast(`Playing: ${song.title}`, 'success');
    });
  });

  // Favorite toggle
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const added = toggleFavorite(btn.dataset.favId);
      btn.classList.toggle('active', added);
      btn.textContent = added ? '♥' : '♡';
      showToast(added ? 'Added to favorites' : 'Removed from favorites', 'success');
      if (currentPage === 'favorites') renderFavorites(document.getElementById('pageContainer'));
    });
  });

  // Remove from playlist
  document.querySelectorAll('[data-remove-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const songId = btn.dataset.removeId;
      const plId = btn.dataset.playlist;
      if (plId && confirmAction('Remove this song from the playlist?')) {
        removeFromPlaylist(plId, songId);
        showToast('Removed from playlist', 'success');
        viewPlaylist(plId);
      }
    });
  });

  // Artist card → show artist songs
  document.querySelectorAll('.artist-card').forEach(card => {
    card.addEventListener('click', () => {
      const artistId = card.dataset.artistId;
      const artist = getArtistById(artistId);
      const songs = Storage.getSongs().filter(s => s.artistId === artistId);
      const container = document.getElementById('pageContainer');
      container.innerHTML = `
        <section>
          <div class="section-header">
            <div>
              <button class="btn btn-outline btn-sm" id="backHome" style="margin-bottom:12px;">← Back</button>
              <h2 class="section-title">${escapeHtml(artist.name)}</h2>
              <p class="section-subtitle">${songs.length} song(s) • ${artist.genre}</p>
            </div>
          </div>
          ${songs.length > 0
            ? `<div class="music-grid">${songs.map(s => songCardHTML(s)).join('')}</div>`
            : emptyStateHTML('🎵', 'No songs yet', 'This artist has no songs.')
          }
        </section>
      `;
      document.getElementById('backHome').addEventListener('click', () => {
        currentPage = 'home';
        renderCurrentPage();
      });
      attachSongCardEvents();
    });
  });

  // Album card → show album songs
  document.querySelectorAll('.album-card').forEach(card => {
    card.addEventListener('click', () => {
      const albumId = card.dataset.albumId;
      const album = getAlbumById(albumId);
      const artist = getArtistById(album.artistId);
      const songs = Storage.getSongs().filter(s => s.albumId === albumId);
      const container = document.getElementById('pageContainer');
      container.innerHTML = `
        <section>
          <div class="section-header">
            <div>
              <button class="btn btn-outline btn-sm" id="backHome" style="margin-bottom:12px;">← Back</button>
              <h2 class="section-title">${escapeHtml(album.title)}</h2>
              <p class="section-subtitle">${escapeHtml(artist.name)} • ${album.year} • ${songs.length} song(s)</p>
            </div>
          </div>
          ${songs.length > 0
            ? `<div class="music-grid">${songs.map(s => songCardHTML(s)).join('')}</div>`
            : emptyStateHTML('🎵', 'No songs yet', 'This album has no songs.')
          }
        </section>
      `;
      document.getElementById('backHome').addEventListener('click', () => {
        currentPage = 'home';
        renderCurrentPage();
      });
      attachSongCardEvents();
    });
  });

  // Playlist card → view (handled in renderPlaylists)
}

// ---------- Initial Render ----------
renderCurrentPage();