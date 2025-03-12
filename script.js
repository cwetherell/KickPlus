async function findStreams() {
    // Get filter values
    const genre = document.getElementById('genre').value;
    const vibe = document.getElementById('vibe').value;
    const viewers = document.getElementById('viewers').value;

    // Replace with your Kick API key
    const apiKey = 'YOUR_API_KEY_HERE';

    try {
        // Fetch live streams from Kick API
        const response = await fetch('https://kick.com/api/v2/livestreams', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Filter streams based on user inputs
        const filteredStreams = data.filter(stream => {
            const matchesGenre = !genre || stream.categories.some(cat => 
                cat.name.toLowerCase().includes(genre.toLowerCase())
            );
            const matchesViewers = viewers <= stream.viewer_count;
            // Vibe filter TBD - could use stream title or tags later
            return matchesGenre && matchesViewers;
        });

        // Update the UI with filtered streams
        updateResults(filteredStreams);
    } catch (error) {
        console.error('Error fetching streams:', error);
        alert('Failed to load streams. Check console for details.');
    }
}

function updateResults(streams) {
    const results = document.getElementById('results');
    if (streams.length === 0) {
        results.innerHTML = '<p>No matching streams found.</p>';
        return;
    }

    results.innerHTML = streams.map(stream => `
        <div class="stream-card">
            <img src="${stream.thumbnail.url}" alt="${stream.user.username}">
            <h3>${stream.user.username}</h3>
            <p>Playing: ${stream.categories[0]?.name || 'Unknown'} | Viewers: ${stream.viewer_count}</p>
            <p>Vibe: TBD</p>
            <a href="https://kick.com/${stream.user.username}" target="_blank">Watch Now</a>
        </div>
    `).join('');
}

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
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Initiate the OAuth flow by redirecting to Kick's authorization endpoint
async function startOAuthFlow() {
    // Generate code_verifier and state
    const codeVerifier = generateRandomString(43);
    const state = generateRandomString(16);

    // Save code_verifier and state to localStorage for later use
    localStorage.setItem('code_verifier', codeVerifier);
    localStorage.setItem('oauth_state', state);

    // Generate code_challenge
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Construct the authorization URL with the updated client ID
    const authorizeUrl = `https://api.kick.com/public/v1/oauth/authorize?` +
        `client_id=01JNYTD64KZNRM97QVNFMJCGA8` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent('https://cwetherell.github.io/KickPlus/callback.html')}` +
        `&scope=channel:read` +
        `&state=${state}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256`;

    // Redirect the user to Kick's authorization page
    window.location.href = authorizeUrl;
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

    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: '01JNYTD64KZNRM97QVNFMJCGA8', // Updated client ID
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

// Optional: Automatically handle token exchange after returning from callback
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

        // Save the auth code to localStorage
        localStorage.setItem('auth_code', code);
        console.log(`Authorization code received: ${code}`);

        // Automatically test the token request
        testTokenRequest();

        // Redirect back to the main page after a delay
        setTimeout(() => {
            window.location.href = '/KickPlus/'; // Adjust the path as needed
        }, 2000);
    }
};
