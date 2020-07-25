import * as MySettings from "./mysettings.js";
var Canvas = {
    gui, main, bkgd// terrain, propBkgd, entity, propFrgd
}
var Context = {
    gui, main, bkgd//, propBkgd, entity, propFrgd
}
function getWoCtx(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return ctx;
}

Canvas.gui = document.getElementById('gui');
Canvas.gui.width = MySettings.V_WIDTH;
Canvas.gui.height = MySettings.V_HEIGHT;
Context.gui = getWoCtx(Canvas.gui);

Canvas.main = document.getElementById('main');
Canvas.main.width = MySettings.V_WIDTH;
Canvas.main.height = MySettings.V_HEIGHT;
Context.main = getWoCtx(Canvas.main);
Canvas.main.hidden = false;
Context.main.font = '48px serif';

Canvas.bkgd = document.getElementById('bkgd');
Canvas.bkgd.width = MySettings.V_WIDTH;
Canvas.bkgd.height = MySettings.V_HEIGHT;
Context.bkgd = getWoCtx(Canvas.bkgd);

export {Canvas, Context};