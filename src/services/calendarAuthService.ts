import { CalendarEvent } from '../db/models';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];
const GOOGLE_DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
];
// Get current origin for redirect URI
const REDIRECT_URI = window.location.origin;

// TODO: Calendar integration (Google Calendar, Apple Calendar)

// TODO: Add OAuth2 authentication and token refresh for other integrations (Apple Calendar, Outlook, Slack, Gmail, etc.)
// TODO: Implement webhook or polling support for integrations that support it (e.g., Slack, Google Calendar webhooks)
// TODO: Refactor this service to expose a common interface for all calendar/message integrations

// Service for Google Calendar OAuth and API operations
export const googleCalendarService = {
  // Track authentication status
  isAuthenticated: false,
  tokenClient: null as any,
  gapiInited: false,
  gisInited: false,
  authInProgress: false,
  
  // Initialize Google API client
  async initGoogleCalendarAPI(): Promise<void> {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      console.error('Google OAuth credentials not configured');
      return;
    }
    
    // Load the Google API client
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
        console.log('GAPI script already exists, trying to initialize...');
        if (window.gapi) {
          window.gapi.load('client', async () => {
            try {
              // Use a more simple approach first without discovery docs
              console.log('Initializing GAPI client with simplified approach...');
              await window.gapi.client.init({
                apiKey: GOOGLE_API_KEY,
              });
              
              // Now load the calendar API specifically
              console.log('Loading Google Calendar API...');
              await window.gapi.client.load('calendar', 'v3');
              
              this.gapiInited = true;
              console.log('GAPI initialized from existing script');
              resolve();
            } catch (error) {
              console.error('Error initializing GAPI from existing script:', error);
              console.log('GAPI error details:', JSON.stringify(error, null, 2));
              
              // Try again with a simpler approach as fallback
              try {
                console.log('Trying fallback initialization...');
                window.gapi.client.setApiKey(GOOGLE_API_KEY);
                await window.gapi.client.load('calendar', 'v3');
                this.gapiInited = true;
                console.log('GAPI initialized with fallback method');
                resolve();
              } catch (fallbackError) {
                console.error('Fallback initialization also failed:', fallbackError);
                reject(fallbackError);
              }
            }
          });
          return;
        }
      }
      
      console.log('Loading GAPI script...');
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        console.log('GAPI script loaded');
        window.gapi.load('client', async () => {
          try {
            console.log('Initializing GAPI client...');
            // Initialize without discovery docs first
            await window.gapi.client.init({
              apiKey: GOOGLE_API_KEY,
            });
            
            // Now load the calendar API
            await window.gapi.client.load('calendar', 'v3');
            
            console.log('GAPI client initialized successfully');
            this.gapiInited = true;
            console.log('GAPI initialized');
            resolve();
          } catch (error) {
            console.error('Error initializing GAPI:', error);
            console.log('Detailed error:', JSON.stringify(error, null, 2));
            
            // Try the fallback approach
            try {
              console.log('Trying fallback initialization...');
              window.gapi.client.setApiKey(GOOGLE_API_KEY);
              await window.gapi.client.load('calendar', 'v3');
              this.gapiInited = true;
              console.log('GAPI initialized with fallback method');
              resolve();
            } catch (fallbackError) {
              console.error('Fallback initialization also failed:', fallbackError);
              reject(fallbackError);
            }
          }
        });
      };
      script.onerror = (error) => {
        console.error('Error loading GAPI script:', error);
        reject(error);
      };
      document.body.appendChild(script);
    });
  },
  
  // Initialize Google Identity Services
  async initGoogleIdentity(): Promise<void> {
    if (!GOOGLE_CLIENT_ID) {
      console.error('Google OAuth client ID not configured');
      return;
    }
    
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        console.log('GSI script already exists, trying to initialize...');
        if (window.google?.accounts?.oauth2) {
          try {
            this.initTokenClient();
            this.gisInited = true;
            console.log('GSI initialized from existing script');
            resolve();
          } catch (error) {
            console.error('Error initializing GSI from existing script:', error);
            reject(error);
          }
          return;
        }
      }
      
      console.log('Loading GSI script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        console.log('GSI script loaded');
        try {
          this.initTokenClient();
          this.gisInited = true;
          console.log('GSI initialized');
          resolve();
        } catch (error) {
          console.error('Error initializing GSI:', error);
          reject(error);
        }
      };
      script.onerror = (error) => {
        console.error('Error loading GSI script:', error);
        reject(error);
      };
      document.body.appendChild(script);
    });
  },
  
  // Initialize token client
  initTokenClient(): void {
    console.log('Initializing token client with client ID:', GOOGLE_CLIENT_ID);
    
    if (!window.google?.accounts?.oauth2) {
      console.error('Google Identity Services not loaded properly');
      window.dispatchEvent(new CustomEvent('google-oauth-init-failed'));
      return;
    }
    
    try {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES.join(' '),
        prompt: 'consent',
        callback: (tokenResponse: any) => {
          console.log('Token response received:', tokenResponse ? 'success' : 'failure');
          if (tokenResponse && tokenResponse.access_token) {
            console.log('Access token received, authentication successful');
            this.isAuthenticated = true;
            this.authInProgress = false;
            
            // Dispatch success event
            window.dispatchEvent(new CustomEvent('google-oauth-success'));
          } else {
            console.error('No access token received in the response');
            this.authInProgress = false;
            
            // Dispatch failure event
            window.dispatchEvent(new CustomEvent('google-oauth-token-error', {
              detail: { error: new Error('No access token received') }
            }));
          }
        },
        error_callback: (error: any) => {
          console.error('Error during OAuth flow:', error);
          this.authInProgress = false;
          
          // Dispatch error event
          window.dispatchEvent(new CustomEvent('google-oauth-token-error', {
            detail: { error }
          }));
        }
      });
      console.log('Token client initialized');
    } catch (error) {
      console.error('Error initializing token client:', error);
      window.dispatchEvent(new CustomEvent('google-oauth-init-failed', {
        detail: { error }
      }));
    }
  },
  
  // Attempt to initialize both APIs
  async initialize(): Promise<void> {
    try {
      console.log('Starting Google Calendar initialization...');
      console.log('Using client ID:', GOOGLE_CLIENT_ID ? 'Set (hidden)' : 'Not set');
      console.log('Using API key:', GOOGLE_API_KEY ? 'Set (hidden)' : 'Not set');
      console.log('Redirect URI:', REDIRECT_URI);
      
      // First initialize GAPI, then GIS
      await this.initGoogleCalendarAPI();
      await this.initGoogleIdentity();
      
      console.log('Google Calendar services initialized');
      console.log('GAPI initialized:', this.gapiInited);
      console.log('GIS initialized:', this.gisInited);
    } catch (error) {
      console.error('Error initializing Google Calendar services:', error);
    }
  },
  
  // Start the OAuth flow
  authorize(): void {
    console.log('Attempting to authorize Google Calendar...');
    console.log('GAPI initialized:', this.gapiInited);
    console.log('GIS initialized:', this.gisInited);
    
    if (!this.gapiInited || !this.gisInited) {
      console.error('Google APIs not initialized');
      
      // Try to initialize now as a recovery
      this.initialize().then(() => {
        if (this.gapiInited && this.gisInited) {
          console.log('APIs initialized on-demand, attempting authorization again');
          this.authorize();
        } else {
          console.error('Failed to initialize APIs on-demand');
          // Dispatch a custom event for initialization failure
          window.dispatchEvent(new CustomEvent('google-oauth-init-failed'));
        }
      }).catch(error => {
        console.error('Error during on-demand initialization:', error);
        window.dispatchEvent(new CustomEvent('google-oauth-init-failed'));
      });
      
      return;
    }
    
    if (this.authInProgress) {
      console.log('Authorization already in progress');
      return;
    }
    
    console.log('Requesting access token...');
    try {
      this.authInProgress = true;
      
      // Test for popup blockers
      const popupTest = window.open('about:blank', '_blank', 'width=100,height=100');
      if (!popupTest) {
        console.error('Popup blocked! Cannot complete OAuth flow.');
        this.authInProgress = false;
        // Dispatch custom event for popup blocked
        window.dispatchEvent(new CustomEvent('google-oauth-popup-blocked'));
        return;
      }
      popupTest.close();
      
      // Clear any existing tokens to force a new auth flow
      if (window.gapi?.client?.getToken) {
        const token = window.gapi.client.getToken();
        if (token) {
          console.log('Clearing existing token');
          window.gapi.client.setToken(null);
        }
      }
      
      // Ensure the token client is initialized
      if (!this.tokenClient) {
        console.log('Token client not initialized, initializing now');
        this.initTokenClient();
      }
      
      // Request access token with error handling
      try {
        this.tokenClient.requestAccessToken();
        console.log('Access token request initiated');
      } catch (tokenError) {
        console.error('Error requesting access token:', tokenError);
        this.authInProgress = false;
        window.dispatchEvent(new CustomEvent('google-oauth-token-error', { 
          detail: { error: tokenError } 
        }));
      }
    } catch (error) {
      console.error('Error in authorize process:', error);
      this.authInProgress = false;
      window.dispatchEvent(new CustomEvent('google-oauth-error', { 
        detail: { error: error } 
      }));
    }
  },
  
  // Fetch events from Google Calendar
  async fetchEvents(): Promise<CalendarEvent[]> {
    if (!this.isAuthenticated) {
      console.error('Not authenticated with Google Calendar');
      return [];
    }
    
    try {
      console.log('Attempting to fetch Google Calendar events...');
      
      // Verify GAPI client is available
      if (!window.gapi?.client?.calendar?.events) {
        console.error('Google Calendar API not properly loaded');
        
        // Try to load it directly
        try {
          await window.gapi.client.load('calendar', 'v3');
          console.log('Calendar API loaded on-demand');
        } catch (loadError) {
          console.error('Failed to load Calendar API on-demand:', loadError);
          return [];
        }
      }
      
      // Now try to list events
      try {
        const response = await window.gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'timeMin': (new Date()).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 50,
          'orderBy': 'startTime'
        });
        
        console.log('Google Calendar response:', response);
        const events = response.result.items || [];
        console.log('Fetched events:', events.length);
        
        // Map Google Calendar events to our app's format
        return events.map((event: any) => {
          const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
          const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);
          
          return {
            id: event.id,
            title: event.summary || 'Untitled Event',
            description: event.description || '',
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            all_day: !event.start.dateTime,
            source: 'google' as const,
          };
        });
      } catch (apiError) {
        console.error('Error calling Google Calendar API:', apiError);
        
        // Check if token has expired
        if (apiError.status === 401) {
          console.log('Token expired, clearing authentication state');
          this.isAuthenticated = false;
          window.dispatchEvent(new CustomEvent('google-oauth-token-expired'));
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      return [];
    }
  }
};

// Declare global types for Google API
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
} 