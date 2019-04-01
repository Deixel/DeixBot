module.exports = [ 
	{
		check: (msg) => {
			return /(hello|hi|hey|salutations)/gi.test(msg.cleanContent) && msg.isMentioned(msg.client.user);
		},
		action: (msg) => {
			return msg.channel.sendMessage('Sal-u-tations ' + msg.author + '!');
		}
	},
	{
		check: (msg) => {
			return /(how are you|how are you doing|how's it going|are you ok|are you well)/gi.test(msg.cleanContent) && msg.isMentioned(msg.client.user);
		},
		action: (msg) => {
			var replies = ['I am good. Thanks for asking!', 'I am functioning within normal parameters', 'I am Combat Ready:tm:!'];
			return msg.channel.sendMessage(replies[parseInt(Math.random() * replies.length)]);
		}
	},
/*	{
		check: (msg) => {
			return msg.cleanContent.match(/(\s|^)\/r\/\w+\s/);
		},
		action: (msg) => {
			var subreddit = msg.cleanContent.match(/\/r\/\w+/);
			return msg.channel.sendMessage('https://www.reddit.com' + subreddit[0]);
		}
	},*/
	{
		check: (msg) => {
			return msg.content.toLowerCase().includes('lewd') && msg.isMentioned(msg.client.user);
		},
		action: (msg) => {
			return msg.channel.sendFile('https://i.imgur.com/rlraAOV.png', 'lewd.png', 'Stop it, that\'s lewd!');
		}
	},
	{
		check: (msg) => {
			return /are you ready/gi.test(msg.cleanContent) && msg.isMentioned(msg.client.user);
		},
		action: (msg) => {
			return msg.channel.sendMessage('I\'m more than ready! I\'m Combat Ready!:tm:!:crossed_swords:');
		}
	},
	{
		check: (msg) => {
			return /what do you know about blake/gi.test(msg.cleanContent) && msg.isMentioned(msg.client.user);
		},
		action: (msg) => {
			var replies = ['You mean the Faunus girl? :cat:', 'I heard she\'s quite fond of tuna... :fish:'];
			return msg.channel.send(replies[parseInt(Math.random() * replies.length)]);
		}
	},
	{
		check: (msg) => {
			return /are you a real (girl|person)/gi.test(msg.cleanContent) && msg.isMentioned(msg.client.user);
		},
		action: (msg) => {
			return msg.channel.send('Of course I am. Why would you ask that? *hic*');
		}
	},
	{
		check: (msg) => {
			return msg.content.toLowerCase().includes('pun') && msg.isMentioned(msg.client.user);
		},
		action: (msg) => {
			return msg.channel.send({file: 'https://i.imgur.com/ZfHfdk6.png'});
		}
	},
	{
		check: (msg) => {
			return msg.cleanContent.includes('🚜') && msg.author.id !== msg.client.user.id;
		},
		action: (msg) => {
			return msg.react('💥');
		}
	},
	{
		check: (msg) => {
			return msg.cleanContent.includes('(╯°□°）╯︵ ┻━┻');
		},
		action: (msg) => {
			return msg.channel.send(`Hey <@${msg.author.id}>, We try to keep this place tidy, thanks\n┬─┬ ノ( ゜-゜ノ)`);
		}
	}
];	
 
