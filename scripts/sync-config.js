// Configuration for Google Places sync scripts

const SYNC_CONFIG = {
  // API Rate Limiting
  delayBetweenRequests: 1000, // 1 second delay between API calls
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds between retries
  
  // Sync Behavior
  skipRecentlySynced: true, // Set to true to skip locations synced within threshold
  skipRecentlySyncedHours: 24, // Hours threshold for skipping recently synced locations
  skipRecentlySyncedDays: 1, // Days threshold (alternative to hours)
  forceSync: false, // Force sync even if recently synced
  
  // Processing Limits
  maxLocations: null, // Set to a number to limit processing (useful for testing)
  maxPhotosPerLocation: 5, // Maximum photos to sync per location
  
  // Photo Settings
  photoMaxWidth: 800, // Maximum width for downloaded photos
  photoQuality: 'high', // Photo quality setting
  
  // Error Handling
  continueOnError: true, // Continue processing other locations if one fails
  logErrors: true, // Log detailed error information
  
  // Development
  dryRun: false, // Show what would be synced without actually syncing
  verbose: false, // Show detailed logging
  
  // Database
  batchSize: 10, // Process locations in batches (for large datasets)
  
  // Google Places API
  googlePlacesFields: [
    'place_id',
    'name', 
    'rating',
    'user_ratings_total',
    'reviews',
    'photos'
  ]
}

// Environment-specific overrides
function getConfig() {
  const config = { ...SYNC_CONFIG }
  
  // Override with environment variables
  if (process.env.SYNC_DELAY) {
    config.delayBetweenRequests = parseInt(process.env.SYNC_DELAY)
  }
  
  if (process.env.SYNC_MAX_RETRIES) {
    config.maxRetries = parseInt(process.env.SYNC_MAX_RETRIES)
  }
  
  if (process.env.SYNC_MAX_LOCATIONS) {
    config.maxLocations = parseInt(process.env.SYNC_MAX_LOCATIONS)
  }
  
  if (process.env.SYNC_DRY_RUN === 'true') {
    config.dryRun = true
  }
  
  if (process.env.SYNC_VERBOSE === 'true') {
    config.verbose = true
  }
  
  if (process.env.SYNC_SKIP_RECENT === 'false') {
    config.skipRecentlySynced = false
  }
  
  if (process.env.SYNC_SKIP_HOURS) {
    config.skipRecentlySyncedHours = parseInt(process.env.SYNC_SKIP_HOURS)
  }
  
  if (process.env.SYNC_SKIP_DAYS) {
    config.skipRecentlySyncedDays = parseInt(process.env.SYNC_SKIP_DAYS)
  }
  
  if (process.env.SYNC_FORCE === 'true') {
    config.forceSync = true
    config.skipRecentlySynced = false
  }
  
  return config
}

// Utility functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}]`
  
  switch (level) {
    case 'error':
      console.error(`${prefix} ❌ ${message}`)
      break
    case 'warn':
      console.warn(`${prefix} ⚠️  ${message}`)
      break
    case 'success':
      console.log(`${prefix} ✅ ${message}`)
      break
    case 'info':
    default:
      console.log(`${prefix} ℹ️  ${message}`)
      break
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryOperation(operation, maxRetries = SYNC_CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      log(`Attempt ${attempt} failed, retrying in ${SYNC_CONFIG.retryDelay}ms...`, 'warn')
      await sleep(SYNC_CONFIG.retryDelay)
    }
  }
}

module.exports = {
  SYNC_CONFIG,
  getConfig,
  log,
  sleep,
  retryOperation
}
