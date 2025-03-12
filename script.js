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

async function testTokenRequest() {
    const tokenUrl = 'https://api.kick.com/public/v1/oauth/token';
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: '091JNYD4k2NRM9Y0WNFHJGQA8',
        redirect_uri: 'https://cwetherell.github.io/KickPlus/callback.html',
        code: 'test-code', // Use a real code here after authorization
        code_verifier: 'test-verifier' // Use the real code_verifier here
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
    } catch (error) {
        console.error('Token request failed:', error);
    }
}

// Call the function to test
testTokenRequest();
