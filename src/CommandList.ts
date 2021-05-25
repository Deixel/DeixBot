import pickfrom from "./commands/pickfrom";
import quote from "./commands/quote";
import pickgame from "./commands/pickgame";
import DeixBotCommand from "./DeixBotCommand";

let commands = new Map<string, DeixBotCommand>()
commands.set("pickfrom", pickfrom);
commands.set("quote", quote);
commands.set("pickgame", pickgame);
export default commands;