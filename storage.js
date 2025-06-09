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
		nightAction: 0,
		appearsAs: "Peaceful",
		winCondition: "standard",
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
		nightAction: "protect",
		appearsAs: "Peaceful",
		winCondition: "standard",
		notes: "Each night, protect one player from death."
	},
	Blacksmith: {
		name: "Blacksmith",
		alignment: "Peaceful",
		nightAction: "revealAttacker",
		appearsAs: "Peaceful",
		winCondition: "standard",
		notes: "If your chosen player is attacked, attacker is revealed."
	},
	Allay: {
		name: "Allay",
		alignment: "Peaceful",
		nightAction: "revive",
		appearsAs: "Peaceful",
		winCondition: "standard",
		notes: "Once per game, revive a dead player (fails if Hostile)."
	},
	Cartographer: {
		name: "Cartographer",
		alignment: "Peaceful",
		nightAction: "track",
		appearsAs: "Peaceful",
		winCondition: "standard",
		notes: "Each night, see who a player targeted."
	},
	Librarian: {
		name: "Librarian",
		alignment: "Peaceful",
		nightAction: "checkHostilePair",
		appearsAs: "Peaceful",
		winCondition: "standard",
		notes: "Choose two players. Learn if at least one is Hostile."
	},
	IronGolem: {
		name: "Iron Golem",
		alignment: "Peaceful",
		nightAction: "protectKillOnce",
		appearsAs: "Peaceful",
		winCondition: "standard",
		notes: "Protects a player. Kills their attacker once per game."
	},
	WanderingTrader: {
		name: "Wandering Trader",
		alignment: "Peaceful",
		nightAction: "countHostiles",
		appearsAs: "Hostile",
		winCondition: "standard",
		notes: "Knows how many Hostiles have died. Appears Hostile."
	},
	Nitwit: {
		name: "Nitwit",
		alignment: "Neutral",
		nightAction: null,
		appearsAs: "Peaceful",
		winCondition: "executed",
		notes: "Wins only if executed (not killed other ways)."
	},
	Witch: {
		name: "Witch",
		alignment: "Neutral",
		nightAction: "blockAbility",
		appearsAs: "Hostile",
		winCondition: "surviveToFinal3",
		notes: "Blocks one player's action each night. Wins if survives to final 3."
	},
	Vindicator: {
		name: "Vindicator",
		alignment: "Hostile",
		nightAction: "kill",
		appearsAs: "Hostile",
		winCondition: "eliminatePeacefuls",
		notes: "Kills a player each night."
	},
	Pillager: {
		name: "Pillager",
		alignment: "Hostile",
		nightAction: null,
		appearsAs: "Hostile",
		winCondition: "eliminatePeacefuls",
		notes: "Knows Vindicator. Gains kill ability if they die."
	},
	Vex: {
		name: "Vex",
		alignment: "Hostile",
		nightAction: "redirect",
		appearsAs: "Hostile",
		winCondition: "eliminatePeacefuls",
		notes: "Redirects a player's action to a random target."
	},
	Evoker: {
		name: "Evoker",
		alignment: "Hostile",
		nightAction: "copyDead",
		appearsAs: "Hostile",
		winCondition: "eliminatePeacefuls",
		notes: "Each night, use a dead player's ability."
	}
};



