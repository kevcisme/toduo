import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CalendarIcon, AlertCircle, HelpCircle, Info } from 'lucide-react';
import { useDatabase } from '../contexts/DatabaseContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GoogleCalendarConnectProps {
  onEventsLoaded?: (events: any[]) => void;
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({ onEventsLoaded }) => {
  const { googleCalendarService, googleCalendarError, resetGoogleCalendarError } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initStatus, setInitStatus] = useState({
    gapiInited: false,
    gisInited: false
  });

  // Combine local and context errors
  const displayError = error || googleCalendarError;
  
  // Clear context error when local error is cleared
  useEffect(() => {
    if (!error && googleCalendarError) {
      resetGoogleCalendarError();
    }
  }, [error, googleCalendarError, resetGoogleCalendarError]);

  // Explicit initialization function
  const initialize = useCallback(async () => {
    setInitializing(true);
    setError(null);
    
    try {
      console.log('Starting explicit initialization in component...');
      await googleCalendarService.initialize();
      console.log('Initialization complete in component');
    } catch (err) {
      console.error('Failed to initialize in component:', err);
      setError('Failed to initialize Google API. Please try again.');
    } finally {
      setInitializing(false);
    }
  }, [googleCalendarService]);

  // Fetch calendar events
  const fetchEvents = useCallback(async () => {
    if (!isConnected) {
      setError('Not connected to Google Calendar');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching Google Calendar events...');
      const events = await googleCalendarService.fetchEvents();
      console.log('Fetched events:', events);
      
      if (onEventsLoaded) {
        onEventsLoaded(events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events from Google Calendar');
    } finally {
      setIsLoading(false);
    }
  }, [googleCalendarService, isConnected, onEventsLoaded]);

  // Check initialization and connection status
  useEffect(() => {
    // Listen for various error events
    const handlePopupBlocked = () => {
      setError('Popup blocked by browser. Please allow popups for this site and try again.');
      setIsLoading(false);
    };
    
    const handleInitFailed = () => {
      setError('Failed to initialize Google Calendar API. Please check your internet connection and try again.');
      setIsLoading(false);
      setInitializing(false);
    };
    
    const handleTokenError = (event: any) => {
      const detail = event.detail?.error ? `: ${event.detail.error.toString()}` : '';
      setError(`Error obtaining authorization token${detail}. Please try again.`);
      setIsLoading(false);
    };
    
    const handleGeneralError = (event: any) => {
      const detail = event.detail?.error ? `: ${event.detail.error.toString()}` : '';
      setError(`Google Calendar authorization failed${detail}. Please try again.`);
      setIsLoading(false);
    };
    
    const handleAuthSuccess = () => {
      console.log('Authentication success event received');
      setIsConnected(true);
      setError(null);
      // Fetch events immediately after successful authentication
      fetchEvents();
    };
    
    const handleTokenExpired = () => {
      console.log('Token expired event received');
      setIsConnected(false);
      setError('Your Google Calendar session has expired. Please reconnect.');
      setIsLoading(false);
    };
    
    // Add event listeners
    window.addEventListener('google-oauth-popup-blocked', handlePopupBlocked);
    window.addEventListener('google-oauth-init-failed', handleInitFailed);
    window.addEventListener('google-oauth-token-error', handleTokenError);
    window.addEventListener('google-oauth-error', handleGeneralError);
    window.addEventListener('google-oauth-success', handleAuthSuccess);
    window.addEventListener('google-oauth-token-expired', handleTokenExpired);
    
    // Initial check and initialize if needed
    const checkAndInitialize = async () => {
      console.log('Initial status check');
      
      // Check initialization status
      const gapiInited = googleCalendarService.gapiInited;
      const gisInited = googleCalendarService.gisInited;
      
      setInitStatus({
        gapiInited,
        gisInited
      });
      
      setIsConnected(googleCalendarService.isAuthenticated);
      
      // If not initialized, attempt to initialize
      if (!gapiInited || !gisInited) {
        console.log('APIs not initialized, initializing...');
        await initialize();
      } else {
        setInitializing(false);
      }
    };
    
    checkAndInitialize();
    
    // Set up polling for status changes
    const interval = setInterval(() => {
      const gapiInited = googleCalendarService.gapiInited;
      const gisInited = googleCalendarService.gisInited;
      const isAuth = googleCalendarService.isAuthenticated;
      
      // Only update state if there are changes to avoid unnecessary rerenders
      if (gapiInited !== initStatus.gapiInited || 
          gisInited !== initStatus.gisInited ||
          isAuth !== isConnected) {
        
        console.log('Status update:');
        console.log('- GAPI Initialized:', gapiInited);
        console.log('- GIS Initialized:', gisInited);
        console.log('- Authenticated:', isAuth);
        
        setInitStatus({
          gapiInited,
          gisInited
        });
        
        setIsConnected(isAuth);
        
        // If we're now authenticated and we weren't before, fetch events
        if (isAuth && !isConnected) {
          fetchEvents();
        }
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('google-oauth-popup-blocked', handlePopupBlocked);
      window.removeEventListener('google-oauth-init-failed', handleInitFailed);
      window.removeEventListener('google-oauth-token-error', handleTokenError);
      window.removeEventListener('google-oauth-error', handleGeneralError);
      window.removeEventListener('google-oauth-success', handleAuthSuccess);
      window.removeEventListener('google-oauth-token-expired', handleTokenExpired);
    };
  }, [googleCalendarService, isConnected, initStatus, initialize, fetchEvents]);

  // Handle connect button click
  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    
    // If not initialized, initialize first
    if (!initStatus.gapiInited || !initStatus.gisInited) {
      console.log('APIs not initialized, initializing first...');
      await initialize();
      
      // If still not initialized after attempting, show error
      if (!googleCalendarService.gapiInited || !googleCalendarService.gisInited) {
        setError('Failed to initialize Google Calendar API. Please try again later.');
        setIsLoading(false);
        return;
      }
    }
    
    try {
      console.log('Starting Google Calendar authorization...');
      googleCalendarService.authorize();
      
      // We'll let the polling in the useEffect handle status updates
      // and trigger event fetching when authenticated
      
      // Set a timeout to stop the loading state if authorization takes too long
      setTimeout(() => {
        if (!googleCalendarService.isAuthenticated && isLoading) {
          setIsLoading(false);
          setError('Authorization timed out. Please try again.');
        }
      }, 30000); // 30 second timeout
    } catch (err) {
      console.error('Error connecting to Google Calendar:', err);
      setError('Failed to connect to Google Calendar. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-2 rounded-md border">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-[#4285F4] flex items-center justify-center text-white mr-2">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div>
            <span>Google Calendar</span>
            {isConnected && (
              <div className="text-xs text-green-600 flex items-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                Connected
              </div>
            )}
            {!initStatus.gapiInited && !initStatus.gisInited && !initializing && (
              <div className="text-xs text-amber-600 mt-0.5">Not initialized</div>
            )}
            {(!initStatus.gapiInited || !initStatus.gisInited) && (initStatus.gapiInited || initStatus.gisInited) && !initializing && (
              <div className="text-xs text-amber-600 mt-0.5">Partially initialized</div>
            )}
            {initializing && (
              <div className="text-xs text-blue-600 flex items-center mt-0.5">
                <RefreshCw className="h-2 w-2 mr-1 animate-spin" />
                Initializing...
              </div>
            )}
          </div>
        </div>
        <Button
          variant={isConnected ? "outline" : "ghost"}
          size="sm"
          onClick={isConnected ? fetchEvents : handleConnect}
          disabled={isLoading || initializing}
        >
          {isLoading || initializing ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              {initializing ? "Initializing..." : (isConnected ? "Loading..." : "Connecting...")}
            </>
          ) : isConnected ? (
            "Refresh"
          ) : (
            "Connect"
          )}
        </Button>
      </div>
      
      {displayError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{displayError}</AlertDescription>
        </Alert>
      )}

      {displayError && (
        <div className="text-xs text-gray-500 mt-1 flex items-start">
          <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
          <div>
            <p>Troubleshooting tips:</p>
            <ul className="list-disc pl-4 mt-1">
              <li>Make sure pop-ups are allowed for this site</li>
              <li>Check that you're signed in to your Google account</li>
              <li>Try clearing your browser cache and cookies</li>
              <li>Ensure your Google Calendar credentials are correct</li>
            </ul>
          </div>
        </div>
      )}

      {displayError && !isConnected && (!initStatus.gapiInited || !initStatus.gisInited) && !initializing && (
        <div className="flex justify-center mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={initialize}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry Initialization
          </Button>
        </div>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-gray-500 mt-1 flex items-center">
              <HelpCircle className="h-3 w-3 mr-1" />
              How to enable Google Calendar?
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">
              1. You need to have a Google account and Google Calendar setup
              <br />
              2. Your app must be registered with Google Cloud Console with Calendar API enabled
              <br />
              3. Allow pop-ups for this website in your browser
              <br />
              4. Click "Connect" and follow the Google login prompts
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default GoogleCalendarConnect; 