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

const allRoleObjects = Object.values(Roles);

const playerNames = ["Charlotte", "Caroline", "Westin", "Hudson", "Bella", "Lacey", "Caleb"];

const gamePlayers = assignRandomRoles(playerNames, allRoleObjects)

// console.log("Game Players:", gamePlayers);

print("Game Players:");
gamePlayers.forEach(player => {
	print(player.display());
});

let endGameCondition = false;

let counter = 0;

// day & night cycle
while (!endGameCondition) {	

	// Night Phase
	print("===== NIGHT " + (counter) + " =====");
	gamePlayers.forEach(player => {
		if (player.alive && player.role.nightAction || counter === 0) {
			
			// farmer
			if (player.role.name === "Farmer") {
				const revealedPlayers = player.role.action(player, gamePlayers);
			}
			// Here you would implement the logic for each player's night action
			// For example, if player.role.nightAction === "protect", then protect a target
		}
	});





	counter++;
	// Day Phase
	print("===== DAY " + (counter) + " =====");


	endGameCondition = true;
}

