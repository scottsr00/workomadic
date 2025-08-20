# Workomadic - Remote Work Spots Directory

A comprehensive directory of remote work spots in major cities, helping digital nomads and remote workers find the perfect workspace.

## Features

- **Search & Filter**: Find locations by city, amenities, and preferences
- **Detailed Listings**: Comprehensive information including WiFi quality, noise levels, seating, and more
- **User Reviews**: Community-driven reviews and ratings
- **Google Reviews Integration**: Automatic sync with Google Places reviews and ratings
- **Premium Listings**: Business owners can promote their locations
- **Mobile-First Design**: Optimized for mobile and desktop use
- **User Submissions**: Community can submit new locations

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with Google OAuth
- **File Upload**: Cloudinary
- **Payments**: Stripe
- **State Management**: TanStack Query (React Query)

## Getting Started

### Prerequisites

- Node.js 18+ 
- **Optional**: PostgreSQL database (app works with mock data)
- **Optional**: Google OAuth credentials
- **Optional**: Stripe account (for payments)
- **Optional**: Cloudinary account (for image uploads)

### 🎯 **Quick Start (No Database Required!)**

The application is **fully functional** with mock data and doesn't require any database setup for development.

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workomadic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### ✅ **What Works Immediately**

- ✅ Browse locations in NYC and Austin
- ✅ Search and filter locations by amenities
- ✅ View location details and reviews
- ✅ Responsive mobile-first design
- ✅ Mock data with 10 high-quality sample locations

### 🔧 **Optional: Full Setup with Database**

If you want to use a real PostgreSQL database and all features:

1. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/workomadic"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   
   # Google Maps & Places API
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
   ```

2. **Set up the database**
   ```bash
   # Create the database
   createdb workomadic
   
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

### 🗄️ Database Management

Use the provided script for common database operations:

```bash
# Show database status
./scripts/db-commands.sh status

# Approve all pending locations
./scripts/db-commands.sh approve-all

# Reset database and reseed
./scripts/db-commands.sh reset

# Show pending submissions
./scripts/db-commands.sh pending
```

### Available Commands
- `status` - Show database status and data counts
- `reset` - Reset database and reseed with initial data
- `seed` - Seed database with initial data
- `approve-all` - Approve all pending location submissions
- `pending` - Show pending location submissions
- `cities` - List all cities with location counts

## Database Schema

The application uses the following main entities:

- **Users**: Authentication and user management
- **Cities**: Location management (NYC, Austin, etc.)
- **Locations**: Remote work spots with detailed metadata
- **Photos**: Image management for locations
- **Reviews**: User-generated reviews and ratings
- **Tags**: Categorization system (WiFi, Quiet, Coffee, etc.)
- **Premium Listings**: Stripe integration for business features

## Google Reviews Integration

The application includes automatic Google Places integration for reviews and ratings:

### Setup
1. Get a Google Maps API key with Places API enabled
2. Add the API key to your environment variables
3. Use the Google Places Connector in the location details page to connect locations

### Features
- **Automatic Place Search**: Find and connect locations to Google Places by name and address
- **Review Sync**: Automatically sync Google reviews and ratings
- **Dual Rating Display**: Show both internal and Google ratings
- **Tabbed Interface**: Separate tabs for internal and Google reviews
- **Real-time Updates**: Sync reviews on demand

### API Endpoints
- `POST /api/locations/[id]/google-reviews` - Sync Google reviews for a location
- `GET /api/locations/[id]/google-reviews` - Get Google reviews for a location

## API Endpoints

- `GET /api/cities` - Fetch all cities
- `GET /api/locations` - Fetch locations with filtering
- `POST /api/locations` - Create new location (authenticated)
- `GET /api/locations/[id]` - Get specific location details
- `POST /api/locations/[id]/reviews` - Add review (authenticated)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Railway
- Netlify
- AWS
- DigitalOcean

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@workomadic.com or create an issue in the repository.
