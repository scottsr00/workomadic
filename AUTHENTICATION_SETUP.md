# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication for the Workomadic application.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Next.js application with NextAuth.js installed

## Step 1: Set up Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity" if available

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required information:
     - App name: "Workomadic"
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed

4. Create the OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "Workomadic Web Client"
   - Authorized redirect URIs:
     - `http://localhost:3002/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

5. Copy the Client ID and Client Secret

## Step 3: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

## Step 4: Test the Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3002/auth/signin`

3. Click "Sign in with Google"

4. You should be redirected to Google's OAuth consent screen

5. After successful authentication, you'll be redirected back to your application

## Step 5: Production Deployment

For production deployment:

1. Update the authorized redirect URIs in Google Cloud Console to include your production domain
2. Update environment variables with production values
3. Ensure `NEXTAUTH_URL` is set to your production URL
4. Generate a secure `NEXTAUTH_SECRET` for production

## Features Included

- ✅ Google OAuth authentication
- ✅ Protected routes with `ProtectedRoute` component
- ✅ User profile dropdown with sign out
- ✅ Error handling for authentication failures
- ✅ Loading states and user feedback
- ✅ Custom authentication hook (`useAuth`)
- ✅ Session management
- ✅ Responsive design

## Components

- `ProtectedRoute`: Wraps components that require authentication
- `UserProfile`: Displays user information and account options
- `useAuth`: Custom hook for authentication management
- Sign-in page with error handling
- Error page for authentication failures

## Usage Examples

### Protecting a Route

```tsx
import { ProtectedRoute } from '@/components/protected-route'

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  )
}
```

### Using the Auth Hook

```tsx
import { useAuth } from '@/lib/hooks/use-auth'

export default function MyComponent() {
  const { isAuthenticated, login, logout, session } = useAuth()

  if (!isAuthenticated) {
    return <button onClick={() => login()}>Sign In</button>
  }

  return (
    <div>
      <p>Welcome, {session?.user?.name}!</p>
      <button onClick={() => logout()}>Sign Out</button>
    </div>
  )
}
```

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure the redirect URI in Google Cloud Console matches exactly
   - Check that `NEXTAUTH_URL` is set correctly

2. **"Configuration" error**
   - Verify that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
   - Check that the Google+ API is enabled

3. **"Access Denied" error**
   - Ensure your email is added as a test user in the OAuth consent screen
   - Check that the app is not in restricted mode

4. **Session not persisting**
   - Verify that `NEXTAUTH_SECRET` is set
   - Check that cookies are enabled in the browser

### Debug Mode

To enable debug mode, add this to your `.env.local`:

```env
NODE_ENV=development
```

This will show additional error information in the console.

## Security Considerations

- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Regularly rotate OAuth credentials
- Implement proper session management
- Consider adding rate limiting for authentication endpoints
- Use HTTPS in production

## Next Steps

- Add user profile management
- Implement role-based access control
- Add additional authentication providers (GitHub, etc.)
- Set up user data persistence in database
- Add email verification
- Implement password reset functionality
