//=============================================================================
// RPG Maker MZ - Alternative Save Screen (Details Box Removed + Right-Click Hint)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Alternative save/load screen – file list only + right-click hint.
 * @author Yoji Ojima (modified)
 *
 * @help AltSaveScreen.js
 *
 * File list fills the screen; bottom details box is removed.
 * A centered label at the bottom reads “Right Click To Cancel”.
 *
 * No plugin commands.
 */

(() => {
    // -------------------------------------------------------------------------
    // Scene_File – list window + hint label
    // -------------------------------------------------------------------------
    const _Scene_File_create = Scene_File.prototype.create;
    Scene_File.prototype.create = function () {
        _Scene_File_create.apply(this, arguments);

        // Keep the 3-line list height
        this._listWindow.height = this._listWindow.fittingHeight(3);

        // ---- Create the hint label (extra tall to prevent clipping) ----
        const lineH = this._listWindow.lineHeight();
        const padding = 24;           // top & bottom padding
        const extraBuffer = 16;       // extra space for descenders
        const hintHeight = lineH + padding * 2 + extraBuffer;
        const hintY = this._listWindow.y + this._listWindow.height + 8;

        const hintRect = new Rectangle(0, hintY, Graphics.boxWidth, hintHeight);
        this._rightClickHint = new Window_Base(hintRect);
        this._rightClickHint.contents.clear();

        // --- Draw text: centered, full height, no clipping ---
        const text = "Right Click To Cancel";
        const textWidth = this._rightClickHint.textWidth(text);
        const textX = (Graphics.boxWidth - textWidth) / 2;
        const textY = padding;  // start after top padding

        // Draw with full line height → descenders are safe
        this._rightClickHint.drawText(text, textX, textY, textWidth, lineH);

        this.addWindow(this._rightClickHint);
    };

    const _Scene_File_start = Scene_File.prototype.start;
    Scene_File.prototype.start = function () {
        _Scene_File_start.apply(this, arguments);
        this._listWindow.ensureCursorVisible();
    };

    // -------------------------------------------------------------------------
    // Window_SavefileList – full-width, 4 columns, taller items
    // -------------------------------------------------------------------------
    Window_SavefileList.prototype.windowWidth = function () {
        return Graphics.boxWidth;
    };

    Window_SavefileList.prototype.maxCols = function () {
        return 4;
    };

    Window_SavefileList.prototype.itemHeight = function () {
        return this.lineHeight() * 2 + 16;
    };

    const _Window_SavefileList_callUpdateHelp =
        Window_SavefileList.prototype.callUpdateHelp;
    Window_SavefileList.prototype.callUpdateHelp = function () {
        _Window_SavefileList_callUpdateHelp.apply(this, arguments);
    };
})();