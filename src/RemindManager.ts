import { Database } from "sqlite";
import { Reminder, reminderRow } from "./interfaces";
import SQL from "sql-template-strings";
import log from "./logger";
import Discord from "discord.js";
import { DeixBot } from "./interfaces";
import { CLIENT_RENEG_WINDOW } from "tls";
import { setInterval } from "timers";


export default class RemindManager {
    client: DeixBot;
    reminders: Map<number, Reminder>;
    reminderTimer: NodeJS.Timeout | undefined;

    constructor(client: DeixBot) {
        this.client = client;
        this.reminders = new Map<number, Reminder>();
        this.load();
    }

    add(reminder: Reminder) 
    {
        this.client.db?.run(SQL`INSERT INTO reminders (channelId, remindee, message, timestamp) VALUES ( ${reminder.channel.id}, ${reminder.person}, ${reminder.message}, ${reminder.timeout})`).then( (result) => {
            reminder.id = result.lastID;
            this.reminders.set(reminder.id as number, reminder);
            if(this.reminderTimer === undefined) {
                this.startTimer();
            }
        }).catch( err => log.error );
    }

    delete(reminder: Reminder)
    {
        this.deleteFromDatabase(reminder.id as number);
        this.reminders.delete(reminder.id as number);
    }

    deleteFromDatabase(reminderId: number) 
    {
        this.client.db?.run(SQL`DELETE FROM reminders WHERE reminderId = ${reminderId}`).then( result => {
            if(result.changes == 0) {
                log.error("Failed to delete reminder " + reminderId);
            }
        }).catch ( err => log.error );
    }

    async load()
    {
        this.client.db?.all("SELECT * FROM reminders").then( (rows: reminderRow[]) => {
            if(rows.length > 0) {
                rows.forEach(async (row) => {
                    log.debug(`Loading reminder ${row.reminderId} | ${row.remindee} | ${row.message} | ${row.timestamp} | ${row.channelId}`);
                        if( row.timestamp < Date.now()) {
                            log.debug("Deleting stale reminder " + row.reminderId);
                            this.deleteFromDatabase(row.reminderId);
                        }
                        else {
                                let channel = await this.client.channels.fetch(row.channelId)
                                if(channel) {
                                    let reminder: Reminder = {
                                        id: row.reminderId,
                                        person: row.remindee,
                                        channel: channel as Discord.TextChannel,
                                        message: row.message,
                                        timeout: row.timestamp,
                                    };
                                    this.reminders.set(row.reminderId, reminder);
                                    this.startTimer();
                                }
                                else {
                                    log.error("Something went wrong finding channel " + row.channelId);
                                }

                                
                                
                        }

                });
            }
        }).catch( err => log.error );
    }

    startTimer()
    {
        if(this.reminderTimer === undefined) {
            this.reminderTimer = setInterval(this.check, 1000, this);
        }
    }

    stopTimer()
    {
        if(this.reminderTimer) {
            clearInterval(this.reminderTimer);
            this.reminderTimer = undefined;
        }
    }

    //Calling check via setInterval changes `this` context, so instead pass it in as a parameter
    check(self: RemindManager)
    {
        self.reminders.forEach( (reminder) => {
			if(Date.now() >= reminder.timeout) {
				reminder.channel.send(`Hey ${reminder.person}, ${reminder.message}`);
				self.delete(reminder);
			}
			if(self.reminders.size == 0) {
                self.stopTimer();
            }
		});
    }
}