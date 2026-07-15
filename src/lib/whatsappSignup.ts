// Meta WhatsApp Embedded Signup — launches Meta's hosted popup where the clinic
// logs into Facebook, confirms their business, and verifies their number by OTP.
//
// The popup itself is entirely Meta's; we only (a) launch it with our app/config
// id and (b) collect the auth code + session info it hands back, which the
// backend then exchanges for a long-lived token.
//
// Both ids below are PUBLIC client-side values (they're visible in the popup URL
// regardless) — the app *secret* stays on the backend and is never used here.

const META_APP_ID = import.meta.env.VITE_META_APP_ID as string | undefined;
const META_CONFIG_ID = import.meta.env.VITE_META_CONFIG_ID as string | undefined;
const FB_SDK_VERSION = 'v21.0';

// When the Meta app isn't configured yet the UI shows an explicit "not
// configured" state instead of opening a popup that would just error out.
export const isWhatsAppSignupConfigured = () => Boolean(META_APP_ID && META_CONFIG_ID);

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

let sdkPromise: Promise<void> | null = null;

function loadFacebookSdk(): Promise<void> {
  if (window.FB) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: META_APP_ID,
        autoLogAppEvents: true,
        xfbml: false,
        version: FB_SDK_VERSION,
      });
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://connect.facebook.net/en_US/sdk.js`;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      sdkPromise = null; // allow a retry on the next attempt
      reject(new Error("Couldn't load Facebook. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });

  return sdkPromise;
}

export interface WhatsAppSignupResult {
  // Short-lived OAuth code — the backend exchanges this for an access token.
  code: string;
  // Session info Meta posts back separately from the code; may be absent if the
  // clinic finishes in a way that doesn't emit the FINISH message.
  phoneNumberId?: string;
  wabaId?: string;
}

// Opens the Meta popup and resolves once the clinic completes signup.
// Rejects if they cancel, if Meta reports an error, or if the SDK won't load.
export async function launchWhatsAppSignup(): Promise<WhatsAppSignupResult> {
  if (!isWhatsAppSignupConfigured()) {
    throw new Error('WhatsApp signup is not configured yet.');
  }

  await loadFacebookSdk();

  return new Promise<WhatsAppSignupResult>((resolve, reject) => {
    // Meta posts the phone number / WABA ids over postMessage, separately from
    // the auth code that comes back through the FB.login callback — so we
    // collect this first and pair the two up when the callback fires.
    let sessionInfo: { phoneNumberId?: string; wabaId?: string } = {};

    const onMessage = (event: MessageEvent) => {
      if (typeof event.origin !== 'string' || !event.origin.endsWith('facebook.com')) return;
      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (payload?.type !== 'WA_EMBEDDED_SIGNUP') return;

        if (payload.event === 'FINISH') {
          sessionInfo = {
            phoneNumberId: payload.data?.phone_number_id,
            wabaId: payload.data?.waba_id,
          };
        } else if (payload.event === 'CANCEL' || payload.event === 'ERROR') {
          cleanup();
          reject(new Error(payload.data?.error_message || 'WhatsApp setup was cancelled.'));
        }
      } catch {
        // Facebook also posts unrelated non-JSON messages on this channel; ignore them.
      }
    };

    const cleanup = () => window.removeEventListener('message', onMessage);
    window.addEventListener('message', onMessage);

    window.FB.login(
      (response: any) => {
        cleanup();
        const code = response?.authResponse?.code;
        if (!code) {
          reject(new Error('WhatsApp setup was cancelled.'));
          return;
        }
        resolve({ code, ...sessionInfo });
      },
      {
        config_id: META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: '', sessionInfoVersion: '3' },
      }
    );
  });
}
