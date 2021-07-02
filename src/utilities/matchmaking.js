const MMR_RATIO_TOO_HIGH = 1.25;
const MMR_MIN = 1500;
const MMR_MAX = 5500;

const copyTeams = teams => teams.reduce((acc, c) => {
    acc.push({
        players: copyPlayers(c.players),
        aggregate_mmr: c.aggregate_mmr
    });

    return acc;
}, []);

const copyPlayers = players => players.reduce((acc, c) => {
    acc.push({
        mmr: c.mmr
    })

    return acc;
}, []);

const createEmptyTeams = () => [...Array(2)].map(() => ({players: [], aggregate_mmr: 0}))

const totalPlayerMMR = players => {
    return players.reduce((a, {mmr}) => a + mmr, 0);
}

const desiredTeamMMR = players => Math.ceil(totalPlayerMMR(players) / 2);

const calculateMMRRatio = teams => (Math.max(teams[0].aggregate_mmr, teams[1].aggregate_mmr) / Math.min(teams[0].aggregate_mmr, teams[1].aggregate_mmr)).toFixed(2);

const calculateAverageTeamMMR = teams => Math.ceil((teams[0].aggregate_mmr + teams[1].aggregate_mmr) / 2);

const sortPlayersByMMR = players => players
    .slice(0)
    .sort(({mmr: player_a_mmr}, {mmr: player_b_mmr}) => {
        return player_a_mmr - player_b_mmr
    });

const splitPlayersWithGreed = provided_players => {
    const players = copyPlayers(provided_players);
    const max_attempts = players.length * 2;
    const desired_limit = desiredTeamMMR(players);
    const sorted_players = sortPlayersByMMR(players);
    const result = createEmptyTeams();

    for (let index = 0; sorted_players.length && index < max_attempts; index++) {
        if (result[index % 2].aggregate_mmr + sorted_players[0].mmr <= desired_limit) {
            result[index % 2].players.push(sorted_players.shift());
            result[index % 2].aggregate_mmr = totalPlayerMMR(result[index % 2].players);
        }
    }

    return {teams: result, remaining_players: sorted_players, desired_limit, ratio: calculateMMRRatio(result)};
}

const splitRemainingPlayersByMMR = (provided_teams, provided_remaining_players) => {
    const teams = copyTeams(provided_teams);
    const remaining_players = sortPlayersByMMR(copyPlayers(provided_remaining_players));

    remaining_players.forEach(player => {
        let desired_team = 0;
        let highest_team_mmr = 60000;

        teams.forEach((team, team_index) => {
            if (team.players.length < 5 && highest_team_mmr >= team.aggregate_mmr) {
                desired_team = team_index;
                highest_team_mmr = team.aggregate_mmr;
            }
        });

        teams[desired_team].players.push(player);
        teams[desired_team].aggregate_mmr = totalPlayerMMR(teams[desired_team].players);
    })

    return {
        teams,
        ratio: calculateMMRRatio(teams)
    }
}

const splitRemainingPlayersRandomly = (provided_teams, provided_remaining_players) => {
    const teams = copyTeams(provided_teams);
    const remaining_players = copyPlayers(provided_remaining_players);

    let passes = 0;
    while (remaining_players.length > 0) {
        let selected_team = Math.floor(Math.random() * teams.length);

        if (teams[selected_team].players.length >= 5) {
            continue;
        }

        passes = 0;

        teams[selected_team].players.push(remaining_players.shift());
        teams[selected_team].aggregate_mmr = totalPlayerMMR(teams[selected_team].players);
    }

    return {
        teams,
        ratio: calculateMMRRatio(teams)
    };
}

const createTeamsSensibly = (provided_players) => {
    const players = copyPlayers(provided_players);
    const greedy_split = splitPlayersWithGreed(players);

    if (greedy_split.remaining_players.length > 0) {
        const remaining_players_split_result = splitRemainingPlayersByMMR(greedy_split.teams, greedy_split.remaining_players);

        greedy_split.teams = remaining_players_split_result.teams;
        greedy_split.ratio = remaining_players_split_result.ratio;
    }

    const mmr_split = splitRemainingPlayersByMMR(createEmptyTeams(), players);

    return greedy_split.ratio > mmr_split.ratio ? greedy_split : mmr_split;
}

const createTeamsWithGreedAndRandomness = (provided_players, max_passes = 100) => {
    const players = copyPlayers(provided_players);
    const greedy_split = splitPlayersWithGreed(players);

    if (greedy_split.remaining_players.length === 0) {
        return greedy_split;
    }

    let lowest_ratio_team = undefined;

    for (let pass = 0; pass < max_passes; pass++) {
        const result = splitRemainingPlayersRandomly(copyTeams(greedy_split.teams), copyPlayers(greedy_split.remaining_players));

        if (lowest_ratio_team === undefined || lowest_ratio_team.ratio > result.ratio) {
            lowest_ratio_team = result;
        }
    }

    return lowest_ratio_team;
}

const createTeamsRandomly = (provided_players, max_passes = 100) => {
    let lowest_ratio_team = undefined;

    for (let pass = 0; pass < max_passes; pass++) {
        const result = splitRemainingPlayersRandomly(createEmptyTeams(), copyPlayers(provided_players));
        if (lowest_ratio_team === undefined || lowest_ratio_team.ratio > result.ratio) {
            lowest_ratio_team = result;
        }
    }

    return lowest_ratio_team;
};

module.exports = {
    MMR_RATIO_TOO_HIGH,
    MMR_MIN,
    MMR_MAX,
    totalPlayerMMR,
    desiredTeamMMR,
    sortPlayersByMMR,
    splitPlayersWithGreed,
    splitRemainingPlayersByMMR,
    splitRemainingPlayersRandomly,
    calculateMMRRatio,
    calculateAverageTeamMMR,
    createTeamsSensibly,
    createTeamsWithGreedAndRandomness,
    createTeamsRandomly
};