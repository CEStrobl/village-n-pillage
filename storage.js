class Player {
	constructor(id, name, role) {
		this.id = id;
		this.name = name;
		this.alive = true;

		this.role = role;
		this.tag = "";

		// Night action state
		this.hasUsedAbility = false;
		this.target = null;
		this.disabled = false;
		this.vexed = false;
		this.protected = false;

		// Knowledge tracking
		this.knowledge = {
			peacefulPlayers: [],
			hostilePairs: [],
			hostileCount: 0,
			deadPlayers: []
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
}

const Roles = {
	Farmer: {
		name: "Farmer",
		alignment: "Peaceful",
		priority: 30,
		appearsAs: "Peaceful",
		notes: "Learns two players who are Peaceful at the start.",
		action: (thisPlayer, players) => {
			let revealed = players
				.filter(p => p.id !== thisPlayer.id && p.role.appearsAs === "Peaceful")
				.slice(0, 2);
			
			revealed.forEach(player =>
				print(`${thisPlayer.display()} learned ${player.display()} is Peaceful.`)
			);

			thisPlayer.knowledge.peacefulPlayers.push(...revealed);
			thisPlayer.hasUsedAbility = true;
			
			return revealed;
		}
	},

	Cleric: {
		name: "Cleric",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "Each night, protect one player from death.",
		priority: -2
	},
	Blacksmith: {
		name: "Blacksmith",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "If your chosen player is attacked, attacker is revealed.",
		priority: 3
	},
	Allay: {
		name: "Allay",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "Once per game, revive a dead player (fails if Hostile).",
		priority: 20
	},
	Cartographer: {
		name: "Cartographer",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "Each night, see who a player targeted.",
		priority: 50
	},
	Librarian: {
		name: "Librarian",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "Choose two players. Learn if at least one is Hostile.",
		priority: 5
	},
	IronGolem: {
		name: "Iron Golem",
		alignment: "Peaceful",
		appearsAs: "Peaceful",
		notes: "Protects a player. Kills their attacker once per game.",
		priority: -1
	},
	WanderingTrader: {
		name: "Wandering Trader",
		alignment: "Peaceful",
		appearsAs: "Hostile",
		notes: "Knows how many Hostiles have died. Appears Hostile.",
		priority: -3
	},
	Nitwit: {
		name: "Nitwit",
		alignment: "Neutral",
		appearsAs: "Peaceful",
		notes: "Wins only if executed (not killed other ways).",
		priority: 40
	},
	Witch: {
		name: "Witch",
		alignment: "Neutral",
		appearsAs: "Hostile",
		notes: "Blocks one player's action each night. Wins if survives to final 3.",
		priority: -6
	},
	Vindicator: {
		name: "Vindicator",
		alignment: "Hostile",
		appearsAs: "Hostile",
		notes: "Kills a player each night.",
		priority: 0
	},
	Pillager: {
		name: "Pillager",
		alignment: "Hostile",
		appearsAs: "Hostile",
		notes: "Knows Vindicator. Gains kill ability if they die.",
		priority: 1
	},
	Vex: {
		name: "Vex",
		alignment: "Hostile",
		appearsAs: "Hostile",
		notes: "Redirects a player's action to a random target.",
		priority: -5
	},
	Evoker: {
		name: "Evoker",
		alignment: "Hostile",
		appearsAs: "Hostile",
		notes: "Each night, use a dead player's ability.",
		priority: -4
	}
};



