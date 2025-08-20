# Google Places Sync Scripts

This directory contains scripts for bulk syncing Google Places data (photos and reviews) for all locations in your Workomadic database.

## Scripts Overview

### 1. `sync-all-locations.js`
Basic bulk sync script that processes all approved locations.

### 2. `sync-all-locations-enhanced.js`
Enhanced version with additional features like dry-run mode, retry logic, and better error handling.

### 3. `sync-config.js`
Configuration file for sync scripts with environment variable support.

## Quick Start

### Using npm scripts (recommended)

```bash
# Sync all locations
npm run sync:all

# Enhanced sync with dry-run mode
npm run sync:all-enhanced -- --dry-run

# Test sync with limited locations
npm run sync:test
```

### Direct script execution

```bash
# Basic sync
node scripts/sync-all-locations.js

# Enhanced sync with options
node scripts/sync-all-locations-enhanced.js --dry-run --limit=5
```

## Command Line Options

### Enhanced Script Options

- `--help, -h`: Show help message
- `--dry-run`: Show what would be synced without actually syncing
- `--force`: Force sync even for recently synced locations
- `--limit=<number>`: Limit processing to first N locations
- `--no-delay`: Remove delay between requests (use with caution)
- `--skip-recent`: Skip locations synced within last 24 hours

### Examples

```bash
# Dry run to see what would be synced
node scripts/sync-all-locations-enhanced.js --dry-run

# Sync only first 5 locations for testing
node scripts/sync-all-locations-enhanced.js --limit=5

# Force sync all locations without delays
node scripts/sync-all-locations-enhanced.js --force --no-delay

# Skip recently synced locations
node scripts/sync-all-locations-enhanced.js --skip-recent
```

## Environment Variables

You can configure the sync behavior using environment variables:

```bash
# Set delay between requests (milliseconds)
export SYNC_DELAY=2000

# Set maximum retries
export SYNC_MAX_RETRIES=5

# Limit number of locations to process
export SYNC_MAX_LOCATIONS=10

# Enable dry run mode
export SYNC_DRY_RUN=true

# Enable verbose logging
export SYNC_VERBOSE=true
```

## Configuration

The `sync-config.js` file contains default configuration options:

```javascript
export const SYNC_CONFIG = {
  delayBetweenRequests: 1000,    // 1 second delay
  maxRetries: 3,                 // Retry failed operations
  skipRecentlySynced: false,     // Skip recently synced locations
  maxPhotosPerLocation: 5,       // Max photos per location
  photoMaxWidth: 800,            // Photo width limit
  // ... more options
}
```

## What the Scripts Do

1. **Fetch Locations**: Get all approved locations from the database
2. **Find Google Place IDs**: For locations without Google Place IDs, search Google Places API
3. **Sync Photos**: Download and store location photos from Google Places
4. **Sync Reviews**: Fetch and store Google reviews
5. **Update Metadata**: Update location with Google rating and review count
6. **Error Handling**: Log errors and continue processing other locations
7. **Rate Limiting**: Respect Google Places API rate limits

## Output

The scripts provide detailed output including:

- Progress indicators for each location
- Success/failure status for each operation
- Summary statistics (total photos, reviews synced)
- Error details for failed operations
- Processing time estimates

### Example Output

```
🔄 Starting bulk sync of all locations...

📊 Found 15 approved locations to process

1/15 Processing: Blue Bottle Coffee - Williamsburg
📍 Address: 160 Berry St, Brooklyn, NY 11249
🔗 Google Place ID: ChIJN1t_tDeuEmsRUsoyG83frY4
🔄 Syncing photos and reviews...
✅ Successfully synced:
   📸 Photos: 3
   ⭐ Reviews: 12

============================================================
📊 SYNC SUMMARY
============================================================
Total locations: 15
✅ Successfully synced: 12
⏭️  Skipped: 2
❌ Failed: 1

📈 STATISTICS:
   📸 Total photos synced: 45
   ⭐ Total reviews synced: 156
   🔗 Locations with Google Place ID: 14
   ❓ Locations without Google Place ID: 1

🎉 Bulk sync completed!
```

## Best Practices

### Before Running

1. **Test with dry-run**: Always test with `--dry-run` first
2. **Check API quota**: Ensure you have sufficient Google Places API quota
3. **Backup database**: Consider backing up your database before bulk operations
4. **Start small**: Use `--limit=5` to test with a few locations first

### During Execution

1. **Monitor progress**: Watch for errors and warnings
2. **Check API usage**: Monitor your Google Places API usage
3. **Be patient**: The script includes delays to respect rate limits

### After Execution

1. **Review results**: Check the summary and error logs
2. **Verify data**: Browse a few locations to ensure photos and reviews were synced
3. **Plan next run**: Consider scheduling regular syncs for new locations

## Troubleshooting

### Common Issues

1. **API Key Issues**
   ```
   ❌ Error: Google Maps API key is required
   ```
   - Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
   - Verify the API key has the required permissions

2. **Rate Limiting**
   ```
   ⚠️  Attempt 1 failed, retrying in 2000ms...
   ```
   - The script automatically retries with delays
   - Consider increasing `SYNC_DELAY` if you hit rate limits frequently

3. **No Google Place ID Found**
   ```
   ❌ Could not find Google Place ID for this location
   ```
   - Some locations may not exist on Google Places
   - Check the location name and address for accuracy

4. **Database Connection Issues**
   ```
   💥 Fatal error during bulk sync: No database connection
   ```
   - Ensure your database is running
   - Check your `DATABASE_URL` environment variable

### Getting Help

- Use `--help` to see all available options
- Check the logs for detailed error messages
- Review the Google Places API documentation for API-specific issues

## Scheduling

For production use, consider setting up automated syncs:

### Cron Job Example

```bash
# Sync all locations daily at 2 AM
0 2 * * * cd /path/to/workomadic && npm run sync:all-enhanced -- --skip-recent
```

### GitHub Actions Example

```yaml
name: Daily Google Places Sync
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run sync
        run: npm run sync:all-enhanced -- --skip-recent
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}
```
