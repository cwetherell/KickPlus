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
    },
    {
      channel: "BigStreamer",
      category: "Slots & Casino",
      status: "live",
      language: "english",
      viewers: 500,
      url: "https://kick.com/BigStreamer"
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
  
  // Category suggestion logic
  document.getElementById('category').addEventListener('input', function(e) {
    const input = e.target.value.toLowerCase();
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';
    suggestions.style.display = 'none';
  
    if (input) {
      const filteredCategories = kickCategories.filter(cat => 
        cat.toLowerCase().includes(input)
      ).slice(0, 5); // Limit to 5 suggestions
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
  
  // Form submission and filtering
  document.getElementById('filterForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const loading = document.getElementById('loading');
    const streamList = document.getElementById('streamList');
    loading.style.display = 'block';
    streamList.innerHTML = '';
  
    setTimeout(() => { // Simulate loading delay
      const filters = {
        category: document.getElementById('category').value.toLowerCase(),
        status: document.getElementById('status').value.toLowerCase(),
        language: document.getElementById('language').value.toLowerCase(),
        maxViewers: parseInt(document.getElementById('maxViewers').value) || Infinity
      };
  
      const filteredStreams = streamsData.filter(stream => {
        const categoryMatch = !filters.category || stream.category.toLowerCase().includes(filters.category);
        const statusMatch = stream.status === filters.status;
        const languageMatch = !filters.language || stream.language.includes(filters.language);
        const viewersMatch = stream.viewers <= filters.maxViewers;
  
        return categoryMatch && statusMatch && languageMatch && viewersMatch;
      });
  
      loading.style.display = 'none';
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
    }, 500); // 500ms delay to simulate loading
  });
  
  // Reset form
  document.getElementById('resetButton').addEventListener('click', () => {
    document.getElementById('filterForm').reset();
    document.getElementById('streamList').innerHTML = '';
    document.getElementById('suggestions').style.display = 'none';
  });