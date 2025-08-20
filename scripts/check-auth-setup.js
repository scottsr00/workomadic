#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Authentication Setup...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('   Create a .env.local file in your project root');
  process.exit(1);
}

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf8');

// Check for required variables
const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

const missingVars = [];
const configuredVars = [];

requiredVars.forEach(varName => {
  const regex = new RegExp(`^${varName}=`, 'm');
  if (regex.test(envContent)) {
    configuredVars.push(varName);
  } else {
    missingVars.push(varName);
  }
});

console.log('✅ Environment Variables:');
configuredVars.forEach(varName => {
  console.log(`   ✅ ${varName}`);
});

if (missingVars.length > 0) {
  console.log('\n❌ Missing Environment Variables:');
  missingVars.forEach(varName => {
    console.log(`   ❌ ${varName}`);
  });
  
  console.log('\n📝 Add these to your .env.local file:');
  console.log('GOOGLE_CLIENT_ID="your-google-client-id"');
  console.log('GOOGLE_CLIENT_SECRET="your-google-client-secret"');
  console.log('NEXTAUTH_URL="http://localhost:3004"');
  console.log('NEXTAUTH_SECRET="your-nextauth-secret-key"');
  
  console.log('\n🔗 Get Google OAuth credentials from:');
  console.log('   https://console.cloud.google.com/');
  console.log('   → APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client IDs');
  
  process.exit(1);
}

// Check for placeholder values
const hasPlaceholders = envContent.includes('your-google-client-id') || 
                       envContent.includes('your-google-client-secret') ||
                       envContent.includes('your-nextauth-secret-key');

if (hasPlaceholders) {
  console.log('\n⚠️  Placeholder values detected!');
  console.log('   Replace placeholder values with actual credentials');
  process.exit(1);
}

console.log('\n✅ All environment variables are configured!');
  console.log('\n🚀 Next steps:');
  console.log('   1. Make sure your Google OAuth redirect URI is set to:');
  console.log('      http://localhost:3001/api/auth/callback/google');
  console.log('   2. Restart your development server');
  console.log('   3. Test authentication at: http://localhost:3001/auth/signin');
