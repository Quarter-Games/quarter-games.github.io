document.addEventListener('DOMContentLoaded', () => {
    const gamesContainer = document.getElementById('games-container');
    const modal = document.getElementById('game-modal');
    const closeBtn = document.querySelector('.close-btn');
    const gameDetailsContainer = document.getElementById('game-details');

    // Fetch master list of games
    fetch('data/games.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load games data');
            return response.json();
        })
        .then(games => {
            if (gamesContainer) renderGameCards(games);
        })
        .catch(err => {
            console.error(err);
            if (gamesContainer) gamesContainer.innerHTML = '<p>Error loading games.</p>';
        });

    function renderGameCards(games) {
        gamesContainer.innerHTML = '';
        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <img src="${game.thumbnail}" alt="${game.title} Thumbnail" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><rect width=\\'100\\' height=\\'100\\' fill=\\'%23444\\'/></svg>'">
                <div class="game-info">
                    <h3>${game.title}</h3>
                    <p>${game.shortDescription}</p>
                </div>
            `;
            
            // On click, load specific game JSON
            card.addEventListener('click', () => openGameModal(game.dataFile));
            gamesContainer.appendChild(card);
        });
    }

    function openGameModal(dataFile) {
        gameDetailsContainer.innerHTML = '<p>Loading...</p>';
        modal.classList.remove('hidden');

        fetch(dataFile)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load specific game data');
                return res.json();
            })
            .then(gameData => {
                renderGameDetails(gameData);
            })
            .catch(err => {
                console.error(err);
                gameDetailsContainer.innerHTML = '<p>Error loading game details.</p>';
            });
    }

    function renderGameDetails(data) {
        let platformsHtml = data.platforms.map(p => `<span class="platform-tag">${p}</span>`).join('');
        
        let mediaHtml = '';
        if (data.videoType === 'youtube') {
            mediaHtml = `
                <div class="video-container">
                    <iframe src="${data.videoUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        } else if (data.videoType === 'local') {
            mediaHtml = `
                <div class="video-container">
                    <video controls>
                        <source src="${data.videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
        } else {
            mediaHtml = `<img src="${data.banner}" alt="${data.title} Banner" onerror="this.style.display='none'">`;
        }

        gameDetailsContainer.innerHTML = `
            <div class="modal-body horizontal-layout">
                <div class="modal-media">
                    <h2>${data.title}</h2>
                    ${mediaHtml}
                </div>
                <div class="modal-info">
                    <div class="modal-meta">
                        <span><strong>Genre:</strong> ${data.genre}</span>
                        <span><strong>Release Date:</strong> ${data.releaseDate}</span>
                    </div>
                    <p>${data.fullDescription}</p>
                    <div class="platforms">
                        <strong>Available on:</strong><br><br>
                        ${platformsHtml}
                    </div>
                    <br>
                    <a href="${data.website}" target="_blank" class="btn primary-btn">Visit Website</a>
                </div>
            </div>
        `;
    }

    // Modal close behavior
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            gameDetailsContainer.innerHTML = ''; // Stop video playback
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            gameDetailsContainer.innerHTML = ''; // Stop video playback
        }
    });
});