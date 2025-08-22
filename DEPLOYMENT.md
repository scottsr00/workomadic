# Deployment Guide - Workomadic with Real Database

This guide will help you deploy Workomadic with a real PostgreSQL database instead of mock data.

## Prerequisites

- A Vercel account
- A GitHub repository with your Workomadic code
- (Optional) Google OAuth credentials
- (Optional) Stripe account for payments
- (Optional) Cloudinary account for image uploads

## Step 1: Set up a PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. **Create a new Vercel project** or go to your existing project
2. **Navigate to the Storage tab** in your Vercel dashboard
3. **Click "Create Database"** and select "Postgres"
4. **Choose your plan:**
   - **Hobby**: Free tier with 256MB storage, 10GB bandwidth
   - **Pro**: $20/month with 8GB storage, 100GB bandwidth
   - **Enterprise**: Custom pricing
5. **Select your region** (choose closest to your users)
6. **Click "Create"**

Vercel will automatically:
- Create the database
- Add the `DATABASE_URL` environment variable to your project
- Set up the connection

### Option B: Supabase (Free tier available)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings > Database**
4. Copy the connection string (it looks like: `postgresql://postgres:[password]@[host]:5432/postgres`)
5. Add it as `DATABASE_URL` in your Vercel environment variables

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the connection string
5. Add it as `DATABASE_URL` in your Vercel environment variables

## Step 2: Configure Environment Variables

In your Vercel dashboard, go to **Settings > Environment Variables** and add:

### Required Variables

```env
# Database (auto-added if using Vercel Postgres)
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

### Optional Variables (for full functionality)

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Maps & Places API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Step 3: Deploy Your Application

1. **Push your code to GitHub** (if not already done)
2. **Connect your repository to Vercel** (if not already done)
3. **Deploy** - Vercel will automatically:
   - Install dependencies
   - Generate Prisma client
   - Push database schema
   - Build the application

## Step 4: Verify Database Setup

After deployment, your application should:

1. **Use real database data** instead of mock data
2. **Show actual locations** from the seed data
3. **Allow user interactions** (reviews, favorites, etc.)

### Check Database Status

You can verify the database is working by:

1. **Visiting your deployed site**
2. **Checking the browser console** for database connection logs
3. **Looking for real data** instead of mock data

## Step 5: Seed Your Database (Optional)

If you want to add sample data to your production database:

1. **Go to your Vercel dashboard**
2. **Navigate to Functions**
3. **Create a new function** or use the existing API routes
4. **Run the seed script** via API call

Or manually seed via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Run seed script
vercel env pull .env.local
npm run db:seed
```

## Troubleshooting

### Issue: Still showing mock data

**Solution:**
1. Check that `DATABASE_URL` is set in Vercel environment variables
2. Verify the database connection string is valid
3. Check the deployment logs for database errors
4. Ensure the database schema was pushed successfully

### Issue: Database connection errors

**Solution:**
1. Verify your database is running and accessible
2. Check firewall settings if using external database
3. Ensure the connection string format is correct
4. Check Vercel's IP allowlist if required

### Issue: Build fails during database setup

**Solution:**
1. Check that Prisma is properly configured
2. Verify the database URL is accessible from Vercel
3. Check the build logs for specific error messages
4. Ensure all required environment variables are set

## Environment-Specific Setup

### Development vs Production

- **Development**: Uses local database or mock data
- **Production**: Uses the configured `DATABASE_URL`

### Database Migrations

The application uses `prisma db push` for schema changes. For production:

1. **Test migrations locally first**
2. **Deploy to staging environment**
3. **Deploy to production**

## Security Considerations

1. **Never commit sensitive environment variables** to your repository
2. **Use environment-specific database URLs**
3. **Enable database backups** for production data
4. **Monitor database connections** and performance
5. **Use connection pooling** for better performance

## Performance Optimization

1. **Enable Prisma query caching** in production
2. **Use database indexes** for frequently queried fields
3. **Implement pagination** for large datasets
4. **Monitor and optimize slow queries**

## Support

If you encounter issues:

1. **Check the Vercel deployment logs**
2. **Verify your database connection**
3. **Review the application logs**
4. **Contact support** with specific error messages

## Next Steps

After successful deployment:

1. **Set up monitoring** for your database
2. **Configure backups** for your data
3. **Set up CI/CD** for automated deployments
4. **Monitor performance** and optimize as needed
