import Discord from "discord.js";
import { Database } from "sqlite";
import RemindManager from "./RemindManager";
import { Response } from "./resources/responses"

export class DeixBot extends Discord.Client {
	db?: Database;
	reminderManager?: RemindManager;
	registeredCommands: Discord.Collection<string, Discord.ApplicationCommand[]> = new Discord.Collection<string, Discord.ApplicationCommand[]>();

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

export interface Sound
{
	id: number,
	alias: string,
	description: string
	path: string
}

export interface Config 
{
	/** The ID of the user that owns the bot */
    owner_id: string,
	/** The Discord API token to use when logging in */
    api_key: string,
	/** Object containing configuration for interacting with DeixUtils */
	minecraft?: MinecraftConfig,
	/** If this is set to true, all commands will be forced to be guild-only */
	prevent_global_commands?: boolean,
	/** An array of command names to register. All others will be ignored */
	commands_allowlist?: string[]
}

interface MinecraftConfig 
{
	/** ID of the channel to mirror to the Minecraft Server */
	chat_channel: string,
	/** Path to the FIFO pipe for incoming Minecraft messages */
	chat_in_pipe: string,
	/** Path to the FIFO pipe for outgoing Minecraft messages */
	chat_out_pipe: string,
	/** The ID of the guild monitor for new joiners, to send them a welcome message */
	guild_id: string,
	/** The ID of the channel on the Minecraft guild to point new joiners at */
	guild_rules_channel: string,
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
	playingString:  string,
	activityType: Discord.ActivityType,
}

export interface pickgameRow
{
	gameId: number,
	gameName: string
}

export interface soundboardRow
{
	soundID: number,
	alias: string,
	description: string,
	path: string
}