const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8443;

app.use(cors());
app.use(bodyParser.json());

// 로깅 미들웨어
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const gamesFilePath = path.join(__dirname, 'games.json');

function readGames() {
    try {
        const data = fs.readFileSync(gamesFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading games:', err);
        return [];
    }
}

function writeGames(games) {
    try {
        fs.writeFileSync(gamesFilePath, JSON.stringify(games, null, 2));
    } catch (err) {
        console.error('Error writing games:', err);
    }
}

// 루트 경로 핸들러 추가
app.get('/', (req, res) => {
    const games = readGames();
    let html = '<h1>체육대회 서버</h1>';
    html += '<h2>게임 목록:</h2>';
    html += '<ul>';
    games.forEach(game => {
        html += `<li>${game.name}: ${game.score.join(' vs ')}</li>`;
    });
    html += '</ul>';

    // 순위 계산
    const teamScores = {};
    games.forEach(game => {
        game.score.forEach((score, index) => {
            const teamName = game.teams[index];
            if (!teamScores[teamName]) {
                teamScores[teamName] = 0;
            }
            teamScores[teamName] += score;
        });
    });

    const sortedTeams = Object.entries(teamScores)
        .sort((a, b) => b[1] - a[1]);

    html += '<h2>순위:</h2>';
    html += '<ol>';
    sortedTeams.forEach(([team, score]) => {
        html += `<li>${team}: ${score}점</li>`;
    });
    html += '</ol>';

    res.send(html);
});

app.get('/api/games', (req, res) => {
    const games = readGames();
    res.json(games);
});

app.post('/api/games', (req, res) => {
    const games = req.body;
    writeGames(games);
    res.json(games);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
