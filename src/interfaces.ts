import Discord from "discord.js";
import { Database } from "sqlite";
import RemindManager from "./RemindManager";

export class DeixBot extends Discord.Client {
	db?: Database;
	reminderManager?: RemindManager;
	registeredCommands: Discord.ApplicationCommand[] = [];

	constructor(options: Discord.ClientOptions) {
		super(options);
	}

	createRemindManager()
	{
		this.reminderManager = new RemindManager( this );
	}

};

export interface Reminder
{
	id?: number;
	person: string;
	message: string;
	timeout: number;
	channel: Discord.TextChannel;
}

export enum ReminderOptions
{
    person = 0,
    time = 1,
    units = 2,
    message = 3
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
    timestamp: number
}

export interface playingRow
{
	playingID: number,
	playingString:  string
}

export interface pickgameRow
{
	gameId: number,
	gameName: string
}
