const Matchmaking = require('./src/utilities/matchmaking.js');
const Numbers = require('./src/utilities/numbers.js');

const logTeams = (algorithm, teams, players) => {
    console.log(
        '\n\n%s\nSplit %d players into 2 teams, with a desired team MMR of %d, actual average team MMR %d. MMR Ratio %d\n\tTeam Blue: [Team MMR: %d, Players: %s]\n\tTeam Orange: [Team MMR: %d, Players: %s]',
        algorithm.toUpperCase(),
        players.length,
        Matchmaking.desiredTeamMMR(players),
        Matchmaking.calculateAverageTeamMMR(teams),
        Matchmaking.calculateMMRRatio(teams),
        teams[0].aggregate_mmr,
        teams[0].players.map(({mmr}) => mmr).join(', '),
        teams[1].aggregate_mmr,
        teams[1].players.map(({mmr}) => mmr).join(', '),
        Matchmaking.calculateMMRRatio(teams) > Matchmaking.MMR_RATIO_TOO_HIGH ? '\nWARNING POSSIBLY IMBALANCED' : ''
    )
}

for(let pass = 0; pass < 10; pass++) {
    const generated_players = Numbers.generateRandomPlayers(Numbers.generateRandomNumber(7, 10));
    console.log('Pass #%d: Generated %d Players: [%s]', pass + 1, generated_players.length, generated_players.map(({mmr}) => mmr).join(', '));
    const sensible_teams = Matchmaking.createTeamsSensibly(generated_players);
    logTeams('Greed & Sensibility', sensible_teams.teams, generated_players)
    const greed_and_random_teams = Matchmaking.createTeamsWithGreedAndRandomness(generated_players);
    logTeams('Greed & Random', greed_and_random_teams.teams, generated_players)
    const random_teams = Matchmaking.createTeamsRandomly(generated_players);
    logTeams('Pure Random', random_teams.teams, generated_players)
}