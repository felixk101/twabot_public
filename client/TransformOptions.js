
class TransformOptions{
    constructor(width, height, scaleX=1, scaleY=1, translateX=0, translateY=0){
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.translateX = translateX;
        this.translateY = translateY;
        this.width = width;
        this.height = height;
    }

    setScale(x, y){
        this.scaleX = x;
        this.scaleY = y;
    }

    /**
    * Translation is relative to the width and heigth.
    * Example: Width is 300, x is 2/3 => the drawing starts at 200
    * @param x
    * @param y
    */
    setTranslation(x, y){
        this.translateX = x;
        this.translateY = y;
    }

    apply(ctx){
        ctx.scale(this.scaleX, this.scaleY);
        ctx.translate(this.translateX * this.width / this.scaleX,
            this.translateY * this.height / this.scaleY);
    }
}

module.exports = TransformOptions;