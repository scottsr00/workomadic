# Google Ads Integration Setup

This guide will help you set up Google AdSense ads on the right side of your Nomadik app pages.

## Prerequisites

1. **Google AdSense Account**: You need an approved Google AdSense account
2. **Publisher ID**: Your AdSense publisher ID (starts with `ca-pub-`)
3. **Ad Units**: Create ad units in your AdSense dashboard to get ad slot IDs

## Setup Instructions

### 1. Get Your Publisher ID

1. Log into your [Google AdSense account](https://www.google.com/adsense)
2. Go to **Settings** → **Account information**
3. Copy your **Publisher ID** (format: `ca-pub-XXXXXXXXXX`)

### 2. Create Ad Units

1. In AdSense, go to **Ads** → **By ad unit**
2. Click **Create new ad unit**
3. Choose the appropriate ad format:
   - **Sidebar ads**: Use "Display ads" with vertical format
   - **Inline ads**: Use "Display ads" with auto format
4. Copy the **Ad unit ID** for each ad unit you create

### 3. Update Configuration

Edit `src/lib/google-ads-config.ts` and replace the placeholder values:

```typescript
export const GOOGLE_ADS_CONFIG = {
  // Replace with your actual publisher ID
  publisherId: 'ca-pub-YOUR_ACTUAL_PUBLISHER_ID',
  
  adSlots: {
    // Content break ads
    cityPage: 'YOUR_ACTUAL_CITY_PAGE_AD_SLOT',
    locationPage: 'YOUR_ACTUAL_LOCATION_PAGE_AD_SLOT',
    
    // Grid ads within location listings
    locationGrid1: 'YOUR_ACTUAL_LOCATION_GRID_AD_SLOT_1',
    locationGrid2: 'YOUR_ACTUAL_LOCATION_GRID_AD_SLOT_2',
    locationGrid3: 'YOUR_ACTUAL_LOCATION_GRID_AD_SLOT_3',
    
    // Hero section ads
    heroSection: 'YOUR_ACTUAL_HERO_SECTION_AD_SLOT',
    
    // Header/navigation ads
    header: 'YOUR_ACTUAL_HEADER_AD_SLOT',
    
    // Footer ads
    footer: 'YOUR_ACTUAL_FOOTER_AD_SLOT',
  },
  // ... rest of config
}
```

### 4. Environment Settings

The ads are configured to:
- **Development**: Disabled by default (set `enabled.development: true` to enable)
- **Production**: Enabled by default

You can modify these settings in the config file.

## Ad Placements

### Content Break Ads
- **Location**: Between content sections on city and location pages
- **Format**: Auto-responsive display ads
- **Design**: Elegant gradient background with rounded corners
- **Pages**: City pages, location pages (excluded from home page)

### Grid Ads (Within Location Listings)
- **Location**: Integrated within location grid layouts
- **Format**: Auto-responsive display ads
- **Placement**: After 3rd, 6th, and 9th locations in grids
- **Design**: Matches location card styling for seamless integration

### Hero Section Ads
- **Location**: Below hero content sections
- **Format**: Auto-responsive display ads
- **Design**: Blue gradient background to match brand colors
- **Pages**: Available for future use on landing pages

## Testing

### Development Testing
1. Set `enabled.development: true` in the config
2. Run your development server
3. Check the browser console for any ad loading errors
4. Verify ads appear in content break sections and location grids
5. Test on city pages (e.g., `/cities/nyc`) and location pages

### Production Testing
1. Deploy to production
2. Wait for Google's crawler to index your site
3. Check AdSense dashboard for impressions
4. Monitor for any policy violations

## Troubleshooting

### Ads Not Showing
1. **Check Publisher ID**: Ensure your publisher ID is correct
2. **Verify Ad Slots**: Make sure ad slot IDs match your AdSense units
3. **Site Approval**: Ensure your site is approved by AdSense
4. **Ad Blockers**: Disable ad blockers for testing

### Console Errors
- Check browser console for JavaScript errors
- Verify the AdSense script is loading correctly
- Ensure all required data attributes are present

### Performance Issues
- Ads are loaded asynchronously to avoid blocking page load
- Consider implementing lazy loading for better performance
- Monitor Core Web Vitals impact

## Best Practices

1. **Ad Placement**: Don't place too many ads close together
2. **User Experience**: Ensure ads don't interfere with content
3. **Mobile Responsive**: Ads are hidden on mobile to maintain UX
4. **Loading States**: Ads have fallback styling while loading
5. **Error Handling**: Graceful fallbacks if ads fail to load

## Customization

### Styling
Edit the CSS in `src/app/globals.css`:
```css
.google-ads-container {
  /* Custom styles for ad containers */
}

.content-break-ads {
  /* Custom styles for content break ads */
}
```

### Ad Formats
Modify the `formats` object in the config to change ad formats:
```typescript
formats: {
  contentBreak: 'auto',   // or 'vertical', 'horizontal'
  grid: 'auto',           // or 'vertical', 'horizontal'
  hero: 'auto',           // or 'vertical', 'horizontal'
}
```

### Conditional Display
Use the `shouldShowAds()` function to conditionally show ads:
```typescript
import { shouldShowAds } from '@/lib/google-ads-config'

if (shouldShowAds()) {
  // Show ads
}
```

## Support

For issues with:
- **AdSense Account**: Contact Google AdSense support
- **Ad Implementation**: Check this documentation
- **Technical Issues**: Review browser console and network tab

## Legal Compliance

Ensure your ad implementation complies with:
- Google AdSense policies
- GDPR/privacy regulations
- Your site's terms of service
- Local advertising laws
