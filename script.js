// Static stream data (to be updated manually)
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
  
  // List of Kick categories for suggestions
  const kickCategories = [
    "Just Chatting",
    "Slots & Casino",
    "GTA RP",
    "Fortnite",
    "Call of Duty: Warzone",
    "Apex Legends",
    "Valorant",
    "Pools, Hot Tubs & Bikinis",
    "Other, Watch Party",
    "Music",
    "IRL",
    "Diablo IV",
    "Rocket League"
  ];
  
  document.getElementById('category').addEventListener('input', function(e) {
    const input = e.target.value.toLowerCase();
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';
    suggestions.style.display = 'none';
  
    if (input) {
      const filteredCategories = kickCategories.filter(cat => 
        cat.toLowerCase().includes(input)
      );
      if (filteredCategories.length > 0) {
        filteredCategories.forEach(cat => {
          const div = document.createElement('div');
          div.textContent = cat;
          div.addEventListener('click', () => {
            document.getElementById('category').value = cat;
            suggestions.style.display = 'none';
          });
          suggestions.appendChild(div);
        });
        suggestions.style.display = 'block';
        suggestions.style.left = e.target.offsetLeft + 'px';
        suggestions.style.top = (e.target.offsetTop + e.target.offsetHeight + 5) + 'px';
      }
    }
  });
  
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#filterForm')) {
      document.getElementById('suggestions').style.display = 'none';
    }
  });
  
  document.getElementById('filterForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const filters = {
      category: document.getElementById('category').value.toLowerCase(),
      status: document.getElementById('status').value.toLowerCase(),
      language: document.getElementById('language').value.toLowerCase(),
      maxViewers: parseInt(document.getElementById('maxViewers').value) || Infinity
    };
  
    const filteredStreams = streamsData.filter(stream => {
      return (
        (!filters.category || stream.category.toLowerCase().includes(filters.category)) &&
        (stream.status === filters.status) &&
        (!filters.language || stream.language.includes(filters.language)) &&
        (stream.viewers <= filters.maxViewers)
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