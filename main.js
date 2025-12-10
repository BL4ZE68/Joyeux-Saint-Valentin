
const CONFIG = {
    valentineDate: new Date("February 14, 2025 00:00:00"),
    confettiCount: 50,
    confettiColors: ['#ff3f6d', '#ff87a2', '#ffb6c1', '#ffd1dc', '#ffffff'],
    particleCount: 15,
    playlist: [
        {
            title: "Slimane - Des milliers de Je t'aime",
            file: "Slimane Des milliers de Je t'aime.mp3"
        },
        {
            title: "Ed Sheeran - Perfect",
            file: "perfect.mp3"
        },
        {
            title: "John Legend - All of Me",
            file: "all-of-me.mp3"
        }
    ],
    photos: [
        { src: './img/Photo1.jpg', alt: 'Notre premier moment ensemble' },
        { src: './img/Photo2.jpg', alt: 'Un doux souvenir partagé' },
        { src: './img/photo3.jpg', alt: 'Un moment de bonheur' },
        { src: './img/photo4.jpg', alt: 'Un instant précieux' },
        { src: './img/Photo5.jpg', alt: 'Notre amour en image' }
    ]
};

// Gestionnaire du thème
class ThemeManager {
    constructor() {
        this.themeSwitch = document.querySelector('.theme-switch');
        this.isDark = false;
        this.init();
    }

    init() {
        if (this.themeSwitch) {
            // Make sure it's keyboard focusable
            if (!this.themeSwitch.hasAttribute('tabindex')) this.themeSwitch.setAttribute('tabindex', '0');
            this.themeSwitch.addEventListener('click', () => this.toggleTheme());
            this.themeSwitch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }

        // Vérifier la préférence système
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.toggleTheme();
        }
    }

    toggleTheme() {
        this.isDark = !this.isDark;
        document.body.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
        this.themeSwitch.textContent = this.isDark ? '☀️' : '🌙';
    }
}

// Gestionnaire du compte à rebours
class CountdownManager {
    constructor() {
        this.element = document.getElementById('dynamicDate');
        this.interval = setInterval(() => this.updateCountdown(), 1000);
        this.updateCountdown();
    }

    updateCountdown() {
        const now = new Date().getTime();
        const diff = CONFIG.valentineDate.getTime() - now;

        if (diff < 0) {
            this.element.innerHTML = "C'est le jour J ! Je t'aime ! ❤️";
            clearInterval(this.interval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        this.element.innerHTML = `Plus que ${days} jours et ${hours} heures avant de te le dire en vrai !`;
    }
}

// Gestionnaire de la lettre d'amour
class LoveLetterManager {
    constructor() {
        this.letter = document.getElementById('loveLetter');
        this.button = document.getElementById('revealBtn');
        this.isRevealed = false;
        this._boundReveal = () => this.reveal();
        this._handleKey = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.reveal();
            }
        };
    }
    reveal() {
        if (this.isRevealed) return;
        
        this.isRevealed = true;
        this.letter.classList.remove('hidden');
        this.letter.style.display = 'block';
        
        setTimeout(() => {
            this.letter.style.opacity = '1';
            this.button.style.display = 'none';
            document.body.style.background = 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))';
            
            // Démarrer les effets
            this.startHeartRain();
            this.startParticleEffect();
            playlistManager.play();
        }, 100);

        // Mise à jour des attributs ARIA
        this.letter.setAttribute('aria-hidden', 'false');
        this.button.setAttribute('aria-expanded', 'true');
    }

    // Attach accessible event handlers (click + keyboard)
    attachHandlers() {
        if (!this.button) return;
        this.button.addEventListener('click', this._boundReveal);
        this.button.addEventListener('keydown', this._handleKey);
    }

    startHeartRain() {
        const container = document.getElementById('heart-rain');
        if (!container) return;

        // Prevent multiple intervals
        if (this.heartInterval) return;

        const createHeart = () => {
            const heart = document.createElement('div');
            heart.className = 'heart-rain';
            heart.innerHTML = '❤️';
            heart.style.left = Math.random() * 100 + 'vw';
            const duration = (Math.random() * 3 + 2);
            heart.style.animationDuration = duration + 's';
            container.appendChild(heart);

            // Ensure removal in case animationend doesn't fire
            const removeTimeout = setTimeout(() => {
                if (heart.parentNode) heart.remove();
            }, (duration + 1) * 1000);

            heart.addEventListener('animationend', () => {
                clearTimeout(removeTimeout);
                heart.remove();
            });
        };

        // Spawn less frequently for performance
        this.heartInterval = setInterval(createHeart, 700);
    }

    startParticleEffect() {
        const container = document.getElementById('particles');
        if (!container) return;

        if (this._particleInitialized) return;
        this._particleInitialized = true;

        const particles = [];

        const createParticle = (x, y) => {
            if (particles.length >= CONFIG.particleCount) return;

            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 6 + 4;
            particle.style.width = particle.style.height = size + 'px';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            container.appendChild(particle);

            const obj = {
                element: particle,
                x: x,
                y: y,
                speedX: Math.random() * 4 - 2,
                speedY: Math.random() * 4 - 2,
                createdAt: Date.now()
            };
            particles.push(obj);

            // Ensure particle is removed after a short lifetime
            setTimeout(() => {
                if (obj.element.parentNode) obj.element.remove();
                const idx = particles.indexOf(obj);
                if (idx > -1) particles.splice(idx, 1);
            }, 4000);
        };

        const mouseHandler = (e) => {
            if (particles.length < CONFIG.particleCount) {
                createParticle(e.clientX, e.clientY);
            }
        };

        document.addEventListener('mousemove', mouseHandler);

        setInterval(() => {
            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';

                if (particle.x < -50 || particle.x > window.innerWidth + 50 ||
                    particle.y < -50 || particle.y > window.innerHeight + 50) {
                    if (particle.element.parentNode) particle.element.remove();
                    particles.splice(i, 1);
                }
            }
        }, 16);
    }
}

// Gestionnaire de la playlist
class PlaylistManager {
    constructor() {
        this.currentTrack = 0;
        this.isPlaying = false;
        this.audio = new Audio();
        this.initializeControls();
    }

    initializeControls() {
        this.playPauseBtn = document.getElementById('playPause');
        this.prevBtn = document.getElementById('prevSong');
        this.nextBtn = document.getElementById('nextSong');
        this.songInfo = document.getElementById('currentSong');
        this.progress = document.querySelector('.progress');

        // Accessibility: expose pressed state
        if (this.playPauseBtn) this.playPauseBtn.setAttribute('aria-pressed', String(this.isPlaying));

        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.nextTrack());

        this.loadTrack(0);
    }

    loadTrack(index) {
        this.currentTrack = index;
        this.audio.src = CONFIG.playlist[index].file;
        this.songInfo.textContent = CONFIG.playlist[index].title;
        this.updatePlayPauseButton();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        this.audio.play().catch(error => {
            console.log('Lecture automatique bloquée:', error);
        });
        this.updatePlayPauseButton();
    }

    pause() {
        this.isPlaying = false;
        this.audio.pause();
        this.updatePlayPauseButton();
    }

    previousTrack() {
        this.currentTrack = (this.currentTrack - 1 + CONFIG.playlist.length) % CONFIG.playlist.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) this.play();
    }

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % CONFIG.playlist.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) this.play();
    }

    updateProgress() {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.progress.style.width = progress + '%';
    }

    updatePlayPauseButton() {
        this.playPauseBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
        if (this.playPauseBtn) this.playPauseBtn.setAttribute('aria-pressed', String(this.isPlaying));
    }
}

// Gestionnaire de la galerie photo
class PhotoGalleryManager {
    constructor() {
        this.gallery = document.getElementById('photoGallery');
        this.initializeGallery();
    }

    initializeGallery() {
        CONFIG.photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = photo.alt;
            img.loading = 'lazy';
            // Make images keyboard accessible
            img.tabIndex = 0;
            img.addEventListener('click', () => this.toggleZoom(img));
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleZoom(img);
                }
            });
            this.gallery.appendChild(img);
        });
    }

    toggleZoom(img) {
        const isZoomed = img.style.transform === 'scale(1.5)';
        img.style.transform = isZoomed ? '' : 'scale(1.5)';
        img.style.zIndex = isZoomed ? '' : '2';
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.countdownManager = new CountdownManager();
    window.loveLetterManager = new LoveLetterManager();
    // Attach accessible handlers for the reveal button
    if (window.loveLetterManager && typeof window.loveLetterManager.attachHandlers === 'function') {
        window.loveLetterManager.attachHandlers();
    }
    window.playlistManager = new PlaylistManager();
    window.galleryManager = new PhotoGalleryManager();
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Une erreur est survenue:', event.error);
});
