export function promptGoogleLogin({ onStart, onSuccess, onError, roleName = null } = {}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    onError?.('Google Client ID is not configured. Please check VITE_GOOGLE_CLIENT_ID in .env.');
    return;
  }

  if (!window.google?.accounts?.oauth2) {
    onError?.('Google Sign-In service is still loading. Please check your internet connection and try again.');
    return;
  }

  let settled = false;
  let safetyTimer = null;
  let focusCheckTimer = null;

  const cleanup = () => {
    if (safetyTimer) clearTimeout(safetyTimer);
    if (focusCheckTimer) clearTimeout(focusCheckTimer);
    window.removeEventListener('focus', handleWindowFocus);
  };

  const handleSuccess = (data) => {
    if (settled) return;
    settled = true;
    cleanup();
    onSuccess?.(data);
  };

  const handleError = (errMsg) => {
    if (settled) return;
    settled = true;
    cleanup();
    onError?.(errMsg);
  };

  const handleWindowFocus = () => {
    // When user returns to window (e.g. closed the Google popup or cancelled),
    // wait a short grace period to let any pending GIS callback arrive.
    if (focusCheckTimer) clearTimeout(focusCheckTimer);
    focusCheckTimer = setTimeout(() => {
      if (!settled) {
        handleError('Google sign-in popup was closed or cancelled.');
      }
    }, 2500);
  };

  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'email profile openid',
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          handleError(tokenResponse.error_description || tokenResponse.error || 'Google sign-in was cancelled.');
          return;
        }
        if (tokenResponse.access_token) {
          handleSuccess({ accessToken: tokenResponse.access_token, roleName });
        } else {
          handleError('No access token returned from Google.');
        }
      },
      error_callback: (err) => {
        const errorMsg =
          err?.message ||
          (err?.type === 'popup_closed'
            ? 'Sign-in popup was closed.'
            : err?.type === 'popup_failed_to_open'
            ? 'Popup was blocked by your browser. Please allow popups for this site and try again.'
            : 'Google sign-in could not be completed.');
        handleError(errorMsg);
      },
    });

    onStart?.();

    // Listen for window focus in case the user closes the popup
    setTimeout(() => {
      window.addEventListener('focus', handleWindowFocus);
    }, 1500);

    // Hard safety timeout so the UI never gets stuck
    safetyTimer = setTimeout(() => {
      if (!settled) {
        handleError('Google sign-in timed out. Please try again or sign in with your email.');
      }
    }, 60000);

    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err) {
    cleanup();
    onError?.(err?.message || 'Failed to open Google Sign-In popup.');
  }
}

