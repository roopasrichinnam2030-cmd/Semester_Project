/* ============================================================
   player.js – HTML5 Audio Player
   ============================================================ */

const Player = {
  audio: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,

  init() {
    this.audio = document.getElementById('audioPlayer');
    if (!this.audio) return;

    // Volume
    const vol = document.getElementById('volumeBar');
    this.audio.volume = vol ? parseFloat(vol.value) : 0.8;

    // ---------- Event Listeners ----------
    document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
    document.getElementById('prevBtn').addEventListener('click', () => this.prev());
    document.getElementById('nextBtn').addEventListener('click', () => this.next());

    document.getElementById('progressBar').addEventListener('input', (e) => {
      if (this.audio.duration) {
        this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
      }
    });

    document.getElementById('volumeBar').addEventListener('input', (e) => {
      this.audio.volume = parseFloat(e.target.value);
    });

    document.getElementById('playerFav').addEventListener('click', () => {
      const song = this.getCurrentSong();
      if (!song) return;
      const added = toggleFavorite(song.id);
      document.getElementById('playerFav').classList.toggle('active', added);
      showToast(added ? 'Added to favorites' : 'Removed from favorites', 'success');
      // Refresh page content to reflect favorite state
      if (typeof renderCurrentPage === 'function') renderCurrentPage();
    });

    // Audio events
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.next());
    this.audio.addEventListener('loadedmetadata', () => this.updateProgress());
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      document.getElementById('playBtn').textContent = '⏸';
    });
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      document.getElementById('playBtn').textContent = '▶';
    });
    this.audio.addEventListener('error', () => {
      // Fallback: simulate playback if audio fails
      console.warn('Audio failed to load, using simulated playback');
      this.simulatePlayback();
    });
  },

  // ---------- Load & Play a Song ----------
  loadSong(song, queue = null) {
    if (!song) return;

    this.audio.src = song.audio;
    this.audio.load();

    const artist = getArtistById(song.artistId);

    document.getElementById('playerArt').src = song.cover || artist.image || '';
    document.getElementById('playerTitle').textContent = song.title;
    document.getElementById('playerArtist').textContent = artist.name;
    document.getElementById('playerFav').classList.toggle('active', isFavorite(song.id));

    if (queue) {
      this.queue = queue;
      this.currentIndex = queue.findIndex(s => s.id === song.id);
    } else {
      this.queue = [song];
      this.currentIndex = 0;
    }

    // Track in recently played
    addToRecent(song.id);

    this.play();
  },

  play() {
    const promise = this.audio.play();
    if (promise) {
      promise.catch(() => {
        console.warn('Autoplay blocked or audio failed. Using simulated playback.');
        this.simulatePlayback();
      });
    }
  },

  pause() { this.audio.pause(); },

  togglePlay() {
    if (!this.audio.src || this.currentIndex === -1) {
      // Play first song if nothing loaded
      const songs = Storage.getSongs();
      if (songs.length > 0) this.loadSong(songs[0], songs);
      return;
    }
    if (this.audio.paused) this.play();
    else this.pause();
  },

  next() {
    if (this.queue.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.queue.length;
    this.loadSong(this.queue[this.currentIndex], this.queue);
  },

  prev() {
    if (this.queue.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.queue.length) % this.queue.length;
    this.loadSong(this.queue[this.currentIndex], this.queue);
  },

  updateProgress() {
    const bar = document.getElementById('progressBar');
    const cur = document.getElementById('currentTime');
    const tot = document.getElementById('totalTime');

    if (this.audio.duration && !isNaN(this.audio.duration)) {
      bar.value = (this.audio.currentTime / this.audio.duration) * 100;
      cur.textContent = formatDuration(this.audio.currentTime);
      tot.textContent = formatDuration(this.audio.duration);
    } else {
      // Fallback to song metadata duration
      const song = this.getCurrentSong();
      if (song) tot.textContent = formatDuration(song.duration);
    }
  },

  getCurrentSong() {
    if (this.currentIndex === -1 || !this.queue[this.currentIndex]) return null;
    return this.queue[this.currentIndex];
  },

  // ---------- Simulated playback fallback ----------
  simulatePlayback() {
    // If real audio fails, simulate progress so UI remains functional.
    // This handles offline/demo scenarios gracefully.
    if (this._simInterval) clearInterval(this._simInterval);
    this.isPlaying = true;
    document.getElementById('playBtn').textContent = '⏸';

    let elapsed = 0;
    const song = this.getCurrentSong();
    const total = song ? song.duration : 200;

    this._simInterval = setInterval(() => {
      if (this.audio.paused === false || true) {
        elapsed += 1;
        const bar = document.getElementById('progressBar');
        bar.value = (elapsed / total) * 100;
        document.getElementById('currentTime').textContent = formatDuration(elapsed);
        document.getElementById('totalTime').textContent = formatDuration(total);
        if (elapsed >= total) {
          clearInterval(this._simInterval);
          this.next();
        }
      }
    }, 1000);
  }
};