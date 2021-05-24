import pickfrom from "./commands/pickfrom";
import quote from "./commands/quote";
import DeixBotCommand from "./DeixBotCommand";

let commands = new Map<string, DeixBotCommand>()
commands.set("pickfrom", pickfrom);
commands.set("quote", quote);
export default commands;