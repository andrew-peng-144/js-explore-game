import * as UI from "./modules/gui/ui-main.js";

UI.init();
UI.mainDialogueBox.setMessage("You see those warriors from Hammerfell? @a They’ve got curved swords. Curved. Swords. @a My cousins out fighting dragons, and what do I get? Guard duty. @a I got to thinking... @a maybe i’m the Dragonborn and I just don’t know it yet!");

console.log(UI.mainDialogueBox._lines);