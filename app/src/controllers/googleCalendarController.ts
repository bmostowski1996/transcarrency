
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
  const userId = (req.user as any)?.id; // Assumes your app's auth middleware populates req.user

  if (!userId) {
    return res.status(401).send('User not authenticated for this application.');
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.googleAccessToken || !user.googleRefreshToken) { // Check for refresh token too
      return res.status(403).send('Google Calendar not linked or tokens missing for this user. Please re-authenticate with Google.');
    }

    // Create a new OAuth2Client instance for this request to avoid shared state issues
    // if this controller is used by multiple users concurrently.
    const userSpecificOauth2Client = new google.auth.OAuth2(
        googleApiConfig.clientId,
        googleApiConfig.clientSecret,
        googleApiConfig.redirectUri
    );

    userSpecificOauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    // Listen for token refresh events to save new tokens
    userSpecificOauth2Client.on('tokens', async (newTokens) => {
      console.log('Google tokens were refreshed for user:', userId);
      const updateData: any = {
        googleAccessToken: newTokens.access_token,
      };
      if (newTokens.refresh_token) {
        // A new refresh token is rare from Google but handle if provided
        updateData.googleRefreshToken = newTokens.refresh_token;
        console.log('New Google refresh_token received and will be updated for user:', userId);
      }
      if (newTokens.expiry_date) {
        updateData.googleTokenExpiryDate = new Date(newTokens.expiry_date);
      }
      try {
        await User.findByIdAndUpdate(userId, updateData);
        console.log('Refreshed Google tokens saved for user:', userId);
      } catch (dbError) {
        console.error('Error saving refreshed Google tokens for user:', userId, dbError);
      }
    });

    const calendar = google.calendar({ version: 'v3', auth: userSpecificOauth2Client }); // Use the request-specific client
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
                googleAccessToken: 1, 
                googleRefreshToken: 1, 
                googleTokenExpiryDate: 1 
            }
        });
        return res.status(401).send('Google authentication error. Please re-authenticate with Google.');
    }
    res.status(500).send('Failed to fetch calendar events.');
  }
});

// API route to CREATE a new calendar event
router.post('/api/calendar/events', async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id;

  if (!userId) {
    return res.status(401).send('User not authenticated for this application.');
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.googleAccessToken || !user.googleRefreshToken) {
      return res.status(403).send('Google Calendar not linked or tokens missing. Please re-authenticate with Google.');
    }

    const userSpecificOauth2Client = new google.auth.OAuth2(
      googleApiConfig.clientId,
      googleApiConfig.clientSecret,
      googleApiConfig.redirectUri
    );

    userSpecificOauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    // Listen for token refresh events (important for long-running operations or subsequent calls)
    userSpecificOauth2Client.on('tokens', async (newTokens) => {
      console.log('Google tokens were refreshed during event creation for user:', userId);
      const updateData: any = { googleAccessToken: newTokens.access_token };
      if (newTokens.refresh_token) {
        updateData.googleRefreshToken = newTokens.refresh_token;
      }
      if (newTokens.expiry_date) {
        updateData.googleTokenExpiryDate = new Date(newTokens.expiry_date);
      }
      try {
        await User.findByIdAndUpdate(userId, updateData);
        console.log('Refreshed Google tokens saved during event creation for user:', userId);
      } catch (dbError) {
        console.error('Error saving refreshed Google tokens during event creation:', dbError);
      }
    });

    const calendar = google.calendar({ version: 'v3', auth: userSpecificOauth2Client });

    const { summary, description, startTime, endTime, attendees, reminders } = req.body;

    // Basic validation
    if (!summary || !startTime || !endTime) {
      return res.status(400).send('Missing required event fields: summary, startTime, endTime.');
    }

    const eventResource = {
      summary: summary,
      description: description,
      start: {
        dateTime: new Date(startTime).toISOString(), // Ensure ISO format e.g., '2025-06-01T10:00:00-07:00'
        // timeZone: 'America/Los_Angeles', // Optional: Specify timezone
      },
      end: {
        dateTime: new Date(endTime).toISOString(), // Ensure ISO format
        // timeZone: 'America/Los_Angeles', // Optional: Specify timezone
      },
      attendees: attendees, // e.g., [{ email: 'user@example.com' }]
      reminders: reminders // Frontend will construct this
      // Example reminder structure:
      // reminders: {
      //   useDefault: false,
      //   overrides: [
      //     { method: 'email', minutes: 24 * 60 }, // 1 day before by email
      //     { method: 'popup', minutes: 10 },      // 10 minutes before by popup
      //   ],
      // },
    };

    const createdEvent = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventResource,
    });

    res.status(201).json(createdEvent.data);

  } catch (error: any) {
    console.error('Error creating Google Calendar event:', error.response?.data || error.message);
    if (error.response && error.response.status === 401) {
      // Clear tokens if auth fails (refresh token might be invalid)
      await User.findByIdAndUpdate(userId, {
        $unset: { googleAccessToken: 1, googleRefreshToken: 1, googleTokenExpiryDate: 1 }
      });
      return res.status(401).send('Google authentication error. Please re-authenticate with Google.');
    }
    res.status(500).send('Failed to create calendar event.');
  }
});

export default router;
=======
// import { Request, Response, Router } from 'express';
// import { google } from 'googleapis';
// // import { OAuth2Client } from 'google-auth-library';
// import { googleApiConfig } from '../config';
// import User from '../models/User'; // Assuming you have a User model to store tokens
// import { v4 as uuidv4 } from 'uuid'; // For generating a temporary state if user not logged in

// const router = Router();

// const oauth2Client = new google.auth.OAuth2(
//   googleApiConfig.clientId,
//   googleApiConfig.clientSecret,
//   googleApiConfig.redirectUri
// );

// // Step 1: Redirect to Google's OAuth consent screen
// router.get('/auth/google', (req, res) => {
//   // IMPORTANT: req.user.id assumes you have authentication middleware
//   // that populates req.user for users already logged into YOUR application.
//   const userIdFromYourApp = (req.user as any)?.id;
//   let stateValue: string;

//   if (userIdFromYourApp) {
//     // If user is logged into your app, use their ID (or a session ID)
//     // You might want to encrypt or sign this value for better security
//     stateValue = `userId:${userIdFromYourApp}`;
//   } else {
//     // If user is not logged in (e.g., Google is used for initial sign-up/login)
//     // Generate a temporary unique state and store it in session or a temporary store
//     // to verify later. For simplicity, we'll just generate one.
//     // A more robust solution would involve storing this temporary state with a short expiry.
//     stateValue = `temp:${uuidv4()}`;
//     // Example: req.session.oauthState = stateValue; (if using express-session)
//   }

//   const url = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: googleApiConfig.scopes,
//     prompt: 'consent',
//     state: stateValue, // Pass the state
//   });
//   res.redirect(url);
// });

// // Step 2: Handle the OAuth callback from Google
// router.get('/auth/google/callback', async (req: Request, res: Response) => {
//   const code = req.query.code as string;
//   const googleError = req.query.error as string;
//   const state = req.query.state as string; // Retrieve the state

//   // TODO: Verify the state parameter here.
//   // For example, if you stored it in session:
//   // if (!state || state !== req.session.oauthState) {
//   //   console.error('Invalid OAuth state');
//   //   return res.status(400).send('Invalid state parameter.');
//   // }
//   // delete req.session.oauthState; // Clean up state from session

//   if (googleError) {
//     console.error('Google OAuth Error:', googleError);
//     // Redirect to frontend with an error message
//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Use env var for frontend URL
//     return res.redirect(`${frontendUrl}/profile?google_auth_error=${encodeURIComponent(googleError)}`);
//   }

//   if (!code) {
//     return res.status(400).send('Authorization code missing.');
//   }

//   try {
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);

//     let userIdToStoreTokens: string | null = null;

//     if (state && state.startsWith('userId:')) {
//       userIdToStoreTokens = state.split(':')[1];
//     } else if (state && state.startsWith('temp:')) {
//       // If it was a temporary state (e.g., for a new user signing up with Google):
//       // You would now typically fetch the user's Google profile info
//       // to either create a new user in your system or link to an existing one by email.
//       // For this example, we'll assume you need to create/find user based on Google profile.
//       // This part requires more logic based on your app's user management.
//       // const people = google.people({ version: 'v1', auth: oauth2Client });
//       // const profileInfo = await people.people.get({ resourceName: 'people/me', personFields: 'emailAddresses,names' });
//       // const email = profileInfo.data.emailAddresses?.[0]?.value;
//       // if (email) {
//       //   let user = await User.findOne({ email });
//       //   if (!user) { /* create new user */ }
//       //   userIdToStoreTokens = user._id;
//       // }
//       console.warn('Temporary state used. Implement user creation/linking logic here.');
//       // For now, we'll prevent token storage if it's just a temp state without further logic
//       // to avoid storing tokens without a clear user association.
//       // You MUST implement proper user handling here.
//     }


//     // const userId = (req.user as any)?.id; // This is less reliable here than using 'state'

//     if (userIdToStoreTokens && tokens.access_token && tokens.refresh_token) {
//       await User.findByIdAndUpdate(userIdToStoreTokens, {
//         googleAccessToken: tokens.access_token,
//         googleRefreshToken: tokens.refresh_token,
//         googleTokenExpiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
//       });
//       console.log('Tokens stored for user:', userIdToStoreTokens);
//       const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//       res.redirect(`${frontendUrl}/profile?google_auth_success=true`); // Redirect to frontend
//     } else {
//       console.warn('User ID not determined from state or tokens incomplete. Tokens not stored.', { state, hasAccessToken: !!tokens.access_token, hasRefreshToken: !!tokens.refresh_token });
//       const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//       return res.redirect(`${frontendUrl}/profile?google_auth_error=user_identification_failed`);
//     }

//   } catch (error) {
//     console.error('Error exchanging authorization code for tokens:', error);
//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//     res.redirect(`${frontendUrl}/profile?google_auth_error=token_exchange_failed`);
//   }
// });

// // Example API route to get calendar events
// router.get('/api/calendar/events', async (req: Request, res: Response) => {
//   const userId = (req.user as any)?.id; // Assumes your app's auth middleware populates req.user

//   if (!userId) {
//     return res.status(401).send('User not authenticated for this application.');
//   }

//   try {
//     const user = await User.findById(userId);
//     if (!user || !user.googleAccessToken || !user.googleRefreshToken) { // Check for refresh token too
//       return res.status(403).send('Google Calendar not linked or tokens missing for this user. Please re-authenticate with Google.');
//     }

//     // Create a new OAuth2Client instance for this request to avoid shared state issues
//     // if this controller is used by multiple users concurrently.
//     const userSpecificOauth2Client = new google.auth.OAuth2(
//         googleApiConfig.clientId,
//         googleApiConfig.clientSecret,
//         googleApiConfig.redirectUri
//     );

//     userSpecificOauth2Client.setCredentials({
//       access_token: user.googleAccessToken,
//       refresh_token: user.googleRefreshToken,
//     });

//     // Listen for token refresh events to save new tokens
//     userSpecificOauth2Client.on('tokens', async (newTokens) => {
//       console.log('Google tokens were refreshed for user:', userId);
//       const updateData: any = {
//         googleAccessToken: newTokens.access_token,
//       };
//       if (newTokens.refresh_token) {
//         // A new refresh token is rare from Google but handle if provided
//         updateData.googleRefreshToken = newTokens.refresh_token;
//         console.log('New Google refresh_token received and will be updated for user:', userId);
//       }
//       if (newTokens.expiry_date) {
//         updateData.googleTokenExpiryDate = new Date(newTokens.expiry_date);
//       }
//       try {
//         await User.findByIdAndUpdate(userId, updateData);
//         console.log('Refreshed Google tokens saved for user:', userId);
//       } catch (dbError) {
//         console.error('Error saving refreshed Google tokens for user:', userId, dbError);
//       }
//     });

//     const calendar = google.calendar({ version: 'v3', auth: userSpecificOauth2Client }); // Use the request-specific client
//     const eventsResponse = await calendar.events.list({
//       calendarId: 'primary',
//       timeMin: (new Date()).toISOString(),
//       maxResults: 10,
//       singleEvents: true,
//       orderBy: 'startTime',
//     });

//     res.json(eventsResponse.data.items);

//   } catch (error: any) {
//     console.error('Error fetching calendar events:', error);
//     if (error.response && error.response.status === 401) {
//         // This could indicate the refresh token is invalid or revoked
//         // You might want to clear the user's Google tokens and prompt for re-authentication
//         await User.findByIdAndUpdate(userId, {
//             $unset: { 
//                 googleAccessToken: 1, 
//                 googleRefreshToken: 1, 
//                 googleTokenExpiryDate: 1 
//             }
//         });
//         return res.status(401).send('Google authentication error. Please re-authenticate with Google.');
//     }
//     res.status(500).send('Failed to fetch calendar events.');
//   }
// });

// // API route to CREATE a new calendar event
// router.post('/api/calendar/events', async (req: Request, res: Response) => {
//   const userId = (req.user as any)?.id;

//   if (!userId) {
//     return res.status(401).send('User not authenticated for this application.');
//   }

//   try {
//     const user = await User.findById(userId);
//     if (!user || !user.googleAccessToken || !user.googleRefreshToken) {
//       return res.status(403).send('Google Calendar not linked or tokens missing. Please re-authenticate with Google.');
//     }

//     const userSpecificOauth2Client = new google.auth.OAuth2(
//       googleApiConfig.clientId,
//       googleApiConfig.clientSecret,
//       googleApiConfig.redirectUri
//     );

//     userSpecificOauth2Client.setCredentials({
//       access_token: user.googleAccessToken,
//       refresh_token: user.googleRefreshToken,
//     });

//     // Listen for token refresh events (important for long-running operations or subsequent calls)
//     userSpecificOauth2Client.on('tokens', async (newTokens) => {
//       console.log('Google tokens were refreshed during event creation for user:', userId);
//       const updateData: any = { googleAccessToken: newTokens.access_token };
//       if (newTokens.refresh_token) {
//         updateData.googleRefreshToken = newTokens.refresh_token;
//       }
//       if (newTokens.expiry_date) {
//         updateData.googleTokenExpiryDate = new Date(newTokens.expiry_date);
//       }
//       try {
//         await User.findByIdAndUpdate(userId, updateData);
//         console.log('Refreshed Google tokens saved during event creation for user:', userId);
//       } catch (dbError) {
//         console.error('Error saving refreshed Google tokens during event creation:', dbError);
//       }
//     });

//     const calendar = google.calendar({ version: 'v3', auth: userSpecificOauth2Client });

//     const { summary, description, startTime, endTime, attendees, reminders } = req.body;

//     // Basic validation
//     if (!summary || !startTime || !endTime) {
//       return res.status(400).send('Missing required event fields: summary, startTime, endTime.');
//     }

//     const eventResource = {
//       summary: summary,
//       description: description,
//       start: {
//         dateTime: new Date(startTime).toISOString(), // Ensure ISO format e.g., '2025-06-01T10:00:00-07:00'
//         // timeZone: 'America/Los_Angeles', // Optional: Specify timezone
//       },
//       end: {
//         dateTime: new Date(endTime).toISOString(), // Ensure ISO format
//         // timeZone: 'America/Los_Angeles', // Optional: Specify timezone
//       },
//       attendees: attendees, // e.g., [{ email: 'user@example.com' }]
//       reminders: reminders // Frontend will construct this
//       // Example reminder structure:
//       // reminders: {
//       //   useDefault: false,
//       //   overrides: [
//       //     { method: 'email', minutes: 24 * 60 }, // 1 day before by email
//       //     { method: 'popup', minutes: 10 },      // 10 minutes before by popup
//       //   ],
//       // },
//     };

//     const createdEvent = await calendar.events.insert({
//       calendarId: 'primary',
//       requestBody: eventResource,
//     });

//     res.status(201).json(createdEvent.data);

//   } catch (error: any) {
//     console.error('Error creating Google Calendar event:', error.response?.data || error.message);
//     if (error.response && error.response.status === 401) {
//       // Clear tokens if auth fails (refresh token might be invalid)
//       await User.findByIdAndUpdate(userId, {
//         $unset: { googleAccessToken: 1, googleRefreshToken: 1, googleTokenExpiryDate: 1 }
//       });
//       return res.status(401).send('Google authentication error. Please re-authenticate with Google.');
//     }
//     res.status(500).send('Failed to create calendar event.');
//   }
// });

// export default router;
