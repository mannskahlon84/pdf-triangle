// Dynamic Partner & Affiliate Ad Rotator
// Randomizes partner banners across all showcase slots on page load, view navigation, and timed interval.
// Designed with adblocker-resilient class names and always-visible CTA buttons so offers display even if image ads are filtered.

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
  },
  {
    advertiser: 'Alibaba US',
    href: 'https://www.awin1.com/cread.php?s=2503042&v=17940&q=375248&r=2988755',
    img: 'https://www.awin1.com/cshow.php?s=2503042&v=17940&q=375248&r=2988755',
    alt: 'Alibaba US - Banner 2'
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
 * Rotates ads randomly across all partner showcase / ad slots on the page.
 * Each slot receives a different random subset of banners in random order.
 */
export function rotateAffiliateAds() {
  // Support both adblocker-resilient class name and legacy class name
  const adSlots = document.querySelectorAll('.partner-showcase-grid, .ad-banner-slot');
  if (!adSlots || adSlots.length === 0) return;

  adSlots.forEach((slot, idx) => {
    // Shuffle all available ads randomly
    const shuffled = shuffleArray(AFFILIATE_ADS);
    
    // Pick 2 or 3 random ads per slot so every container looks rich and different
    const count = Math.floor(Math.random() * 2) + 2; // 2 or 3 ads
    const selectedAds = shuffled.slice(0, count);

    // Build responsive HTML with both image and CTA text badge so it never disappears
    const adsHtml = `
      <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; width: 100%; margin-bottom: 0.5rem; font-weight: 600; text-align: center;">Sponsored Partner Offers & Featured Deals</div>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 1.25rem; width: 100%;">
        ${selectedAds.map(ad => `
          <!-- START ADVERTISER: ${ad.advertiser} from awin.com -->
          <a rel="sponsored" href="${ad.href}" target="_blank" class="partner-showcase-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.2s ease, box-shadow: 0.2s ease; text-decoration: none; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 8px; border: 1px solid #e2e8f0; max-width: 100%;">
            <img src="${ad.img}" border="0" alt="${ad.alt}" style="max-width: 100%; height: auto; display: block; border-radius: 4px; margin-bottom: 6px;" onerror="this.style.display='none'">
            <span style="display: inline-block; padding: 0.35rem 0.75rem; font-weight: 600; color: #2563eb; font-size: 0.75rem; background: #eff6ff; border-radius: 4px; width: 100%; text-align: center; white-space: nowrap;">✨ Featured Deal: ${ad.advertiser} &rarr;</span>
          </a>
          <!-- END ADVERTISER: ${ad.advertiser} from awin.com -->
        `).join('')}
      </div>
    `;

    // Synchronous immediate render to avoid any opacity/transition lockups
    slot.innerHTML = adsHtml;
    slot.style.display = 'flex';
    slot.style.flexDirection = 'column';
    slot.style.alignItems = 'center';
  });
}

/**
 * Initializes the Ad Rotator and starts automatic periodic rotation
 */
export function initAdRotator() {
  // Rotate immediately on startup
  rotateAffiliateAds();

  // Automatically rotate ads every 25 seconds so visitors see fresh ads dynamically
  setInterval(() => {
    rotateAffiliateAds();
  }, 25000);
}

// Auto-run immediately when script is imported in case DOM is already ready
if (typeof window !== 'undefined') {
  setTimeout(() => rotateAffiliateAds(), 10);
  setTimeout(() => rotateAffiliateAds(), 500);
  setTimeout(() => rotateAffiliateAds(), 1500);
}
