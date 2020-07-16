import * as Engine from "../../engine/engine.js";
import * as CM from "../canvas-manager.js";
import * as Settings from "../settings.js";
import * as ImageDef from "../imagedef.js";
//"implments" state "interface"

//lul
let i = 0;
function onEnter(from) {
    i = 0;
    console.log("entered mainstate from " + from);


    Engine.Entity.createEntity(30,30)
    .withRenderComponent(CM.Context.main, ImageDef.imageSections.LINKIN, Engine.Camera2D.createCamera2D());

    //window.setTimeout(function () { Engine.State.queueState(1); }, 1000);
}
function onExit(to) {
    console.log("exited mainstate, to " + to);
}
function update() {
    console.log("LMFAO");
    i++;
}
function render() {
    CM.Context.main.clearRect(0, 0, Settings.V_WIDTH, Settings.V_HEIGHT);
    //CM.Context.main.fillRect(50, 50 + i, 60, 60);
    Engine.Entity.drawRenderComponents();

    CM.Context.main.fillText('MAIN STATE', 10, 50);
}

export { onEnter, onExit, update, render };