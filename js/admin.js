/* ============================================================
   admin.js – Admin Module (dashboard, CRUD management)
   ============================================================ */

// ---------- Auth Guard ----------
const adminSession = requireAuth('admin');
if (!adminSession) throw new Error('Not authenticated');

// ---------- State ----------
let adminPage = 'dashboard';

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
    adminPage = btn.dataset.page;
    document.getElementById('adminPageTitle').textContent =
      btn.textContent.trim();
    renderAdminPage();
    document.getElementById('sidebar').classList.remove('open');
  });
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ---------- Router ----------
function renderAdminPage() {
  const container = document.getElementById('adminPageContainer');
  switch (adminPage) {
    case 'dashboard': renderAdminDashboard(container); break;
    case 'songs': renderAdminSongs(container); break;
    case 'artists': renderAdminArtists(container); break;
    case 'albums': renderAdminAlbums(container); break;
    case 'users': renderAdminUsers(container); break;
    case 'genres': renderAdminGenres(container); break;
    default: renderAdminDashboard(container);
  }
}

/* ============================================================
   DASHBOARD OVERVIEW
   ============================================================ */
function renderAdminDashboard(container) {
  const users = Storage.getUsers();
  const songs = Storage.getSongs();
  const artists = Storage.getArtists();
  const albums = Storage.getAlbums();
  const playlists = Storage.getPlaylists();

  container.innerHTML = `
    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Dashboard Overview</h2>
          <p class="section-subtitle">Platform statistics at a glance</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <span class="stat-value">${users.length}</span>
            <span class="stat-label">Total Users</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎵</div>
          <div class="stat-info">
            <span class="stat-value">${songs.length}</span>
            <span class="stat-label">Total Songs</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎤</div>
          <div class="stat-info">
            <span class="stat-value">${artists.length}</span>
            <span class="stat-label">Total Artists</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💿</div>
          <div class="stat-info">
            <span class="stat-value">${albums.length}</span>
            <span class="stat-label">Total Albums</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📂</div>
          <div class="stat-info">
            <span class="stat-value">${playlists.length}</span>
            <span class="stat-label">Total Playlists</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏷️</div>
          <div class="stat-info">
            <span class="stat-value">${Storage.getGenres().length}</span>
            <span class="stat-label">Genres</span>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Recent Songs</h2>
          <p class="section-subtitle">Latest additions to the platform</p>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>Title</th><th>Artist</th><th>Genre</th><th>Duration</th></tr>
          </thead>
          <tbody>
            ${songs.slice(-5).reverse().map(s => {
              const artist = getArtistById(s.artistId);
              return `<tr>
                <td>${escapeHtml(s.title)}</td>
                <td>${escapeHtml(artist.name)}</td>
                <td>${escapeHtml(s.genre)}</td>
                <td>${formatDuration(s.duration)}</td>
              </tr>`;
            }).join('') || '<tr><td colspan="4">No songs yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/* ============================================================
   SONGS MANAGEMENT
   ============================================================ */
function renderAdminSongs(container) {
  const songs = Storage.getSongs();

  container.innerHTML = `
    <section>
      <div class="admin-toolbar" style="margin-bottom:20px;">
        <div>
          <h2 class="section-title">Manage Songs</h2>
          <p class="section-subtitle">${songs.length} song(s) in library</p>
        </div>
        <button class="btn btn-primary" id="addSongBtn">+ Add Song</button>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cover</th><th>Title</th><th>Artist</th><th>Album</th>
              <th>Genre</th><th>Duration</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${songs.length === 0
              ? '<tr><td colspan="7" style="text-align:center;padding:40px;">No songs yet. Click "Add Song" to begin.</td></tr>'
              : songs.map(s => {
                const artist = getArtistById(s.artistId);
                const album = getAlbumById(s.albumId);
                return `<tr>
                  <td><img src="${s.cover}" alt="" style="width:40px;height:40px;border-radius:6px;object-fit:cover;"></td>
                  <td>${escapeHtml(s.title)}</td>
                  <td>${escapeHtml(artist.name)}</td>
                  <td>${escapeHtml(album.title)}</td>
                  <td>${escapeHtml(s.genre)}</td>
                  <td>${formatDuration(s.duration)}</td>
                  <td>
                    <div class="table-actions">
                      <button class="icon-btn edit" data-edit="${s.id}" title="Edit">✏️</button>
                      <button class="icon-btn delete" data-delete="${s.id}" title="Delete">🗑</button>
                    </div>
                  </td>
                </tr>`;
              }).join('')
            }
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.getElementById('addSongBtn').addEventListener('click', () => openSongModal());

  container.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openSongModal(btn.dataset.edit));
  });

  container.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const song = getSongById(btn.dataset.delete);
      if (confirmAction(`Delete "${song.title}"? This cannot be undone.`)) {
        deleteSong(btn.dataset.delete);
        showToast('Song deleted', 'success');
        renderAdminSongs(container);
      }
    });
  });
}

function openSongModal(songId = null) {
  const song = songId ? getSongById(songId) : null;
  const artists = Storage.getArtists();
  const albums = Storage.getAlbums();
  const genres = Storage.getGenres();

  openModal(`
    <h3>${song ? 'Edit Song' : 'Add New Song'}</h3>

    <div class="form-group">
      <label>Title</label>
      <input type="text" id="songTitle" value="${song ? escapeHtml(song.title) : ''}" placeholder="Song title">
      <span class="error-msg" id="songTitleError"></span>
    </div>

    <div class="form-group">
      <label>Artist</label>
      <select id="songArtist">
        <option value="">Select artist</option>
        ${artists.map(a => `<option value="${a.id}" ${song && song.artistId === a.id ? 'selected' : ''}>${escapeHtml(a.name)}</option>`).join('')}
      </select>
      <span class="error-msg" id="songArtistError"></span>
    </div>

    <div class="form-group">
      <label>Album</label>
      <select id="songAlbum">
        <option value="">Select album</option>
        ${albums.map(a => `<option value="${a.id}" ${song && song.albumId === a.id ? 'selected' : ''}>${escapeHtml(a.title)}</option>`).join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Genre</label>
      <select id="songGenre">
        ${genres.map(g => `<option value="${g}" ${song && song.genre === g ? 'selected' : ''}>${g}</option>`).join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Duration (seconds)</label>
      <input type="number" id="songDuration" value="${song ? song.duration : 200}" min="10">
      <span class="error-msg" id="songDurationError"></span>
    </div>

    <div class="form-group">
      <label>Audio URL</label>
      <input type="text" id="songAudio" value="${song ? escapeHtml(song.audio) : ''}" placeholder="https://...">
    </div>

    <div class="form-group">
      <label>Cover Image URL</label>
      <input type="text" id="songCover" value="${song ? escapeHtml(song.cover || '') : ''}" placeholder="https://...">
    </div>

    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" id="saveSongBtn">${song ? 'Update' : 'Add'} Song</button>
    </div>
  `);

  document.getElementById('saveSongBtn').addEventListener('click', () => {
    clearErrors(['songTitleError', 'songArtistError', 'songDurationError']);

    const title = document.getElementById('songTitle').value.trim();
    const artistId = document.getElementById('songArtist').value;
    const albumId = document.getElementById('songAlbum').value;
    const genre = document.getElementById('songGenre').value;
    const duration = parseInt(document.getElementById('songDuration').value);
    const audio = document.getElementById('songAudio').value.trim();
    const cover = document.getElementById('songCover').value.trim();

    let valid = true;
    if (!title) { showError('songTitleError', 'Title is required'); valid = false; }
    if (!artistId) { showError('songArtistError', 'Please select an artist'); valid = false; }
    if (!duration || duration < 10) { showError('songDurationError', 'Valid duration required'); valid = false; }
    if (!valid) return;

    const data = {
      title, artistId, albumId, genre, duration,
      audio: audio || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      cover: cover || 'https://picsum.photos/seed/' + Date.now() + '/300/300'
    };

    if (song) {
      updateSong(song.id, data);
      showToast('Song updated successfully', 'success');
    } else {
      addSong(data);
      showToast('Song added successfully', 'success');
    }

    closeModal();
    renderAdminSongs(document.getElementById('adminPageContainer'));
  });
}

/* ============================================================
   ARTISTS MANAGEMENT
   ============================================================ */
function renderAdminArtists(container) {
  const artists = Storage.getArtists();

  container.innerHTML = `
    <section>
      <div class="admin-toolbar" style="margin-bottom:20px;">
        <div>
          <h2 class="section-title">Manage Artists</h2>
          <p class="section-subtitle">${artists.length} artist(s)</p>
        </div>
        <button class="btn btn-primary" id="addArtistBtn">+ Add Artist</button>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Genre</th><th>Bio</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${artists.length === 0
              ? '<tr><td colspan="5" style="text-align:center;padding:40px;">No artists yet.</td></tr>'
              : artists.map(a => `<tr>
                  <td><img src="${a.image}" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></td>
                  <td>${escapeHtml(a.name)}</td>
                  <td>${escapeHtml(a.genre)}</td>
                  <td>${escapeHtml(a.bio || '—')}</td>
                  <td>
                    <div class="table-actions">
                      <button class="icon-btn edit" data-edit="${a.id}">✏️</button>
                      <button class="icon-btn delete" data-delete="${a.id}">🗑</button>
                    </div>
                  </td>
                </tr>`).join('')
            }
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.getElementById('addArtistBtn').addEventListener('click', () => openArtistModal());

  container.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openArtistModal(btn.dataset.edit));
  });

  container.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirmAction('Delete this artist? Songs will remain but show "Unknown Artist".')) {
        deleteArtist(btn.dataset.delete);
        showToast('Artist deleted', 'success');
        renderAdminArtists(container);
      }
    });
  });
}

function openArtistModal(artistId = null) {
  const artist = artistId ? Storage.getArtists().find(a => a.id === artistId) : null;
  const genres = Storage.getGenres();

  openModal(`
    <h3>${artist ? 'Edit Artist' : 'Add Artist'}</h3>
    <div class="form-group">
      <label>Name</label>
      <input type="text" id="artistName" value="${artist ? escapeHtml(artist.name) : ''}">
      <span class="error-msg" id="artistNameError"></span>
    </div>
    <div class="form-group">
      <label>Genre</label>
      <select id="artistGenre">
        ${genres.map(g => `<option value="${g}" ${artist && artist.genre === g ? 'selected' : ''}>${g}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Bio</label>
      <input type="text" id="artistBio" value="${artist ? escapeHtml(artist.bio || '') : ''}">
    </div>
    <div class="form-group">
      <label>Image URL</label>
      <input type="text" id="artistImage" value="${artist ? escapeHtml(artist.image) : ''}">
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" id="saveArtistBtn">${artist ? 'Update' : 'Add'}</button>
    </div>
  `);

  document.getElementById('saveArtistBtn').addEventListener('click', () => {
    const name = document.getElementById('artistName').value.trim();
    if (!name) { showError('artistNameError', 'Name is required'); return; }

    const data = {
      name,
      genre: document.getElementById('artistGenre').value,
      bio: document.getElementById('artistBio').value.trim(),
      image: document.getElementById('artistImage').value.trim() || 'https://picsum.photos/seed/' + Date.now() + '/200/200'
    };

    if (artist) {
      updateArtist(artist.id, data);
      showToast('Artist updated', 'success');
    } else {
      addArtist(data);
      showToast('Artist added', 'success');
    }
    closeModal();
    renderAdminArtists(document.getElementById('adminPageContainer'));
  });
}

/* ============================================================
   ALBUMS MANAGEMENT
   ============================================================ */
function renderAdminAlbums(container) {
  const albums = Storage.getAlbums();

  container.innerHTML = `
    <section>
      <div class="admin-toolbar" style="margin-bottom:20px;">
        <div>
          <h2 class="section-title">Manage Albums</h2>
          <p class="section-subtitle">${albums.length} album(s)</p>
        </div>
        <button class="btn btn-primary" id="addAlbumBtn">+ Add Album</button>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>Cover</th><th>Title</th><th>Artist</th><th>Year</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${albums.length === 0
              ? '<tr><td colspan="5" style="text-align:center;padding:40px;">No albums yet.</td></tr>'
              : albums.map(a => {
                const artist = getArtistById(a.artistId);
                return `<tr>
                  <td><img src="${a.cover}" alt="" style="width:40px;height:40px;border-radius:6px;object-fit:cover;"></td>
                  <td>${escapeHtml(a.title)}</td>
                  <td>${escapeHtml(artist.name)}</td>
                  <td>${a.year}</td>
                  <td>
                    <div class="table-actions">
                      <button class="icon-btn edit" data-edit="${a.id}">✏️</button>
                      <button class="icon-btn delete" data-delete="${a.id}">🗑</button>
                    </div>
                  </td>
                </tr>`;
              }).join('')
            }
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.getElementById('addAlbumBtn').addEventListener('click', () => openAlbumModal());

  container.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openAlbumModal(btn.dataset.edit));
  });

  container.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirmAction('Delete this album? Songs will remain but show "Unknown Album".')) {
        deleteAlbum(btn.dataset.delete);
        showToast('Album deleted', 'success');
        renderAdminAlbums(container);
      }
    });
  });
}

function openAlbumModal(albumId = null) {
  const album = albumId ? Storage.getAlbums().find(a => a.id === albumId) : null;
  const artists = Storage.getArtists();

  openModal(`
    <h3>${album ? 'Edit Album' : 'Add Album'}</h3>
    <div class="form-group">
      <label>Title</label>
      <input type="text" id="albumTitle" value="${album ? escapeHtml(album.title) : ''}">
      <span class="error-msg" id="albumTitleError"></span>
    </div>
    <div class="form-group">
      <label>Artist</label>
      <select id="albumArtist">
        <option value="">Select artist</option>
        ${artists.map(a => `<option value="${a.id}" ${album && album.artistId === a.id ? 'selected' : ''}>${escapeHtml(a.name)}</option>`).join('')}
      </select>
      <span class="error-msg" id="albumArtistError"></span>
    </div>
    <div class="form-group">
      <label>Year</label>
      <input type="number" id="albumYear" value="${album ? album.year : new Date().getFullYear()}" min="1900" max="2100">
    </div>
    <div class="form-group">
      <label>Cover URL</label>
      <input type="text" id="albumCover" value="${album ? escapeHtml(album.cover) : ''}">
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" id="saveAlbumBtn">${album ? 'Update' : 'Add'}</button>
    </div>
  `);

  document.getElementById('saveAlbumBtn').addEventListener('click', () => {
    clearErrors(['albumTitleError', 'albumArtistError']);
    const title = document.getElementById('albumTitle').value.trim();
    const artistId = document.getElementById('albumArtist').value;
    let valid = true;
    if (!title) { showError('albumTitleError', 'Title is required'); valid = false; }
    if (!artistId) { showError('albumArtistError', 'Select an artist'); valid = false; }
    if (!valid) return;

    const data = {
      title,
      artistId,
      year: parseInt(document.getElementById('albumYear').value),
      cover: document.getElementById('albumCover').value.trim() || 'https://picsum.photos/seed/' + Date.now() + '/300/300'
    };

    if (album) {
      updateAlbum(album.id, data);
      showToast('Album updated', 'success');
    } else {
      addAlbum(data);
      showToast('Album added', 'success');
    }
    closeModal();
    renderAdminAlbums(document.getElementById('adminPageContainer'));
  });
}

/* ============================================================
   USERS MANAGEMENT
   ============================================================ */
function renderAdminUsers(container) {
  const users = Storage.getUsers();
  const playlists = Storage.getPlaylists();

  container.innerHTML = `
    <section>
      <div class="section-header">
        <div>
          <h2 class="section-title">Manage Users</h2>
          <p class="section-subtitle">${users.length} registered user(s)</p>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Role</th>
              <th>Playlists</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => {
              const plCount = playlists.filter(p => p.userId === u.id).length;
              return `<tr>
                <td>${escapeHtml(u.name)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td><span style="text-transform:capitalize;">${u.role}</span></td>
                <td>${plCount}</td>
                <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  ${u.role !== 'admin' ? `
                    <button class="icon-btn delete" data-user-delete="${u.id}" title="Delete user">🗑</button>
                  ` : '<span style="color:var(--text-muted);font-size:12px;">Protected</span>'}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  container.querySelectorAll('[data-user-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirmAction('Delete this user? Their playlists and favorites will also be removed.')) {
        const userId = btn.dataset.userDelete;
        Storage.setUsers(Storage.getUsers().filter(u => u.id !== userId));
        Storage.setPlaylists(Storage.getPlaylists().filter(p => p.userId !== userId));
        Storage.setFavorites(Storage.getFavorites().filter(f => f.userId !== userId));
        Storage.setRecent(Storage.getRecent().filter(r => r.userId !== userId));
        showToast('User deleted', 'success');
        renderAdminUsers(container);
      }
    });
  });
}

/* ============================================================
   GENRES MANAGEMENT
   ============================================================ */
function renderAdminGenres(container) {
  const genres = Storage.getGenres();

  container.innerHTML = `
    <section>
      <div class="admin-toolbar" style="margin-bottom:20px;">
        <div>
          <h2 class="section-title">Manage Genres</h2>
          <p class="section-subtitle">${genres.length} genre(s)</p>
        </div>
        <button class="btn btn-primary" id="addGenreBtn">+ Add Genre</button>
      </div>

      <div class="category-row">
        ${genres.map(g => `
          <div class="category-pill" style="display:flex;align-items:center;gap:8px;">
            ${escapeHtml(g)}
            <button class="icon-btn delete" data-genre-delete="${escapeHtml(g)}"
              style="width:22px;height:22px;font-size:11px;">✕</button>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  document.getElementById('addGenreBtn').addEventListener('click', () => {
    openModal(`
      <h3>Add Genre</h3>
      <div class="form-group">
        <label>Genre Name</label>
        <input type="text" id="genreName" placeholder="e.g., Reggae">
        <span class="error-msg" id="genreNameError"></span>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" id="saveGenreBtn">Add</button>
      </div>
    `);

    document.getElementById('saveGenreBtn').addEventListener('click', () => {
      const name = document.getElementById('genreName').value.trim();
      if (!name) { showError('genreNameError', 'Genre name is required'); return; }
      const genres = Storage.getGenres();
      if (genres.some(g => g.toLowerCase() === name.toLowerCase())) {
        showError('genreNameError', 'Genre already exists');
        return;
      }
      genres.push(name);
      Storage.setGenres(genres);
      closeModal();
      showToast('Genre added', 'success');
      renderAdminGenres(container);
    });
  });

  container.querySelectorAll('[data-genre-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirmAction('Delete this genre?')) {
        const genre = btn.dataset.genreDelete;
        Storage.setGenres(Storage.getGenres().filter(g => g !== genre));
        showToast('Genre deleted', 'success');
        renderAdminGenres(container);
      }
    });
  });
}

// ---------- Initial Render ----------
renderAdminPage();