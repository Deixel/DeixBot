import Discord from "discord.js";

export interface Reminder
{
	id: number;
	person: string;
	message: string;
	timeout: number;
	channel: Discord.TextChannel;
}

export interface Config 
{
    ownerid: string,
    apikey: string,
    guildid?: string
}

// ========== DATABASE TABLE ROWS ==========


export interface reminderRow
{
    reminderId: number,
    channelId: string,
    remindee: string,
    message: string,
    timestamp: string
}

export interface playingRow
{
	playingID: number,
	playingString:  string
}
