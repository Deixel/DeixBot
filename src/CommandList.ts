import DeixBotCommand from "./DeixBotCommand";
import pickfrom from "./commands/pickfrom";
import quote from "./commands/quote";
import pickgame from "./commands/pickgame";
import remind from "./commands/remind";
import sb from "./commands/soundboard";


let commands = new Map<string, DeixBotCommand>()
commands.set("pickfrom", pickfrom);
commands.set("quote", quote);
commands.set("pickgame", pickgame);
commands.set("remind", remind);
commands.set("soundboard", sb);
export default commands;