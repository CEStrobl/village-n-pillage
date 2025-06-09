const gamelog = document.getElementById("gamelog");

function print(input) {
	gamelog.innerHTML += input.toString()+`<br>`;
}

function printPlayer(player) {
	let color1 = "";
	let color2 = "";

	if (player.role.alignment === "Peaceful") {
		color1 = "lgreen";
		color2 = "green";
	}
	else if (player.role.alignment === "Hostile") {
		color1 = "lred";
		color2 = "red";
	} else {
		color1 = "lblue"; // Neutral or other roles
		color2 = "blue";
	}

	let trimmedName = player.name.slice(0, 5);
	let trimmedRole = player.role.name.slice(0, 5);

	if (trimmedRole.length < 5) {
		trimmedRole = trimmedRole.padEnd(5, ".");
	}

	const playerInfo = `<span class="${color2}">[${trimmedRole}]</span> <span class="${color1}">${trimmedName}</span><br>`;
	gamelog.innerHTML += playerInfo;
}
