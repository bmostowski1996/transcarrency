import { Request, Response, Router } from 'express';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { googleApiConfig } from '../config';
import { User } from '../models/index.js'; // Assuming you have a User model to store tokens

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      id: string;
      // add other properties if needed
    }
    interface Request {
      user?: User;
    }
  }
}

const router = Router();

const oauth2Client = new google.auth.OAuth2(
  googleApiConfig.clientId,
  googleApiConfig.clientSecret,
  googleApiConfig.redirectUri
);

// Step 1: Redirect to Google's OAuth consent screen
router.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    scope: googleApiConfig.scopes,
    prompt: 'consent' // Optional: forces the consent screen to be shown, useful for testing refresh token retrieval
  });
  res.redirect(url);
});

// Step 2: Handle the OAuth callback from Google
router.get('/auth/google/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // TODO: Securely store tokens (tokens.access_token, tokens.refresh_token) for the user.
    // This usually involves associating them with a user ID from your application's session or JWT.
    // For this example, we'll assume you have a way to identify the user (e.g., req.user.id from a previous auth middleware)
    // This is a placeholder - replace with your actual user identification and storage logic.
    const userId = (req.user as any)?.id; // Example: if using Passport.js or similar session management

    if (userId && tokens.access_token && tokens.refresh_token) {
      // Store tokens in your database associated with the user
      await User.findByIdAndUpdate(userId, {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      });
      console.log('Tokens stored for user:', userId);
    } else {
      // Handle cases where user is not identified or tokens are incomplete
      // This might happen if the user isn't logged into your app before starting OAuth flow
      console.warn('User ID not found or tokens incomplete. Tokens not stored.', tokens);
      // You might redirect to a login page or show an error
      return res.status(400).send('User not authenticated or token issue.');
    }

    // Redirect to a page in your frontend application
    // e.g., a profile page or a page that will now display calendar data
    res.redirect('/profile'); // Or wherever you want the user to go after successful auth
    return;

  } catch (error) {
    console.error('Error exchanging authorization code for tokens:', error);
    res.status(500).send('Failed to authenticate with Google.');
    return;
  }
});

// Example API route to get calendar events
router.get('/api/calendar/events', async (req: Request, res: Response) => {
  // TODO: Retrieve the user's ID (e.g., from session or JWT)
  const userId = (req.user as any)?.id; // Placeholder

  if (!userId) {
    res.status(401).send('User not authenticated.');
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.googleAccessToken) {
      res.status(403).send('Google Calendar not linked for this user.');
      return;
    }

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      // expiry_date is managed by the library if refresh_token is present
    });

    // Check if the access token is expired and refresh if necessary
    // The google-auth-library handles this automatically if a refresh token is set
    // and the library makes a request that requires authentication.
    // You can also manually refresh if needed:
    // if (user.googleTokenExpiryDate && new Date() > user.googleTokenExpiryDate) {
    //   console.log('Access token expired, attempting to refresh...');
    //   const { credentials } = await oauth2Client.refreshAccessToken();
    //   oauth2Client.setCredentials(credentials);
    //   // Update the stored tokens for the user
    //   await User.findByIdAndUpdate(userId, {
    //     googleAccessToken: credentials.access_token,
    //     googleRefreshToken: credentials.refresh_token || user.googleRefreshToken, // Keep old refresh token if new one isn't provided
    //     googleTokenExpiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
    //   });
    //   console.log('Tokens refreshed and updated for user:', userId);
    // }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const eventsResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json(eventsResponse.data.items);
    return;

  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    if (error.response && error.response.status === 401) {
        // This could indicate the refresh token is invalid or revoked
        // You might want to clear the user's Google tokens and prompt for re-authentication
        await User.findByIdAndUpdate(userId, {
            $unset: { 
                googleAccessToken: "", 
                googleRefreshToken: "", 
                googleTokenExpiryDate: "" 
            }
        });
        res.status(401).send('Google authentication error. Please re-authenticate with Google.');
        return;
    }
    res.status(500).send('Failed to fetch calendar events.');
    return;
  }
});

export default router;
