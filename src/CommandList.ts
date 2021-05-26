import DeixBotCommand from "./DeixBotCommand";
import pickfrom from "./commands/pickfrom";
import quote from "./commands/quote";
import pickgame from "./commands/pickgame";
import remind from "./commands/remind";


let commands = new Map<string, DeixBotCommand>()
commands.set("pickfrom", pickfrom);
commands.set("quote", quote);
commands.set("pickgame", pickgame);
commands.set("remind", remind);
export default commands;