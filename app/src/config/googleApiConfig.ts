import dotenv from 'dotenv';

dotenv.config();

export const googleApiConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback', // Adjust port if your backend runs elsewhere
  scopes: [

    // Full access to calendar
    'https://www.googleapis.com/auth/calendar', 
     // Full access to events
    'https://www.googleapis.com/auth/calendar.events'
  ],
};
