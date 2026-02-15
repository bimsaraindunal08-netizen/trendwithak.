// Initialize AOS Animation Library
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Mobile Menu Toggle
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        if (navLinks.style.display === 'flex') {
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(10, 10, 10, 0.95)';
            navLinks.style.padding = '20px';
            navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            }
        });
    });
}

// TikTok Stats Configuration
const TIKTOK_USERNAME = 'trendwithak';
// FALLBACK values based on typical known stats or estimated if fetch fails
const FALLBACK_STATS = {
    followers: '99.4K',
    likes: '884.5',
    following: '79'
};

async function fetchTikTokStats() {
    try {
        console.log('Fetching TikTok stats...');
        // Attempting to fetch via a CORS proxy (allorigins.win)
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.tiktok.com/@${TIKTOK_USERNAME}`)}`);
        const data = await response.json();

        if (data.contents) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');

            // Selecting elements based on common TikTok meta tags
            // <meta property="og:description" content="... 2.4M Followers, 15.2M Likes ...">
            const metaDesc = doc.querySelector('meta[property="og:description"]');

            if (metaDesc) {
                const content = metaDesc.getAttribute('content');
                console.log('Meta Description Found:', content);

                // Regex to extract numbers. Supports "100", "10.5K", "1.2M", "1B"
                // Example content: "Trend with AK (@trendwithak) on TikTok | 15.2M Likes. 2.4M Followers. ..."
                const likesMatch = content.match(/([\d\.]+[KMB]?)\s+Likes/i);
                const followersMatch = content.match(/([\d\.]+[KMB]?)\s+Followers/i);

                const newStats = {
                    likes: likesMatch ? likesMatch[1] : FALLBACK_STATS.likes,
                    followers: followersMatch ? followersMatch[1] : FALLBACK_STATS.followers,
                    following: FALLBACK_STATS.following // Meta doesn't have following
                };

                updateStats(newStats);
            } else {
                console.warn('Meta description not found, using known fallbacks');
                updateStats(FALLBACK_STATS);
            }
        } else {
            throw new Error('No content returned from proxy');
        }
    } catch (error) {
        console.warn('Failed to fetch live TikTok stats:', error);
        updateStats(FALLBACK_STATS);
    }
}

// Call on load
fetchTikTokStats();

// Update every 60 seconds to keep "linked"
setInterval(fetchTikTokStats, 60000);

// Stats Counter Animation
const stats = document.querySelectorAll('.stat-card h3');
let animated = false;

window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    const sectionTop = statsSection.offsetTop - window.innerHeight + 100;

    if (window.pageYOffset > sectionTop && !animated) {
        animated = true;
        // Optional: Add a simple count-up animation logic here if numbers are pure integers
    }
});

// Load data from admin panel (localStorage)
function loadWebsiteData() {
    const data = JSON.parse(localStorage.getItem('websiteData') || '{}');

    // Update profile image
    if (data.profileImage) {
        const profileImg = document.querySelector('.profile-badge img');
        if (profileImg) profileImg.src = data.profileImage;
    }

    // Update TikTok links
    if (data.tiktokProfileUrl) {
        document.querySelectorAll('a[href*="tiktok.com/@"]').forEach(link => {
            if (!link.href.includes('/video/')) {
                link.href = data.tiktokProfileUrl;
            }
        });
    }

    // Update stats
    if (data.followersCount) {
        const followersEl = document.getElementById('stat-followers');
        if (followersEl) followersEl.textContent = data.followersCount;
    }
    if (data.likesCount) {
        const likesEl = document.getElementById('stat-likes');
        if (likesEl) likesEl.textContent = data.likesCount;
    }
    if (data.followingCount) {
        const followingEl = document.getElementById('stat-following');
        if (followingEl) followingEl.textContent = data.followingCount;
    }

    // Update videos
    const galleryItems = document.querySelectorAll('.gallery-item');
    for (let i = 1; i <= 3; i++) {
        const videoIndex = i - 1;
        if (galleryItems[videoIndex]) {
            const item = galleryItems[videoIndex];
            
            // Update link
            if (data[`video${i}Link`]) {
                item.href = data[`video${i}Link`];
            }
            
            // Update thumbnail
            if (data[`video${i}Thumbnail`]) {
                const img = item.querySelector('img');
                if (img) img.src = data[`video${i}Thumbnail`];
            }
            
            // Update title
            if (data[`video${i}Title`]) {
                const title = item.querySelector('.overlay-info h4');
                if (title) title.textContent = data[`video${i}Title`];
            }
            
            // Update views
            if (data[`video${i}Views`]) {
                const views = item.querySelector('.overlay-info p');
                if (views) views.textContent = data[`video${i}Views`];
            }
        }
    }

    // Update contact email
    if (data.contactEmail) {
        const emailLink = document.querySelector('a[href^="mailto:"]');
        if (emailLink) emailLink.href = `mailto:${data.contactEmail}`;
    }

    // Update social links
    const socialLinks = document.querySelectorAll('.social-icon');
    socialLinks.forEach(link => {
        if (link.href.includes('instagram') && data.instagramUrl) {
            link.href = data.instagramUrl;
        } else if (link.href.includes('twitter') && data.twitterUrl) {
            link.href = data.twitterUrl;
        } else if (link.href.includes('youtube') && data.youtubeUrl) {
            link.href = data.youtubeUrl;
        }
    });
}

// Load website data on page load
document.addEventListener('DOMContentLoaded', loadWebsiteData);
