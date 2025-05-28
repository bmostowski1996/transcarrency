import { Request, Response, Router } from 'express';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { googleApiConfig } from '../config';
import User from '../models/User'; // Assuming you have a User model to store tokens
import { v4 as uuidv4 } from 'uuid'; // For generating a temporary state if user not logged in

const router = Router();

const oauth2Client = new google.auth.OAuth2(
  googleApiConfig.clientId,
  googleApiConfig.clientSecret,
  googleApiConfig.redirectUri
);

// Step 1: Redirect to Google's OAuth consent screen
router.get('/auth/google', (req, res) => {
  // IMPORTANT: req.user.id assumes you have authentication middleware
  // that populates req.user for users already logged into YOUR application.
  const userIdFromYourApp = (req.user as any)?.id;
  let stateValue: string;

  if (userIdFromYourApp) {
    // If user is logged into your app, use their ID (or a session ID)
    // You might want to encrypt or sign this value for better security
    stateValue = `userId:${userIdFromYourApp}`;
  } else {
    // If user is not logged in (e.g., Google is used for initial sign-up/login)
    // Generate a temporary unique state and store it in session or a temporary store
    // to verify later. For simplicity, we'll just generate one.
    // A more robust solution would involve storing this temporary state with a short expiry.
    stateValue = `temp:${uuidv4()}`;
    // Example: req.session.oauthState = stateValue; (if using express-session)
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: googleApiConfig.scopes,
    prompt: 'consent',
    state: stateValue, // Pass the state
  });
  res.redirect(url);
});

// Step 2: Handle the OAuth callback from Google
router.get('/auth/google/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const googleError = req.query.error as string;
  const state = req.query.state as string; // Retrieve the state

  // TODO: Verify the state parameter here.
  // For example, if you stored it in session:
  // if (!state || state !== req.session.oauthState) {
  //   console.error('Invalid OAuth state');
  //   return res.status(400).send('Invalid state parameter.');
  // }
  // delete req.session.oauthState; // Clean up state from session

  if (googleError) {
    console.error('Google OAuth Error:', googleError);
    // Redirect to frontend with an error message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Use env var for frontend URL
    return res.redirect(`${frontendUrl}/profile?google_auth_error=${encodeURIComponent(googleError)}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    let userIdToStoreTokens: string | null = null;

    if (state && state.startsWith('userId:')) {
      userIdToStoreTokens = state.split(':')[1];
    } else if (state && state.startsWith('temp:')) {
      // If it was a temporary state (e.g., for a new user signing up with Google):
      // You would now typically fetch the user's Google profile info
      // to either create a new user in your system or link to an existing one by email.
      // For this example, we'll assume you need to create/find user based on Google profile.
      // This part requires more logic based on your app's user management.
      // const people = google.people({ version: 'v1', auth: oauth2Client });
      // const profileInfo = await people.people.get({ resourceName: 'people/me', personFields: 'emailAddresses,names' });
      // const email = profileInfo.data.emailAddresses?.[0]?.value;
      // if (email) {
      //   let user = await User.findOne({ email });
      //   if (!user) { /* create new user */ }
      //   userIdToStoreTokens = user._id;
      // }
      console.warn('Temporary state used. Implement user creation/linking logic here.');
      // For now, we'll prevent token storage if it's just a temp state without further logic
      // to avoid storing tokens without a clear user association.
      // You MUST implement proper user handling here.
    }


    // const userId = (req.user as any)?.id; // This is less reliable here than using 'state'

    if (userIdToStoreTokens && tokens.access_token && tokens.refresh_token) {
      await User.findByIdAndUpdate(userIdToStoreTokens, {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      });
      console.log('Tokens stored for user:', userIdToStoreTokens);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/profile?google_auth_success=true`); // Redirect to frontend
    } else {
      console.warn('User ID not determined from state or tokens incomplete. Tokens not stored.', { state, hasAccessToken: !!tokens.access_token, hasRefreshToken: !!tokens.refresh_token });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/profile?google_auth_error=user_identification_failed`);
    }

  } catch (error) {
    console.error('Error exchanging authorization code for tokens:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/profile?google_auth_error=token_exchange_failed`);
  }
});

// Example API route to get calendar events
router.get('/api/calendar/events', async (req: Request, res: Response) => {
  // TODO: Retrieve the user's ID (e.g., from session or JWT)
  const userId = (req.user as any)?.id; // Placeholder

  if (!userId) {
    return res.status(401).send('User not authenticated.');
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.googleAccessToken) {
      return res.status(403).send('Google Calendar not linked for this user.');
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
        return res.status(401).send('Google authentication error. Please re-authenticate with Google.');
    }
    res.status(500).send('Failed to fetch calendar events.');
  }
});

export default router;
