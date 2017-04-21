module.exports = [ 
	{
		check: (msg) => {
			return msg.cleanContent.toLowerCase().includes('hello') && msg.isMentioned(msg.client.user);
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
	{
		check: (msg) => {
			return msg.cleanContent.match(/\/r\/\w+/);
		},
		action: (msg) => {
			var subreddit = msg.cleanContent.match(/\/r\/\w+/);
			return msg.channel.sendMessage('https://www.reddit.com' + subreddit[0]);
		}
	},
	{
		check: (msg) => {
			return msg.content.toLowerCase().includes('lewd') && msg.isMentioned(msg.client.user);
		},
		action: (msg) => {
			return msg.channel.sendFile('https://i.imgur.com/rlraAOV.png', 'lewd.png', 'Stop it, that\'s lewd!');
		}
	}
];
 
