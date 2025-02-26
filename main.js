// Configuration
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
        this.themeSwitch.addEventListener('click', () => this.toggleTheme());
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

    startHeartRain() {
        const container = document.getElementById('heart-rain');
        
        const createHeart = () => {
            const heart = document.createElement('div');
            heart.className = 'heart-rain';
            heart.innerHTML = '❤️';
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
            container.appendChild(heart);

            heart.addEventListener('animationend', () => heart.remove());
        };

        setInterval(createHeart, 300);
    }

    startParticleEffect() {
        const container = document.getElementById('particles');
        const particles = [];

        const createParticle = (x, y) => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = particle.style.height = Math.random() * 6 + 4 + 'px';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            container.appendChild(particle);
            particles.push({
                element: particle,
                x: x,
                y: y,
                speedX: Math.random() * 4 - 2,
                speedY: Math.random() * 4 - 2
            });
        };

        document.addEventListener('mousemove', (e) => {
            if (particles.length < CONFIG.particleCount) {
                createParticle(e.clientX, e.clientY);
            }
        });

        setInterval(() => {
            particles.forEach((particle, index) => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';

                if (particle.x < 0 || particle.x > window.innerWidth || 
                    particle.y < 0 || particle.y > window.innerHeight) {
                    particle.element.remove();
                    particles.splice(index, 1);
                }
            });
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
            
            img.addEventListener('click', () => this.toggleZoom(img));
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
    window.playlistManager = new PlaylistManager();
    window.galleryManager = new PhotoGalleryManager();
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Une erreur est survenue:', event.error);
});
