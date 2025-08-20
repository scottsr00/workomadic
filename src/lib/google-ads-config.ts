// Google Ads Configuration
// Replace these placeholder values with your actual Google AdSense publisher ID and ad slot IDs

export const GOOGLE_ADS_CONFIG = {
  // Your Google AdSense Publisher ID (starts with ca-pub-)
  publisherId: 'ca-pub-YOUR_PUBLISHER_ID',
  
  // Ad slot IDs for different placements
  adSlots: {
    // Content break ads
    cityPage: 'YOUR_CITY_PAGE_AD_SLOT',
    locationPage: 'YOUR_LOCATION_PAGE_AD_SLOT',
    
    // Grid ads within location listings
    locationGrid1: 'YOUR_LOCATION_GRID_AD_SLOT_1',
    locationGrid2: 'YOUR_LOCATION_GRID_AD_SLOT_2',
    locationGrid3: 'YOUR_LOCATION_GRID_AD_SLOT_3',
    
    // Hero section ads
    heroSection: 'YOUR_HERO_SECTION_AD_SLOT',
    
    // Header/navigation ads
    header: 'YOUR_HEADER_AD_SLOT',
    
    // Footer ads
    footer: 'YOUR_FOOTER_AD_SLOT',
  },
  
  // Ad formats
  formats: {
    contentBreak: 'auto',
    grid: 'auto',
    hero: 'auto',
    header: 'horizontal',
    footer: 'auto',
  },
  
  // Responsive settings
  responsive: true,
  
  // Enable/disable ads for different environments
  enabled: {
    development: false, // Set to false to disable ads in development
    production: true,
  }
}

// Helper function to get the current environment
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

// Helper function to check if ads should be enabled
export function shouldShowAds(): boolean {
  const env = isProduction() ? 'production' : 'development'
  return GOOGLE_ADS_CONFIG.enabled[env]
}

// Helper function to get publisher ID
export function getPublisherId(): string {
  return GOOGLE_ADS_CONFIG.publisherId
}

// Helper function to get ad slot by key
export function getAdSlot(key: keyof typeof GOOGLE_ADS_CONFIG.adSlots): string {
  return GOOGLE_ADS_CONFIG.adSlots[key]
}
