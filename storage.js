class Player {
	constructor(id, name, role) {
		this.id = id;
		this.name = name;
		this.alive = true;

		this.role = role;
		this.tag = "";

		// Night action state
		this.target = null;
		this.disabled = false;
		this.vexed = false;
		this.protected = false;
		this.attacked = false;
		this.attackedBy = null; // Player who attacked this player
		this.dying = false;


		// memory tracking
		this.memory = {
			peacefulPlayers: [],
			hostilePlayers: [],
			hostileCount: 0
		};
	}

	display() {
		if(this.tag === "") {
			let colorMap = {
				Peaceful: ["lgreen", "green"],
				Hostile: ["lred", "red"],
				Neutral: ["lblue", "blue"]
			};
	
			let [color1, color2] = colorMap[this.role.alignment] || ["lgray", "gray"];
			let trimmedName = this.name.slice(0, 5);
			let trimmedRole = this.role.name.slice(0, 5).padEnd(5, ".");
			return `<span class="${color2}">[${trimmedRole}]</span> <span class="${color1}">${trimmedName}</span>`;
		}
		return this.tag;


	}

	selectTarget(players, alignment) {
		if (this.disabled) {
			print(`${this.display()} is disabled and cannot select a target.`);
			return null;
		}
		else if (this.vexed) {
			// Vexed players redirect their action to a random target
			let randomTargets = players.filter(p => p.id !== this.id && p.alive);
			if (randomTargets.length === 0) {
				print(`${this.display()} has no valid targets to redirect to.`);
				return null;
			}
			const randomTarget = randomTargets[Math.floor(Math.random() * randomTargets.length)];
			print(`${this.display()} is vexed and redirects their action to ${randomTarget.display()}.`);
			return randomTarget;
		}

		// Filter available targets based on alignment
		let availableTargets = players.filter(p => p.id !== this.id && p.alive);

		if (alignment !== undefined) {
			// pull from memory
			if (alignment === "Peaceful" && this.memory.peacefulPlayers.length > 0) {
				availableTargets = availableTargets.filter(p => this.memory.peacefulPlayers.includes(p.id));
			} else if (alignment === "Hostile" && this.memory.hostilePlayers.length > 0) {
				availableTargets = availableTargets.filter(p => this.memory.hostilePlayers.includes(p.id));
			}
			
			// for allay to select a dead player
			else if (alignment === "Dead") {
				// doesnt need to pull from memory since everyone knows who is dead
				availableTargets = players.filter(p => p.id !== this.id && !p.alive);
				//but filter out any known Hostile players
				availableTargets = availableTargets.filter(p => !this.memory.hostilePlayers.includes(p.id));
			}
		}

		const selectedTarget = availableTargets.length > 0 ? availableTargets[Math.floor(Math.random() * availableTargets.length)] : null;
		return selectedTarget;
	}
}

const Roles = {
	Farmer: {
		name: "Farmer",
		hasUsedAbility: false,
		alignment: "Peaceful",
		priority: 30,
		appearsAs: "Peaceful",
		notes: "Learns two players who are Peaceful at the start.",
		action: (thisPlayer, players) => {

			if (thisPlayer.hasUsedAbility) {
				return [];
			}else {
				let revealed = players
					.filter(p => p.id !== thisPlayer.id && p.role.appearsAs === "Peaceful")
					.slice(0, 2);
				
				revealed.forEach(player =>
					print(`${thisPlayer.display()} learned ${player.display()} is Peaceful.`)
				);
	
				thisPlayer.memory.peacefulPlayers.push(...revealed);
				thisPlayer.hasUsedAbility = true;
				
				return revealed;

			}
		}
	},

	Cleric: {
		name: "Cleric",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "Each night, protect one player from death.",
		priority: -2,
		action: (thisPlayer, players) => {
			thisPlayer.target = thisPlayer.selectTarget(players, "Peaceful");
			if (!thisPlayer.target) return null;
			thisPlayer.target.protected = true;
			print(`${thisPlayer.display()} healed ${thisPlayer.target.display()}.`);
			return thisPlayer.target;
		}
	},
	Blacksmith: {
		name: "Blacksmith",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "If your chosen player is attacked, attacker is revealed.",
		priority: 3,
		action: (thisPlayer, players) => {
			thisPlayer.target = thisPlayer.selectTarget(players);
			if (!thisPlayer.target) return null;
			if (thisPlayer.target.attacked) {
				print(`${thisPlayer.display()} learned that ${thisPlayer.target.display()} was attacked by ${thisPlayer.target.attackedBy.display()}.`);
				thisPlayer.memory.hostilePlayers.push(thisPlayer.target.attackedBy.id);
			} else {
				print(`${thisPlayer.display()} chose ${thisPlayer.target.display()} but they were not attacked.`);
			}
			return thisPlayer.target;
		}
	},
	Allay: {
		name: "Allay",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "Once per game, revive a dead player (fails if Hostile).",
		priority: 20,
		action: (thisPlayer, players) => {
			let deadPlayers = players.filter(p => !p.alive && p.role.appearsAs !== "Hostile");
			if (deadPlayers.length === 0) {
				print(`${thisPlayer.display()} has no valid dead players to revive.`);
				return null;
			}
			thisPlayer.target = thisPlayer.selectTarget(deadPlayers, "Dead");
			if (!thisPlayer.target) return null;

			thisPlayer.target.alive = true;
			print(`${thisPlayer.display()} revived ${thisPlayer.target.display()}.`);
			return thisPlayer.target;
		}
	},
	Cartographer: {
		name: "Cartographer",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "Each night, see who a player targeted.",
		priority: 50,
		action: (thisPlayer, players) => {
			thisPlayer.target = thisPlayer.selectTarget(players);
			if (!thisPlayer.target) return null;

			let actionTarget = thisPlayer.target.target ? thisPlayer.target.target.display() : "no one";
			print(`${thisPlayer.display()} learned that ${thisPlayer.target.display()} targeted ${actionTarget}.`);
			return thisPlayer.target;
		}
	},
	Librarian: {
		name: "Librarian",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "Choose two players. Learn if at least one is Hostile.",
		priority: 5,
		action: (thisPlayer, players) => {
			let targets = []

			targets.push(thisPlayer.selectTarget(players, "Peaceful"));
			targets.push(thisPlayer.selectTarget(players, "Hostile"));
			thisPlayer.target = targets[0];

			console.log(targets);
			if (!thisPlayer.target || !targets[1]) return null;	

			// learns if at least one is hostile
			let isHostile = targets.some(p => p.role.appearsAs === "Hostile");
			if (isHostile) {
				print(`${thisPlayer.display()} learned that at ${targets[0].display()} and/or ${targets[1].display()} is Hostile.`);
				thisPlayer.memory.hostilePlayers.push(targets[0].id, targets[1].id);
			} else {
				print(`${thisPlayer.display()} learned that neither ${targets[0].display()} nor ${targets[1].display()} is Hostile.`);
			}

		}
	},
	IronGolem: {
		name: "Iron Golem",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "Protects a player. Kills their attacker once per game.",
		priority: 2,
		action: (thisPlayer, players) => {
			thisPlayer.target = thisPlayer.selectTarget(players, "Peaceful");
			if (!thisPlayer.target) return null;

			// If the target is attacked, the attacker is killed
			if (thisPlayer.target.attacked) {
				print(`${thisPlayer.display()} killed ${thisPlayer.target.attackedBy.display()} for attacking ${thisPlayer.target.display()}.`);
				thisPlayer.target.attackedBy.alive = false; // Kill the attacker
			} else {
				print(`${thisPlayer.display()} defended ${thisPlayer.target.display()} but they were not attacked.`);
			}

			return thisPlayer.target;
		}
	},
	WanderingTrader: {
		name: "Wandering Trader",
		alignment: "Peaceful",
		appearsAs: "Hostile",
		notes: "Knows how many Hostiles have died. Appears Hostile.",
		priority: -3,
		action: (thisPlayer, players) => {
			let hostileCount = players.filter(p => p.role.appearsAs === "Hostile" && !p.alive).length;
			print(`${thisPlayer.display()} knows that ${hostileCount} Hostile players have died.`);
			thisPlayer.memory.hostileCount = hostileCount;
			return null; // No target, just knowledge
		}
	},
	Nitwit: {
		name: "Nitwit",
		alignment: "Neutral",
		appearsAs: "Peaceful",
		notes: "Wins only if executed (not killed other ways).",
		priority: 40,
		action: (thisPlayer, players) => {
			print(`${thisPlayer.display()} sleeps peacefully through the night.`);
			return null;
		}
	},
	Witch: {
		name: "Witch",
		alignment: "Neutral",
		appearsAs: "Hostile",
		notes: "Blocks one player's action each night. Wins if survives to final 3.",
		priority: -6,
		action: (thisPlayer, players) => {
			thisPlayer.target = thisPlayer.selectTarget(players);
			if (!thisPlayer.target) return null;

			thisPlayer.target.blocked = true;
			print(`${thisPlayer.display()} blocked ${thisPlayer.target.display()}'s action.`);
			return thisPlayer.target;
		}
	},
	Vindicator: {
		name: "Vindicator",
		alignment: "Hostile",
		appearsAs: "Hostile",
		notes: "Kills a player each night.",
		priority: 0,
		action: (thisPlayer, players) => {
			thisPlayer.target = thisPlayer.selectTarget(players, "Peaceful");
			if (!thisPlayer.target) return null;

			if (!thisPlayer.target.protected && !thisPlayer.blocked) {
				thisPlayer.target.dying = true; // Kill the target
			}

			print(`${thisPlayer.display()} killed ${thisPlayer.target.display()}.`);
			return thisPlayer.target;
		}
	},
	Pillager: {
		name: "Pillager",
		alignment: "Hostile",
		appearsAs: "Hostile",
		notes: "Knows Vindicator. Gains kill ability if they die.",
		priority: 1,

		action(thisPlayer, players) {
			const vindicatorDead = players.some(p => p.role.name === "Vindicator" && !p.alive);

			if (!vindicatorDead) {
				print(`${thisPlayer.display()} sleeps peacefully.`);
				
			} else {
				print(`${thisPlayer.display()} has gained the ability to kill because Vindicator is dead.`);
	
				const target = thisPlayer.selectTarget(players, "Peaceful");
				if (!target) return null;

				if (!target.protected && !thisPlayer.blocked) {
					
					target.alive = false; // Kill the target
					print(`${thisPlayer.display()} killed ${target.display()}.`);
					thisPlayer.target = target;
				} else {
					print(`${thisPlayer.display()} tried to kill ${target.display()} but it failed.`);
				}
	

			}

		}
	},
	Vex: {
		name: "Vex",
		alignment: "Hostile",
		appearsAs: "Hostile",
		notes: "Redirects a player's action to a random target.",
		priority: -5,
		action: (thisPlayer, players) => {
			thisPlayer.target = thisPlayer.selectTarget(players);
			if (!thisPlayer.target) return null;

			if(!thisPlayer.blocked) {
				thisPlayer.vexed = true; // Mark this player as vexed
				print(`${thisPlayer.display()} vexed ${thisPlayer.target.display()}.`);
			}

		}
	},
	Evoker: {
		name: "Evoker",
		alignment: "Hostile",
		appearsAs: "Hostile",
		notes: "Each night, use a dead player's ability.",
		priority: -4,
		action: (thisPlayer, players) => {
			// Find a dead player to use their ability
			let deadPlayers = players.filter(p => !p.alive);
			if (deadPlayers.length === 0) {
				print(`${thisPlayer.display()} has no dead players to use abilities from.`);
				return null;
			}

			// Randomly select a dead player
			thisPlayer.target = deadPlayers[Math.floor(Math.random() * deadPlayers.length)];
			print(`${thisPlayer.display()} is using ${thisPlayer.target.display()}'s ability.`);
			// Call the dead player's action if it exists
			if (thisPlayer.target.role.action) {
				thisPlayer.target.role.action(thisPlayer, players);
			} else {
				print(`${thisPlayer.target.display()} has no action to use.`);
			}		
			return thisPlayer.target;
		}
	}
};



