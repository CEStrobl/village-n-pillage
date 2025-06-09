function assignRandomRoles(playerNames, roleList) {
	// Shuffle the roles randomly
	const shuffledRoles = [...roleList].sort(() => Math.random() - 0.5);

	// Trim or expand roles to match number of players
	const selectedRoles = shuffledRoles.slice(0, playerNames.length);

	// Create Player objects with assigned roles
	return playerNames.map((name, index) => {
		return new Player(index, name, selectedRoles[index]);
	});
}

const allRoleObjects = Object.values(Roles);

const playerNames = ["Charlotte", "Caroline", "Westin", "Hudson", "Bella", "Lacey", "Caleb"];

const gamePlayers = assignRandomRoles(playerNames, allRoleObjects)

print("Game Start");
