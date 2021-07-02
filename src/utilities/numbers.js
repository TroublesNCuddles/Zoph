const generateRandomNumber = (min = 0, max = 10) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateRandomPlayers = (amount = 10) => {
    const players = [];

    for (let current_player = 0; current_player < amount; current_player++) {
        players.push({id: current_player, mmr: generateRandomNumber(1500, 5500)});
    }

    return players;
}

module.exports = {
    generateRandomNumber,
    generateRandomPlayers
};