/* ============================================================
   storage.js – Local Storage utilities + Sample Data Seeding
   Telugu Music Edition 🎵
   ============================================================ */

// ---------- Storage Keys ----------
const KEYS = {
  USERS: 'tunewave_users',
  SESSION: 'tunewave_session',
  SONGS: 'tunewave_songs',
  ARTISTS: 'tunewave_artists',
  ALBUMS: 'tunewave_albums',
  PLAYLISTS: 'tunewave_playlists',
  FAVORITES: 'tunewave_favorites',
  RECENT: 'tunewave_recent',
  GENRES: 'tunewave_genres',
  SEEDED: 'tunewave_seeded'
};

// ---------- Generic Storage Helpers ----------
function getData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Storage read error:', key, e);
    return fallback;
  }
}

function setData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Storage write error:', key, e);
    return false;
  }
}

function removeData(key) {
  localStorage.removeItem(key);
}

// ---------- ID Generator ----------
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ============================================================
   SAMPLE DATA SEEDING — TELUGU EDITION
   Runs once on first application open.
   ============================================================ */
function seedData() {
  if (localStorage.getItem(KEYS.SEEDED)) return;

  // ---------- Genres (Telugu film music categories) ----------
  const genres = [
    'Tollywood',
    'Melody',
    'Mass',
    'Folk',
    'Devotional',
    'Classical',
    'Item Song',
    'Romantic'
  ];

  // ---------- Artists (Telugu playback singers & composers) ----------
  const artists = [
    {
      id: 'art_1',
      name: 'S. P. Balasubrahmanyam',
      genre: 'Melody',
      image: 'https://picsum.photos/seed/spb/200/200',
      bio: 'Legendary Telugu playback singer with over 40,000 songs'
    },
    {
      id: 'art_2',
      name: 'K. S. Chithra',
      genre: 'Melody',
      image: 'https://picsum.photos/seed/chithra/200/200',
      bio: 'Nightingle of South India – iconic female playback singer'
    },
    {
      id: 'art_3',
      name: 'A. R. Rahman',
      genre: 'Classical',
      image: 'https://picsum.photos/seed/arr/200/200',
      bio: 'Oscar-winning music composer and director'
    },
    {
      id: 'art_4',
      name: 'Devi Sri Prasad',
      genre: 'Mass',
      image: 'https://picsum.photos/seed/dsp/200/200',
      bio: 'Rockstar composer known for mass beats'
    },
    {
      id: 'art_5',
      name: 'M. M. Keeravani',
      genre: 'Classical',
      image: 'https://picsum.photos/seed/mmk/200/200',
      bio: 'Oscar-winning composer of Naatu Naatu fame'
    },
    {
      id: 'art_6',
      name: 'Sid Sriram',
      genre: 'Romantic',
      image: 'https://picsum.photos/seed/sid/200/200',
      bio: 'Modern playback singer and composer'
    },
    {
      id: 'art_7',
      name: 'Shreya Ghoshal',
      genre: 'Romantic',
      image: 'https://picsum.photos/seed/shreya/200/200',
      bio: 'Versatile playback singer across Indian languages'
    },
    {
      id: 'art_8',
      name: 'Thaman S',
      genre: 'Mass',
      image: 'https://picsum.photos/seed/thaman/200/200',
      bio: 'Energetic composer for Telugu cinema'
    }
  ];

  // ---------- Albums (Iconic Telugu albums) ----------
  const albums = [
    {
      id: 'alb_1',
      title: 'Baahubali – The Beginning',
      artistId: 'art_5',
      year: 2015,
      cover: 'https://picsum.photos/seed/baahubali1/300/300'
    },
    {
      id: 'alb_2',
      title: 'RRR',
      artistId: 'art_5',
      year: 2022,
      cover: 'https://picsum.photos/seed/rrr/300/300'
    },
    {
      id: 'alb_3',
      title: 'Pushpa – The Rise',
      artistId: 'art_4',
      year: 2021,
      cover: 'https://picsum.photos/seed/pushpa/300/300'
    },
    {
      id: 'alb_4',
      title: 'Ala Vaikunthapurramuloo',
      artistId: 'art_8',
      year: 2020,
      cover: 'https://picsum.photos/seed/ala/300/300'
    },
    {
      id: 'alb_5',
      title: 'Geetha Govindam',
      artistId: 'art_6',
      year: 2018,
      cover: 'https://picsum.photos/seed/geetha/300/300'
    },
    {
      id: 'alb_6',
      title: 'Magadheera',
      artistId: 'art_5',
      year: 2009,
      cover: 'https://picsum.photos/seed/magadheera/300/300'
    }
  ];

  // ---------- Songs (Telugu tracks) ----------
  // Note: Audio URLs point to SoundHelix sample MP3s since we cannot
  // host copyrighted Telugu audio. Titles/artists are authentic Telugu songs
  // for demonstration purposes. In production, replace with licensed audio.
  const songs = [
    // Baahubali
    {
      id: 'song_1',
      title: 'Dhivara',
      artistId: 'art_5',
      albumId: 'alb_1',
      genre: 'Melody',
      duration: 340,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      cover: 'https://picsum.photos/seed/baahubali1/300/300'
    },
    {
      id: 'song_2',
      title: 'Manohari',
      artistId: 'art_5',
      albumId: 'alb_1',
      genre: 'Romantic',
      duration: 245,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      cover: 'https://picsum.photos/seed/baahubali1/300/300'
    },

    // RRR
    {
      id: 'song_3',
      title: 'Naatu Naatu',
      artistId: 'art_5',
      albumId: 'alb_2',
      genre: 'Mass',
      duration: 275,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      cover: 'https://picsum.photos/seed/rrr/300/300'
    },
    {
      id: 'song_4',
      title: 'Komuram Bheemudo',
      artistId: 'art_5',
      albumId: 'alb_2',
      genre: 'Folk',
      duration: 265,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      cover: 'https://picsum.photos/seed/rrr/300/300'
    },

    // Pushpa
    {
      id: 'song_5',
      title: 'Srivalli',
      artistId: 'art_4',
      albumId: 'alb_3',
      genre: 'Romantic',
      duration: 228,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      cover: 'https://picsum.photos/seed/pushpa/300/300'
    },
    {
      id: 'song_6',
      title: 'Oo Antava Oo Oo Antava',
      artistId: 'art_4',
      albumId: 'alb_3',
      genre: 'Item Song',
      duration: 232,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      cover: 'https://picsum.photos/seed/pushpa/300/300'
    },

    // Ala Vaikunthapurramuloo
    {
      id: 'song_7',
      title: 'Butta Bomma',
      artistId: 'art_8',
      albumId: 'alb_4',
      genre: 'Romantic',
      duration: 218,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      cover: 'https://picsum.photos/seed/ala/300/300'
    },
    {
      id: 'song_8',
      title: 'Ramuloo Ramulaa',
      artistId: 'art_8',
      albumId: 'alb_4',
      genre: 'Mass',
      duration: 245,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      cover: 'https://picsum.photos/seed/ala/300/300'
    },

    // Geetha Govindam
    {
      id: 'song_9',
      title: 'Inkem Inkem Inkem Kaavaale',
      artistId: 'art_6',
      albumId: 'alb_5',
      genre: 'Melody',
      duration: 268,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      cover: 'https://picsum.photos/seed/geetha/300/300'
    },
    {
      id: 'song_10',
      title: 'Yenti Yenti',
      artistId: 'art_6',
      albumId: 'alb_5',
      genre: 'Romantic',
      duration: 205,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
      cover: 'https://picsum.photos/seed/geetha/300/300'
    },

    // Magadheera
    {
      id: 'song_11',
      title: 'Dheera Dheera',
      artistId: 'art_5',
      albumId: 'alb_6',
      genre: 'Folk',
      duration: 295,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
      cover: 'https://picsum.photos/seed/magadheera/300/300'
    },
    {
      id: 'song_12',
      title: 'Bangaru Kodipetta',
      artistId: 'art_5',
      albumId: 'alb_6',
      genre: 'Folk',
      duration: 258,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
      cover: 'https://picsum.photos/seed/magadheera/300/300'
    },

    // Extra classic melodies
    {
      id: 'song_13',
      title: 'Ye Maaya Chesave',
      artistId: 'art_3',
      albumId: 'alb_5',
      genre: 'Melody',
      duration: 302,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
      cover: 'https://picsum.photos/seed/ye/300/300'
    },
    {
      id: 'song_14',
      title: 'Kun Faya Kun',
      artistId: 'art_3',
      albumId: 'alb_5',
      genre: 'Devotional',
      duration: 320,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
      cover: 'https://picsum.photos/seed/kun/300/300'
    },
    {
      id: 'song_15',
      title: 'Chinna Chinna Aasai',
      artistId: 'art_2',
      albumId: 'alb_6',
      genre: 'Melody',
      duration: 285,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
      cover: 'https://picsum.photos/seed/chinna/300/300'
    },
    {
      id: 'song_16',
      title: 'Mukkala Mukkabula',
      artistId: 'art_1',
      albumId: 'alb_6',
      genre: 'Mass',
      duration: 268,
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
      cover: 'https://picsum.photos/seed/mukkala/300/300'
    }
  ];

  // ---------- Demo Admin + User Accounts ----------
  const users = [
    {
      id: 'user_admin',
      name: 'Administrator',
      email: 'admin@tunewave.com',
      password: 'Admin@123',
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_demo',
      name: 'Demo User',
      email: 'user@tunewave.com',
      password: 'User@123',
      role: 'user',
      createdAt: new Date().toISOString()
    }
  ];

  setData(KEYS.GENRES, genres);
  setData(KEYS.ARTISTS, artists);
  setData(KEYS.ALBUMS, albums);
  setData(KEYS.SONGS, songs);
  setData(KEYS.USERS, users);
  setData(KEYS.PLAYLISTS, []);
  setData(KEYS.FAVORITES, []);
  setData(KEYS.RECENT, []);

  localStorage.setItem(KEYS.SEEDED, 'true');
  console.log('🎵 TuneWave Telugu sample data seeded successfully!');
}

// ---------- Convenience Getters/Setters ----------
const Storage = {
  getUsers: () => getData(KEYS.USERS, []),
  setUsers: (u) => setData(KEYS.USERS, u),
  getSongs: () => getData(KEYS.SONGS, []),
  setSongs: (s) => setData(KEYS.SONGS, s),
  getArtists: () => getData(KEYS.ARTISTS, []),
  setArtists: (a) => setData(KEYS.ARTISTS, a),
  getAlbums: () => getData(KEYS.ALBUMS, []),
  setAlbums: (a) => setData(KEYS.ALBUMS, a),
  getPlaylists: () => getData(KEYS.PLAYLISTS, []),
  setPlaylists: (p) => setData(KEYS.PLAYLISTS, p),
  getFavorites: () => getData(KEYS.FAVORITES, []),
  setFavorites: (f) => setData(KEYS.FAVORITES, f),
  getRecent: () => getData(KEYS.RECENT, []),
  setRecent: (r) => setData(KEYS.RECENT, r),
  getGenres: () => getData(KEYS.GENRES, []),
  setGenres: (g) => setData(KEYS.GENRES, g)
};