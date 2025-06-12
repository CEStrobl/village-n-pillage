function assignRandomRoles(playerNames, roleList) {

	const playerCount = playerNames.length;;

	let Peaceful = [];
	let Hostile = [];
	let Neutral = [];

	let selectedRoles = [];

	roleList.forEach(role => {
		if(role.alignment === "Peaceful") {
			Peaceful.push(role);
		} else if(role.alignment === "Hostile") {
			// reserve the vindicator to always be in the game
			if(role.name === "Vindicator") {
				selectedRoles.push(role);
			} else {
				Hostile.push(role);
			}
		} else {
			Neutral.push(role);
		}
	});

	let HostAndNeutral = Hostile.concat(Neutral);

	// pick 1-3 Hostile roles randomly
	const randomHostileCount = Math.floor(Math.random() * (playerCount/4)) + 1;
	const shuffledBadRoles = [...HostAndNeutral].sort(() => Math.random() - 0.5);
	selectedRoles = selectedRoles.concat(shuffledBadRoles.slice(0, randomHostileCount));

	const shuffledGoodRoles = [...Peaceful].sort(() => Math.random() - 0.5);
	selectedRoles = selectedRoles.concat(shuffledGoodRoles.slice(0, (playerCount - selectedRoles.length) ));

	selectedRoles = [...selectedRoles].sort(() => Math.random() - 0.5);
	// Create Player objects with assigned roles
	return playerNames.map((name, index) => {
		return new Player(index, name, selectedRoles[index]);
	});
}


function initTurnOrder(players) {
	// select turn order by role.priority
	players.sort((a, b) => a.role.priority - b.role.priority);
	return players;
}
const allRoleObjects = Object.values(Roles);
const playerNames = ["Charlotte", "Caroline", "Westin", "Hudson", "Bella", "Lacey", "Caleb"];
const gamePlayers = initTurnOrder(assignRandomRoles(playerNames, allRoleObjects));

const game = {
	endGameCondition: false,
	counter: 0,
	deathHappened: false,
	deadPlayers: [],
}

print("Game Players:");
gamePlayers.forEach(player => {
	print(player.display());
});

// day & night cycle
while (!game.endGameCondition) {	

	// Night Phase
	print(" ")
	print("===== NIGHT " + (game.counter) + " =====");
	gamePlayers.forEach(player => {

		if(game.counter == 0) {

			// if the player is alive, use their night action
			if (player.role.name == "Farmer") {
				player.role.action(player, gamePlayers);
			} 
		} else {
			// if the player is alive, use their night action
			if (player.alive) {
				player.role.action(player, gamePlayers);
			} 

		}
		
	});

	game.counter++;
	// Day Phase
	print(" ")
	print(`===== DAY  - ${game.counter} =====`);

	//register dead players
	gamePlayers.forEach(player => {
		if (player.dying) {
			print(player.display() + " has died.");
			player.alive = false;
			player.dying = false; // reset dying status
			game.deathHappened = true;
		}
	});

	if (game.deathHappened) {
		print(`The villagers are shocked!!`);
		game.deathHappened = false;

	} else {
		print(`The villagers are relieved`)
	}

	// villager discussion
	gamePlayers.forEach(player => {
		if (player.alive) {
			// talk to players on the peaceful list
			const alivePeaceful = player.memory.peacefulPlayers.filter(p => p.alive && p !== player);
			if (alivePeaceful.length > 0) {
				alivePeaceful.forEach(peacefulPlayer => {
					if(!peacefulPlayer.memory.peacefulPlayers.includes(player)) {
						player.talkToPlayer(peacefulPlayer);
					}
				});
			}
		}
	});









	if(game.counter === 5) {
		game.endGameCondition = true;
	}
}