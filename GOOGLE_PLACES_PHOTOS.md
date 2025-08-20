# Google Places Photo Integration

This feature allows you to automatically fetch and display location-specific photos from Google Places API instead of using stock images.

## Features

- **Automatic Photo Fetching**: Fetch real photos from Google Places for each location
- **Photo Gallery**: Display multiple photos in a carousel format
- **Primary Photo Selection**: Automatically set the first photo as primary
- **Photo Attribution**: Properly attribute photos to Google Places
- **Fallback Support**: Gracefully handle locations without Google photos

## Setup

### 1. Google Places API Key

Make sure you have a valid Google Places API key with the following APIs enabled:
- Places API
- Places Details API
- Places Photos API

Add your API key to your environment variables:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

### 2. Database Schema

The system uses the existing `Photo` model to store Google Places photos. Each photo includes:
- `url`: Base64 encoded image data
- `alt`: Descriptive text for accessibility
- `isPrimary`: Boolean flag for the main photo
- `locationId`: Reference to the location

## Usage

### Connecting a Location to Google Places

1. Navigate to a location detail page
2. Scroll down to the "Google Places Integration" section
3. Click "Search & Connect" to find the location on Google Places
4. Once connected, click "Sync Photos & Reviews" to fetch photos

### API Endpoints

#### Sync Google Places Data
```http
POST /api/locations/[locationId]/google-sync
Content-Type: application/json

{
  "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4"
}
```

This endpoint will:
- Fetch place details including photos
- Download and convert photos to base64
- Store photos in the database
- Update location with Google rating and review count
- Sync Google reviews

### Components

#### GooglePlacesConnector
A React component that provides the UI for:
- Searching and connecting locations to Google Places
- Syncing photos and reviews
- Displaying connection status

#### LocationDetails
Updated to display Google Places photos in a carousel format with navigation controls.

## Technical Details

### Photo Processing

1. **Fetch Place Details**: Get place information including photo references
2. **Download Photos**: Use Google Places Photo API to download images
3. **Convert to Base64**: Store images as data URLs for easy display
4. **Database Storage**: Save photos with proper metadata

### Error Handling

- Graceful fallback when Google Places API is unavailable
- Mock data for development environments
- Proper error messages for users
- Rate limiting considerations (max 5 photos per location)

### Performance Considerations

- Photos are limited to 5 per location to avoid API quota issues
- Images are optimized to 800px max width
- Base64 encoding increases storage size but simplifies display
- Consider implementing image caching for production

## Example Usage

```typescript
import { googlePlacesService } from '@/lib/google-places'

// Sync photos for a location
const syncResult = await googlePlacesService.syncLocationPhotos(
  locationId, 
  googlePlaceId
)

console.log(`Synced ${syncResult.length} photos`)
```

## Troubleshooting

### Common Issues

1. **API Key Not Authorized**
   - Check that your Google Places API key is valid
   - Ensure the required APIs are enabled
   - Verify billing is set up for the Google Cloud project

2. **No Photos Found**
   - Some locations may not have photos on Google Places
   - Check the place ID is correct
   - Verify the location exists on Google Maps

3. **Rate Limiting**
   - Google Places API has usage limits
   - Implement proper caching in production
   - Consider implementing retry logic

### Development Mode

When the Google Places API key is not authorized, the system will:
- Use mock data for testing
- Display warning messages in the console
- Allow development to continue without API access

## Future Enhancements

- [ ] Image optimization and compression
- [ ] CDN integration for better performance
- [ ] Photo moderation and filtering
- [ ] User-uploaded photos integration
- [ ] Photo metadata extraction (EXIF data)
- [ ] Automatic photo refresh scheduling
