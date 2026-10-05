/* ============================================================
   music.js – Music data management (songs, artists, albums)
   ============================================================ */

// ---------- Songs CRUD ----------
function addSong(songData) {
  const songs = Storage.getSongs();
  const newSong = {
    id: generateId('song'),
    ...songData,
    createdAt: new Date().toISOString()
  };
  songs.push(newSong);
  Storage.setSongs(songs);
  return newSong;
}

function updateSong(id, updates) {
  const songs = Storage.getSongs();
  const idx = songs.findIndex(s => s.id === id);
  if (idx === -1) return null;
  songs[idx] = { ...songs[idx], ...updates, updatedAt: new Date().toISOString() };
  Storage.setSongs(songs);
  return songs[idx];
}

function deleteSong(id) {
  const songs = Storage.getSongs().filter(s => s.id !== id);
  Storage.setSongs(songs);

  // Clean up references in playlists and favorites
  const playlists = Storage.getPlaylists().map(p => ({
    ...p,
    songs: p.songs.filter(sid => sid !== id)
  }));
  Storage.setPlaylists(playlists);
  Storage.setFavorites(Storage.getFavorites().filter(f => f.songId !== id));
  return true;
}

// ---------- Artists CRUD ----------
function addArtist(data) {
  const artists = Storage.getArtists();
  const newArtist = { id: generateId('art'), ...data };
  artists.push(newArtist);
  Storage.setArtists(artists);
  return newArtist;
}

function updateArtist(id, updates) {
  const artists = Storage.getArtists();
  const idx = artists.findIndex(a => a.id === id);
  if (idx === -1) return null;
  artists[idx] = { ...artists[idx], ...updates };
  Storage.setArtists(artists);
  return artists[idx];
}

function deleteArtist(id) {
  Storage.setArtists(Storage.getArtists().filter(a => a.id !== id));
  return true;
}

// ---------- Albums CRUD ----------
function addAlbum(data) {
  const albums = Storage.getAlbums();
  const newAlbum = { id: generateId('alb'), ...data };
  albums.push(newAlbum);
  Storage.setAlbums(albums);
  return newAlbum;
}

function updateAlbum(id, updates) {
  const albums = Storage.getAlbums();
  const idx = albums.findIndex(a => a.id === id);
  if (idx === -1) return null;
  albums[idx] = { ...albums[idx], ...updates };
  Storage.setAlbums(albums);
  return albums[idx];
}

function deleteAlbum(id) {
  Storage.setAlbums(Storage.getAlbums().filter(a => a.id !== id));
  return true;
}

// ---------- Lookup Helpers ----------
function getArtistById(id) {
  return Storage.getArtists().find(a => a.id === id) || { name: 'Unknown Artist', image: '' };
}

function getAlbumById(id) {
  return Storage.getAlbums().find(a => a.id === id) || { title: 'Unknown Album', cover: '' };
}

function getSongById(id) {
  return Storage.getSongs().find(s => s.id === id);
}

// ---------- Search ----------
function searchSongs(query) {
  const q = query.trim().toLowerCase();
  if (!q) return { songs: [], artists: [], albums: [] };

  const songs = Storage.getSongs();
  const artists = Storage.getArtists();
  const albums = Storage.getAlbums();

  return {
    songs: songs.filter(s => {
      const artist = getArtistById(s.artistId);
      return s.title.toLowerCase().includes(q) ||
             artist.name.toLowerCase().includes(q) ||
             s.genre.toLowerCase().includes(q);
    }),
    artists: artists.filter(a => a.name.toLowerCase().includes(q)),
    albums: albums.filter(a => a.title.toLowerCase().includes(q))
  };
}

// ---------- Favorites ----------
function toggleFavorite(songId) {
  const session = getCurrentUser();
  if (!session) return false;

  let favorites = Storage.getFavorites();
  const idx = favorites.findIndex(f => f.songId === songId && f.userId === session.userId);

  if (idx === -1) {
    favorites.push({ userId: session.userId, songId, addedAt: new Date().toISOString() });
    Storage.setFavorites(favorites);
    return true; // added
  } else {
    favorites.splice(idx, 1);
    Storage.setFavorites(favorites);
    return false; // removed
  }
}

function isFavorite(songId) {
  const session = getCurrentUser();
  if (!session) return false;
  return Storage.getFavorites().some(f => f.songId === songId && f.userId === session.userId);
}

function getUserFavorites() {
  const session = getCurrentUser();
  if (!session) return [];
  const favIds = Storage.getFavorites()
    .filter(f => f.userId === session.userId)
    .map(f => f.songId);
  return Storage.getSongs().filter(s => favIds.includes(s.id));
}

// ---------- Recently Played ----------
function addToRecent(songId) {
  const session = getCurrentUser();
  if (!session) return;

  let recent = Storage.getRecent();
  recent = recent.filter(r => !(r.songId === songId && r.userId === session.userId));
  recent.unshift({ userId: session.userId, songId, playedAt: new Date().toISOString() });
  recent = recent.slice(0, 50);
  Storage.setRecent(recent);
}

function getRecentSongs(limit = 8) {
  const session = getCurrentUser();
  if (!session) return [];
  const recentIds = Storage.getRecent()
    .filter(r => r.userId === session.userId)
    .map(r => r.songId)
    .slice(0, limit);
  return recentIds.map(id => getSongById(id)).filter(Boolean);
}

// ---------- Playlists ----------
function createPlaylist(name) {
  const session = getCurrentUser();
  if (!session) return null;

  const playlists = Storage.getPlaylists();
  const newPlaylist = {
    id: generateId('pl'),
    name: name.trim(),
    userId: session.userId,
    songs: [],
    createdAt: new Date().toISOString()
  };
  playlists.push(newPlaylist);
  Storage.setPlaylists(playlists);
  return newPlaylist;
}

function addToPlaylist(playlistId, songId) {
  const playlists = Storage.getPlaylists();
  const pl = playlists.find(p => p.id === playlistId);
  if (!pl) return false;
  if (!pl.songs.includes(songId)) {
    pl.songs.push(songId);
    Storage.setPlaylists(playlists);
  }
  return true;
}

function removeFromPlaylist(playlistId, songId) {
  const playlists = Storage.getPlaylists();
  const pl = playlists.find(p => p.id === playlistId);
  if (!pl) return false;
  pl.songs = pl.songs.filter(s => s !== songId);
  Storage.setPlaylists(playlists);
  return true;
}

function deletePlaylist(playlistId) {
  Storage.setPlaylists(Storage.getPlaylists().filter(p => p.id !== playlistId));
  return true;
}

function getUserPlaylists() {
  const session = getCurrentUser();
  if (!session) return [];
  return Storage.getPlaylists().filter(p => p.userId === session.userId);
}

// ---------- Formatting ----------
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}