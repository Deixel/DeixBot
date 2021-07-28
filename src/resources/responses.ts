import Discord, { MessageFlags } from "discord.js";
import { Config, playingRow } from "../interfaces"
import { client } from "../deixbot";
const config: Config =  require("../../config");


interface ICheck {
	(msg: Discord.Message): boolean;
}
interface IAction {
	(msg: Discord.Message): void;
}


export class Response {
	constructor(check: ICheck, action: IAction) {
		this.check = check;
		this.action = action;
	}
	
	check: ICheck = (msg: Discord.Message):  boolean => {
		return false;
	}
	action: IAction = (msg: Discord.Message): void => {
		return;
	}
}

function amIMentioned(msg: Discord.Message): boolean {
	return msg.mentions.has((msg.client.user as Discord.ClientUser).id);
}

function wasSentByOwner(msg: Discord.Message): boolean {
	return msg.author.id === config.owner_id;
}

export let responses = [
	new Response( (msg) => {
			return /(hello|hi|hey|salutations)/gi.test(msg.cleanContent) && amIMentioned(msg);
		},
		(msg) => {
			return msg.channel.send(`Sal-u-tations ${msg.author} !`);
		}
	),
	new Response( (msg) => {
			return /(how are you|how are you doing|how's it going|are you ok|are you well)/gi.test(msg.cleanContent) && amIMentioned(msg);
		},
		(msg) => {
			var replies = ["I am good. Thanks for asking!", "I am functioning within normal parameters", "I am Combat Ready:tm:!"];
			return msg.channel.send(replies[Math.floor(Math.random() * replies.length)]);
		}
	),
	new Response( (msg) => {
			return msg.content.toLowerCase().includes("lewd") && amIMentioned(msg);
		},
		(msg) => {
			return msg.channel.send({ content: "Stop it, that's lewd!", 
				files: [ {
					attachment: "https://i.imgur.com/rlraAOV.png",
					name: "lewd.png"
				} ]
			});
		}
	),
	new Response( (msg) => {
			return /are you ready/gi.test(msg.cleanContent) && amIMentioned(msg);
		},
		(msg) => {
			return msg.channel.send("I'm more than ready! I'm Combat Ready!:tm:!:crossed_swords:");
		}
	),
	new Response( (msg) => {
			return /what do you know about blake/gi.test(msg.cleanContent) && amIMentioned(msg);
		},
		(msg) => {
			var replies = ["You mean the Faunus girl? :cat:", "I heard she's quite fond of tuna... :fish:"];
			return msg.channel.send(replies[Math.floor(Math.random() * replies.length)]);
		}
	),
	new Response( (msg) => {
			return /are you a real (girl|person)/gi.test(msg.cleanContent) && amIMentioned(msg);
		},
		(msg) => {
			return msg.channel.send("Of course I am. Why would you ask that? *hic*");
		}
	),
	new Response( (msg) => {
			return msg.content.toLowerCase().includes("pun") && amIMentioned(msg);
		},
		(msg) => {
			return msg.channel.send({files: ["https://i.imgur.com/ZfHfdk6.png"]});
		}
	),
	new Response( (msg) => {
			return msg.cleanContent.includes("🚜") && msg.author.id !== (msg.client.user as Discord.ClientUser).id;
		},
		(msg) => {
			return msg.react("💥");
		}
	),
	new Response( (msg) => {
			return msg.cleanContent.includes("(╯°□°）╯︵ ┻━┻");
		},
		(msg) => {
			return msg.channel.send(`Hey <@${msg.author.id}>, We try to keep this place tidy, thanks\n┬─┬ ノ( ゜-゜ノ)`);
		}
	),
	new Response( (msg) => {
			return amIMentioned(msg) && wasSentByOwner(msg) && /playing list/gi.test(msg.cleanContent);
		},
		async msg => {
			let rows = await client.db?.all<playingRow[]>("SELECT * FROM playing");
			if(rows) {
				let playingList = rows.map( p => p.playingID + " | " + p.activityType + " | "  + p.playingString ).join("\n");
				let response = new Discord.MessageEmbed({
					title: "Playing Messages",
					description: playingList,
				});
				msg.channel.send({ embeds: [response] });
			}
			else {
				msg.channel.send("Sorry, I couldn't find any playing messages :disappointed:");
			}
		}	
	),
	new Response( 
		(msg) => {
			return amIMentioned(msg) && /ping/gi.test(msg.cleanContent);
		},
		(msg) => {
			let time = Date.now();
			let message = ":ping_pong: Pong"
			msg.reply(message).then( (reply) => {
				let newTime = Date.now();
				let latency = newTime - time;
				reply.edit(message + " in " + latency + "ms");
			})
		}
	),
];
