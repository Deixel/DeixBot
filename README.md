# DeixBot
## Config File
A `config.js` file should be created in the root of the project and should export an object containing the following properties
### Required Properties
- owner_id
- api_key

### Optional Properties
- prevent_global_commands
- commands_allowlist
- minecraft
  - chat_channel
  - chat_in_pipe
  - chat_out_pipe
  - guild_id
  - guild_rules_channel

See the `Config` interface in `src/interfaces.ts` for a description of each property

## Installation and Execution
The bot is almost entirely written in TypeScript, so will need transpiling before it can be run.
1. Use `npm install` to install all dependancies
2. Run `tsc` to transpile the contents of `src/` to `out/`
3. Create `config.js` as described above
4. cd into `out/`, then run `node deixbot.js`. You must change directories first as relative path names assume this will be the CWD.

## Commands
### Adding a new command
To create a new command, first create a new file under `src/commands`. This file should have a class that extends the abstract `DeixBotCommand` class (`src/DeixBotCommand.ts`). The file will also need to have a default export of a new instance of the created class.

Once the file has been completed, add the new command to the `commands` map in `src/CommandList.ts`
### Command List
- pickfrom
  - Randomly pick an option from a user-provided list
- pickgame
  - Randomly pick an option from the stored list of games
- quote
  - Quote a message previously sent in this guild
- remind
  - Create a reminder for someone in the near future
- soundboard
  - Play a sound in your current voice channel

## Responses
Responses are similar to commands, but they respond to regular chat messages rather than slash commands. Some of these are basic chat responses (hello, how are you etc), but some are utility commands, for example, ping. The reason these are responses rather than commands is so that these utilities don't appear in the slash command tab-completion list. If Discord ever allows hidden or restricted slash commands, these may be migrated over.

Responses are declared in `src/resources/responses.ts`. To add a new response, add a new instance of the `Response` class to the exported `responses` array in that file. The `Response` class takes two functions in it's constructor, a `Check` and an `Action`. The Check function should return a boolean and defines the conditions under which this response should be run (i.e if the check returns true, the Action for this Response will be run). The Action function defines what should actually happen in response to the message. Both functions are passed the relevant `Discord.Message` object for context.

Note that responses are never run in response to a message sent by the bot itself.

## Interfaces
`src/interfaces.ts` contains most of the interfaces and enums for use throughout the bot. These are generally divided into two groups. The first group covers internal objects (Reminders, Sounds, Config etc), while the second group represents the columns in the database, for use when parsing query results.

## Database Migrations
Certain values are persisted to a sqlite database. Any schema changes to this database should be done via migration files stored in `src/migrations`. Each of these should define the statements needed to perform the change, as well as how to revert the change.

