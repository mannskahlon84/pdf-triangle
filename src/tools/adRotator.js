// Dynamic Affiliate Ad Rotator
// Randomizes affiliate banners across all ad slots on page load, view navigation, and timed interval.

const AFFILIATE_ADS = [
  {
    advertiser: 'Aliexpress FR',
    href: 'https://www.awin1.com/cread.php?s=4787690&v=26009&q=605862&r=2988755',
    img: 'https://www.awin1.com/cshow.php?s=4787690&v=26009&q=605862&r=2988755',
    alt: 'Aliexpress FR - Banner 1'
  },
  {
    advertiser: 'Aliexpress FR',
    href: 'https://www.awin1.com/cread.php?s=3205355&v=26009&q=443806&r=2988755',
    img: 'https://www.awin1.com/cshow.php?s=3205355&v=26009&q=443806&r=2988755',
    alt: 'Aliexpress FR - Banner 2'
  },
  {
    advertiser: 'Bonheur Jewelry',
    href: 'https://www.awin1.com/cread.php?s=4814274&v=90759&q=554223&r=2988755',
    img: 'https://www.awin1.com/cshow.php?s=4814274&v=90759&q=554223&r=2988755',
    alt: 'Bonheur Jewelry - Banner 1'
  },
  {
    advertiser: 'Bonheur Jewelry',
    href: 'https://www.awin1.com/cread.php?s=4547926&v=90759&q=554223&r=2988755',
    img: 'https://www.awin1.com/cshow.php?s=4547926&v=90759&q=554223&r=2988755',
    alt: 'Bonheur Jewelry - Banner 2'
  },
  {
    advertiser: 'Bonheur Jewelry',
    href: 'https://www.awin1.com/cread.php?s=4547896&v=90759&q=554223&r=2988755',
    img: 'https://www.awin1.com/cshow.php?s=4547896&v=90759&q=554223&r=2988755',
    alt: 'Bonheur Jewelry - Banner 3'
  },
  {
    advertiser: 'Bonheur Jewelry',
    href: 'https://www.awin1.com/cread.php?s=4547850&v=90759&q=554223&r=2988755',
    img: 'https://www.awin1.com/cshow.php?s=4547850&v=90759&q=554223&r=2988755',
    alt: 'Bonheur Jewelry - Banner 4'
  },
  {
    advertiser: 'Alibaba US',
    href: 'https://www.awin1.com/cread.php?s=2437229&v=17940&q=368341&r=2988755',
    img: 'https://www.awin1.com/cshow.php?s=2437229&v=17940&q=368341&r=2988755',
    alt: 'Alibaba US - Banner 1'
  }
];

/**
 * Shuffles an array randomly using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Rotates ads randomly across all .ad-banner-slot elements on the page.
 * Each slot receives a different random subset of banners in random order.
 */
export function rotateAffiliateAds() {
  const adSlots = document.querySelectorAll('.ad-banner-slot');
  if (!adSlots || adSlots.length === 0) return;

  adSlots.forEach((slot, idx) => {
    // Shuffle all available ads randomly
    const shuffled = shuffleArray(AFFILIATE_ADS);
    
    // Pick 2 or 3 random ads per slot so every container looks rich and different
    const count = Math.floor(Math.random() * 2) + 2; // 2 or 3 ads
    const selectedAds = shuffled.slice(0, count);

    // Build responsive HTML for this slot
    const adsHtml = selectedAds.map(ad => `
      <!-- START ADVERTISER: ${ad.advertiser} from awin.com -->
      <a rel="sponsored" href="${ad.href}" target="_blank" class="affiliate-ad-card" style="display: inline-block; transition: transform 0.2s ease, opacity 0.3s ease; text-decoration: none;">
        <img src="${ad.img}" border="0" alt="${ad.alt}" style="max-width: 100%; height: auto; border-radius: var(--border-radius-sm); box-shadow: var(--shadow-sm); display: block;">
      </a>
      <!-- END ADVERTISER: ${ad.advertiser} from awin.com -->
    `).join('');

    // Apply smooth fade effect when rotating
    slot.style.transition = 'opacity 0.25s ease-in-out';
    slot.style.opacity = '0';
    
    setTimeout(() => {
      slot.innerHTML = adsHtml;
      slot.style.opacity = '1';
    }, 200);
  });
}

/**
 * Initializes the Ad Rotator and starts automatic periodic rotation
 */
export function initAdRotator() {
  // Rotate immediately on startup
  rotateAffiliateAds();

  // Automatically rotate ads every 30 seconds so visitors see fresh ads dynamically
  setInterval(() => {
    rotateAffiliateAds();
  }, 30000);
}
