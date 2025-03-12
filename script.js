const streamsData = [
    {
      channel: "zzRevolt",
      category: "Fortnite",
      status: "live",
      language: "english",
      viewers: 150,
      url: "https://kick.com/zzRevolt"
    },
    {
      channel: "StreamerX",
      category: "IRL",
      status: "offline",
      language: "spanish",
      viewers: 50,
      url: "https://kick.com/StreamerX"
    },
    {
      channel: "GamerY",
      category: "Fortnite",
      status: "live",
      language: "english",
      viewers: 200,
      url: "https://kick.com/GamerY"
    }
  ];
  
  document.getElementById('filterForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const filters = {
      category: document.getElementById('category').value.toLowerCase(),
      status: document.getElementById('status').value.toLowerCase(),
      language: document.getElementById('language').value.toLowerCase(),
      minViewers: parseInt(document.getElementById('minViewers').value) || 0
    };
  
    const filteredStreams = streamsData.filter(stream => {
      return (
        (!filters.category || stream.category.toLowerCase().includes(filters.category)) &&
        (stream.status === filters.status) &&
        (!filters.language || stream.language.includes(filters.language)) &&
        (stream.viewers >= filters.minViewers)
      );
    });
  
    const streamList = document.getElementById('streamList');
    streamList.innerHTML = '';
    if (filteredStreams.length === 0) {
      streamList.innerHTML = '<li>No streams match your filters.</li>';
    } else {
      filteredStreams.forEach(stream => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${stream.channel}</strong> (Kick)<br>
          Category: ${stream.category}<br>
          Status: ${stream.status}<br>
          Language: ${stream.language}<br>
          Viewers: ${stream.viewers}<br>
          <a href="${stream.url}" target="_blank">Watch Now</a>
        `;
        streamList.appendChild(li);
      });
    }
  });