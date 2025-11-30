/*:
 * @target MZ
 * @plugindesc Centers or offsets the Show Choices window position
 * @author Tonedawg
 * 
 * @param Offset X
 * @type number
 * @default 0
 * @desc Horizontal offset from center (positive = right)
 * 
 * @param Offset Y
 * @type number
 * @default 0
 * @desc Vertical offset from center (positive = down)
 */

(() => {
    const params = PluginManager.parameters('CenteredChoices');
    const offsetX = Number(params['Offset X'] || 0);
    const offsetY = Number(params['Offset Y'] || 0);

    Window_ChoiceList.prototype.windowX = function() {
        return Graphics.boxWidth / 2 - this.windowWidth() / 2 + offsetX;
    };

    Window_ChoiceList.prototype.windowY = function() {
        return Graphics.boxHeight / 2 - this.windowHeight() / 2 + offsetY;
    };
})();
