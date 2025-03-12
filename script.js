// Attach all functions to the window object to make them globally accessible
window.startOAuthFlow = startOAuthFlow;
window.testTokenRequest = testTokenRequest;

// Generate a random string for code_verifier, state, or other purposes
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Generate code_challenge from code_verifier using SHA-256
async function generateCodeChallenge(codeVerifier) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        console.log('Generated code_challenge:', base64);
        return base64;
    } catch (error) {
        console.error('Error generating code_challenge:', error);
        throw error;
    }
}

// Initiate the OAuth flow by redirecting to Kick's authorization endpoint
async function startOAuthFlow() {
    try {
        console.log('Starting OAuth flow...');
        const codeVerifier = generateRandomString(43);
        const state = generateRandomString(16);
        console.log('Generated code_verifier:', codeVerifier);
        console.log('Generated state:', state);
        localStorage.setItem('code_verifier', codeVerifier);
        localStorage.setItem('oauth_state', state);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const authorizeUrl = `https://api.kick.com/public/v1/oauth/authorize?` +
            `client_id=01JNYTD64KZNRM97QVNFMJCGA8` +
            `&response_type=code` +
            `&redirect_uri=${encodeURIComponent('https://cwetherell.github.io/KickPlus/callback.html')}` +
            `&scope=channel:read` +
            `&state=${state}` +
            `&code_challenge=${codeChallenge}` +
            `&code_challenge_method=S256`;
        console.log('Full authorize URL:', authorizeUrl);
        window.location.href = authorizeUrl;
    } catch (error) {
        console.error('Error in startOAuthFlow:', error);
    }
}

// Test function to exchange the authorization code for an access token
window.testTokenRequest = async function() {
    const tokenUrl = 'https://api.kick.com/public/v1/oauth/token';
    const authCode = localStorage.getItem('auth_code');
    const codeVerifier = localStorage.getItem('code_verifier');

    if (!authCode || !codeVerifier) {
        console.error('Missing auth_code or code_verifier in localStorage');
        return;
    }

    console.log('Using auth_code:', authCode);
    console.log('Using code_verifier:', codeVerifier);

    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: '01JNYTD64KZNRM97QVNFMJCGA8',
        redirect_uri: 'https://cwetherell.github.io/KickPlus/callback.html',
        code: authCode,
        code_verifier: codeVerifier
    });

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });
        const data = await response.json();
        console.log('Token response:', data);
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            console.log('Access token saved to localStorage');
        }
    } catch (error) {
        console.error('Token request failed:', error);
    }
};

// Automatically handle token exchange after returning from callback
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
        console.error(`OAuth Error: ${error} - ${urlParams.get('error_description')}`);
        return;
    }

    if (code && state) {
        const expectedState = localStorage.getItem('oauth_state');
        if (state !== expectedState) {
            console.error('State mismatch! Possible CSRF attack.');
            return;
        }

        localStorage.setItem('auth_code', code);
        console.log(`Authorization code received: ${code}`);
        testTokenRequest();
        setTimeout(() => {
            window.location.href = '/KickPlus/';
        }, 2000);
    }
};
