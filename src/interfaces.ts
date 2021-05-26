import Discord from "discord.js";
import { Database } from "sqlite";
import RemindManager from "./RemindManager";
import { Response } from "./resources/responses"

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
    owner_id: string,
    api_key: string,
    test_guild_id?: string,
	minecraft_chat_channel: string,
	minecraft_chat_in_pipe: string,
	minecraft_chat_out_pipe: string,
	minecraft_guild_id: string,
	minecraft_guild_rules_channel: string,
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
