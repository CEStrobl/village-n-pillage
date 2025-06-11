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

const gamePlayers = initTurnOrder(assignRandomRoles(playerNames, allRoleObjects))

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

		if(counter == 0) {

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

	counter++;
	// Day Phase
	print("===== DAY " + "  " + " " + (counter) + " =====");

	//register dead players
	gamePlayers.forEach(player => {
		if (player.dying) {
			print(player.display() + " has died.");
			player.alive = false;
			player.dying = false; // reset dying status
		}
	});






	if(counter === 5) {
		endGameCondition = true;
	}
}