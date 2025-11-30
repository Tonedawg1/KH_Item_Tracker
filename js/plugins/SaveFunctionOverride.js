/*:
 * @author Deviztated
 * @target MZ, haven't tested in anything older.
 * @plugindesc Adds a "Save Manager" section with Save, Load, and Delete tabs to the main menu.
 * @help This plugin allows players to manage their save files with Save, Load, and Delete options.
 * @terms Feel free to modify this plugin as needed, free use. Any questions? Contact me.
 * @version 1.0.1 5/17/24
 */

(() => {
    // Extend the command window for the main menu
    Window_TitleCommand.prototype.makeCommandList = function() {
        this.addCommand(TextManager.newGame, 'newGame');
        this.addCommand('Save Manager', 'saveManager', this.isContinueEnabled());
        this.addCommand(TextManager.options, 'options');
    };

    // Extend the Scene_Title to handle the new save manager command
    Scene_Title.prototype.createCommandWindow = function() {
        const rect = this.commandWindowRect();
        this._commandWindow = new Window_TitleCommand(rect);
        this._commandWindow.setHandler('newGame', this.commandNewGame.bind(this));
        this._commandWindow.setHandler('saveManager', this.commandSaveManager.bind(this));
        this._commandWindow.setHandler('options', this.commandOptions.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._commandWindow);
    };

    Scene_Title.prototype.commandSaveManager = function() {
        SceneManager.push(Scene_ManageSave);
    };

    // Create a new scene for managing saves
    function Scene_ManageSave() {
        this.initialize(...arguments);
    }

    Scene_ManageSave.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_ManageSave.prototype.constructor = Scene_ManageSave;

    Scene_ManageSave.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_ManageSave.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createCommandWindow();
    };

    Scene_ManageSave.prototype.createCommandWindow = function() {
        const rect = this.commandWindowRect();
        this._commandWindow = new Window_ManageSaveCommand(rect);
        this._commandWindow.setHandler('save', this.commandSave.bind(this));
        this._commandWindow.setHandler('load', this.commandLoad.bind(this));
        this._commandWindow.setHandler('delete', this.commandDelete.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._commandWindow);
    };

    Scene_ManageSave.prototype.commandWindowRect = function() {
        const ww = 240;
        const wh = this.calcWindowHeight(4, true);
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = (Graphics.boxHeight - wh) / 2;
        return new Rectangle(wx, wy, ww, wh);
    };

    Scene_ManageSave.prototype.commandSave = function() {
        SceneManager.push(Scene_Save);
    };

    Scene_ManageSave.prototype.commandLoad = function() {
        SceneManager.push(Scene_Load);
    };

    Scene_ManageSave.prototype.commandDelete = function() {
        SceneManager.push(Scene_Delete);
    };

    // Create a command window for managing saves
    function Window_ManageSaveCommand() {
        this.initialize(...arguments);
    }

    Window_ManageSaveCommand.prototype = Object.create(Window_Command.prototype);
    Window_ManageSaveCommand.prototype.constructor = Window_ManageSaveCommand;

    Window_ManageSaveCommand.prototype.initialize = function(rect) {
        Window_Command.prototype.initialize.call(this, rect);
    };

    Window_ManageSaveCommand.prototype.makeCommandList = function() {
        this.addCommand('Save', 'save');
        this.addCommand('Load', 'load');
        this.addCommand('Delete', 'delete');
    };

    Window_ManageSaveCommand.prototype.windowWidth = function() {
        return 240;
    };

    Window_ManageSaveCommand.prototype.numVisibleRows = function() {
        return 4;
    };

    // Create a new scene for deleting saves
    function Scene_Delete() {
        this.initialize(...arguments);
    }

    Scene_Delete.prototype = Object.create(Scene_File.prototype);
    Scene_Delete.prototype.constructor = Scene_Delete;

    Scene_Delete.prototype.initialize = function() {
        Scene_File.prototype.initialize.call(this);
    };

    Scene_Delete.prototype.create = function() {
        Scene_File.prototype.create.call(this);
        this._helpWindow.setText('Select a file to delete.');
    };

    Scene_Delete.prototype.start = function() {
        Scene_File.prototype.start.call(this);
    };

    Scene_Delete.prototype.onSavefileOk = function() {
        const savefileId = this.savefileId();
        if (this.isSavefileEnabled(savefileId)) {
            const confirmed = window.confirm(`Are you sure you want to delete save file ${savefileId}?`);
            if (confirmed) {
                this.executeDelete(savefileId);
                DataManager.deleteSavefileInfo(savefileId); // Clear saved file information
                this._listWindow.refresh();
                this._helpWindow.setText('Save file deleted.');
            }
        }
        this.activateListWindow();
    };

    Scene_Delete.prototype.onSavefileCancel = function() {
        SceneManager.pop();
    };

    Scene_Delete.prototype.createListWindow = function() {
        Scene_File.prototype.createListWindow.call(this);
        this._listWindow.setHandler('ok', this.onSavefileOk.bind(this));
        this._listWindow.setHandler('cancel', this.onSavefileCancel.bind(this));
    };

    Scene_Delete.prototype.executeDelete = function(savefileId) {
        if (StorageManager.isLocalMode()) {
            const fs = require('fs');
            const path = require('path');
            const base = path.dirname(process.mainModule.filename);
            const savePath = path.join(base, 'save', `file${savefileId}.rmmzsave`);
            if (fs.existsSync(savePath)) {
                fs.unlinkSync(savePath);
            }
        } else {
            const saveKey = StorageManager.webStorageKey(savefileId);
            localStorage.removeItem(saveKey);
        }
    };
	window.Scene_Delete = Scene_Delete;
    // Add method to DataManager to clear saved file information
    DataManager.deleteSavefileInfo = function(savefileId) {
        if (StorageManager.isLocalMode()) {
            const fs = require('fs');
            const path = require('path');
            const base = path.dirname(process.mainModule.filename);
            const savePath = path.join(base, 'save', `file${savefileId}.rmmzsave`);
            if (fs.existsSync(savePath)) {
                fs.unlinkSync(savePath);
            }
        } else {
            const saveKey = StorageManager.webStorageKey(savefileId);
            localStorage.removeItem(saveKey);
        }
        this._globalInfo[savefileId] = null;
        this.saveGlobalInfo();
    };

    // Override DataManager loadSavefileInfo to handle refreshing the savefile display
    const _DataManager_loadSavefileInfo = DataManager.loadSavefileInfo;
    DataManager.loadSavefileInfo = function(savefileId) {
        const info = _DataManager_loadSavefileInfo.call(this, savefileId);
        return info ? info : null;
    };

    // Extend Scene_Load to stop all audio when a file is loaded
    const _Scene_Load_onSavefileOk = Scene_Load.prototype.onSavefileOk;
    Scene_Load.prototype.onSavefileOk = function() {
        AudioManager.stopAll();
        _Scene_Load_onSavefileOk.call(this);
    };

    // Override Scene_Map to ensure BGM is stopped after loading a game
    const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        AudioManager.stopAll();
        _Scene_Map_onMapLoaded.call(this);
    };

    // Extend the in-game menu command window to add "Save Manager" and remove "Save"
    const _Window_MenuCommand_addMainCommands = Window_MenuCommand.prototype.addMainCommands;
    Window_MenuCommand.prototype.addMainCommands = function() {
        _Window_MenuCommand_addMainCommands.call(this);
        this.addCommand('Save Manager', 'saveManager', true);
    };

    // Remove the default "Save" command from the in-game menu
    const _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function() {
        _Window_MenuCommand_addOriginalCommands.call(this);
        this._list = this._list.filter(command => command.name !== TextManager.save);
    };

    // Extend the in-game menu scene to handle "Save Manager" command
    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler('saveManager', this.commandSaveManager.bind(this));
    };

    Scene_Menu.prototype.commandSaveManager = function() {
        SceneManager.push(Scene_ManageSave);
    };
})();
