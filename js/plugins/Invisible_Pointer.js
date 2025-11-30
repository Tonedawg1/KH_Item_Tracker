//=============================================================================
// DestinationSprite.js
// Version: 1.0.0
//=============================================================================
var Imported = Imported || {};
Imported.Krimer_DestinationSprite = true;

//=============================================================================
/*:
* @plugindesc v1.0.0 - With this plugin you can change the destination place sprite of the mouse\touch input.
* <DestinationSprite>
* @author Krimer
* @target MZ
*
* @param Sprite Figure
* @desc Sprite type. It can be - Square, Circle, or Off = hide sprite. For custom image set value to - Custom. Def:Square
* @type select
* @option Square
* @option Circle
* @option Off
* @option Custom
* @default Square
*
* @param Custom Image
* @desc Active only if "Sprite Figure" set to "Custom". Write a name of your custom image in folder '/img/system'
* @default image
*
* @param Animation mode
* @desc Setup animation mode. Can be: Blink => standard RMMV animation; Fade => fade sprite once per click. Def:blink
* @type select
* @option Blink
* @option Fade
* @default Blink
*
* @param Fade speed
* @desc Sprite opacity decrease per frame. Active only if "Animation mode" set to "fade". Def:12
* @default 12
*
* @param Sprite Size
* @desc Sprite Size in pixels. Ignore if "Sprite Figure" set to "Custom". Default: 48
* @default 48
*
* @param Sprite Color
* @desc Sprite Color. Link where you can choose color is in "Help". Ignore if "Sprite Figure" set to "Custom". Default: #ffffff
* @default #ffffff
*
* @param Sprite Opacity
* @desc Set the sprite opacity. Write a number in range 0..255. Default: 120
* @default 120
*
* @param Sprite Blend
* @desc Set the blend mode for the destination sprite. 0=NORMAL, 1=ADD. Default: 1
* @type select
* @option 0
* @option 1
* @default 1
*
* @help Color picker can be found here or you can use any graphic editor with hex color codes:
* http://www.w3schools.com/tags/ref_colorpicker.asp
* Recommended size for Custom Images is 48x48 or not higher than your tiles size
*/
//=============================================================================

(function() {
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    var parameters = $plugins.filter(function(p) {
        return p.description.contains('<DestinationSprite>');
    })[0].parameters;
    var dSpriteFigure = capitalizeFirstLetter(String(parameters['Sprite Figure'] || 'Square'));
    var dAnimationMode = capitalizeFirstLetter(String(parameters['Animation mode'] || 'Blink'));
    var dFadeSpeed = String(parameters['Fade speed'] || '12');
    var dSpriteColor = String(parameters['Sprite Color'] || '#ffffff');
    var dSpriteSize = Number(parameters['Sprite Size']);
    var dCustomImage = String(parameters['Custom Image']);
    var dSpriteOpacity = Number(parameters['Sprite Opacity']);
    var dSpriteBlend = Number(parameters['Sprite Blend']);

    Sprite_Destination.prototype.createBitmap = function() {
        const tileWidth = dSpriteSize || $gameMap.tileWidth();
        const tileHeight = dSpriteSize || $gameMap.tileHeight();
        this.bitmap = new Bitmap(tileWidth, tileHeight);
        if (dSpriteFigure == 'Square') {
            this.bitmap.fillAll(dSpriteColor);
        } else if (dSpriteFigure == 'Circle') {
            this.bitmap.drawCircle(this.bitmap.width / 2, this.bitmap.height / 2, dSpriteSize / 2, dSpriteColor);
        } else if (dSpriteFigure == 'Off') {} else if (dSpriteFigure == 'Custom') {
            this.bitmap = ImageManager.loadSystem(dCustomImage)
        }
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.blendMode = dSpriteBlend;
    };
  

    Sprite_Destination.prototype.updateAnimation = function() {
        this._frameCount++;
        this._frameCount %= 20;
        if (dAnimationMode == "Blink") {
            this.opacity = dSpriteOpacity === 255 ? 255 : Math.floor(dSpriteOpacity / 6 - this._frameCount) * 6;
            this.scale.x = 1 + this._frameCount / 20;
            this.scale.y = this.scale.x;
        } else if (dAnimationMode == "Fade" && $gameTemp.getDestinationOpacity() > 0) {
            this.opacity = $gameTemp.getDestinationOpacity() - dFadeSpeed;
            $gameTemp.setDestinationOpacity(this.opacity);
        }
    }; 

    var Game_Temp_initialize_dAlias = Game_Temp.prototype.initialize;
    Game_Temp.prototype.initialize = function() {
        Game_Temp_initialize_dAlias.call(this);
        this._destinationOpacity = null;
    };

    Game_Temp.prototype.setDestinationOpacity = function(value) {
        this._destinationOpacity = value;
    };

    Game_Temp.prototype.getDestinationOpacity = function() {
        return this._destinationOpacity;
    };

    var Game_Temp_setDestination_dAlias = Game_Temp.prototype.setDestination;
    Game_Temp.prototype.setDestination = function(x, y) {
        if (dAnimationMode == "Fade" && (this._destinationX !== x || this._destinationY != y)) {
            this._destinationOpacity = 255;
        }
        Game_Temp_setDestination_dAlias.call(this, x, y);

    };
})();