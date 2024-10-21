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
