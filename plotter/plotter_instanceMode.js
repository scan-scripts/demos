function mysqr(x) {
    return x ** 2;
}

function linSpace(start, stop, num) {
    let a = [];
    let step = (stop - start) / num;
    for (let i = 0; i < num; i++) {
        a.push(start + i * step);
    }
    return a

}



/* 
TODO
store the ponts and functions to plot we only need to redraw them when when plot changes
all the not yet implemented methods
figure out user input 

*/

class CanvasSlider {
    /**
     * 
     * @param {p5} p  - An instance of the p5 library.
     * @param {number} minValue 
     * @param {number} maxValue 
     * @param {number} initalValue 
     * @param {number} step 
     */
    constructor(p, minValue, maxValue, initalValue = (minValue + maxValue) / 2, step = 0) {
        this.p = p
        this.width = 100;
        this.height = 10;
        this.x = 0;
        this.y = 0;
        this.maxValue = maxValue;
        this.minValue = minValue;
        this.value = p.constrain(initalValue, this.minValue, this.maxValue);
        this.xHandle = this.x + this.value * this.width / (this.maxValue - this.maxValue)
        this.yHandle = this.y + 0.5 * this.height
        this.step = step;
        this.isOver = false;
        this.isPressed = false;
        this.isActive = false
        this.pressedBeforeOver = false
        this.showValueTip = true;
        this.valueTipHeight = 10;
    }

    checkOver() {
        return (this.p.mouseX > this.x) && (this.p.mouseX < this.x + this.width) && (this.p.mouseY > this.y) && (this.p.mouseY < this.y + this.height);
    }
    setHeight(height) {
        this.height = height;
        this.updateHandlePostion()

    }
    setPostion(x, y) {
        this.x = x;
        this.y = y;
        this.updateHandlePostion()
    }
    setValue(value) {
        this.value = this.p.constrain(value, this.minValue, this.maxValue)
        this.updateHandlePostion()
    }
    getValue() {
        return this.value;
    }

    updateHandlePostion() {
        this.xHandle = this.x + this.value * this.width / (this.maxValue - this.minValue);
        this.yHandle = this.y + 0.5 * this.height;
    }

    setWidth(width) {
        this.width = width;
    }


    update() {
        this.isOver = this.checkOver();
        if (this.p.mouseIsPressed && !this.isOver) {
            this.pressedBeforeOver = true;
        }
        if (this.p.mouseIsPressed && this.isOver && !this.pressedBeforeOver) {
            this.isActive = true;
            this.pressedBeforeOver = false;
        }
        if (!this.p.mouseIsPressed) {
            this.isActive = false;
            this.pressedBeforeOver = false;
        }
        if (this.isActive) {
            let mouseValue = (this.p.mouseX - this.x) * (this.maxValue - this.minValue) / this.width;
            this.value = this.p.constrain(mouseValue, this.minValue, this.maxValue);
            if (this.step > 0) {
                //this.value = constrain(this.minValue + round((this.value - this.minValue) / this.step) * this.step, this.minValue, this.maxValue);
            }
            this.updateHandlePostion();
            //follow the this.p.mouseX as long as it is within bounds
            //round the value with the step 
            //handle pos will follow the value (us update handle postion for that)
        }
    }
    display() {
        this.p.noStroke()
        this.p.fill(200);
        this.p.rect(this.x, this.y, this.width, this.height);
        if (this.isOver || this.isActive) {
            this.p.fill(0);
        } else {
            this.p.fill(100);
        }
        this.p.ellipse(this.xHandle, this.yHandle, this.height, this.height);
        if (this.isActive && this.showValueTip) {
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.text(this.value, this.xHandle, this.yHandle - this.valueTipHeight)
        }


    }

}



class Plotter {
    /**
     * 
     * @param {p5} p
     * @param {number} xMin 
     * @param {number} xMax 
     * @param {number} yMin 
     * @param {number} yMax 
     * @param {number} graphHeight 
     * @param {number} graphWidth 
     * @param {number} graphX 
     * @param {number} graphY 
     */
    constructor(p, xMin, xMax, yMin, yMax, graphHeight = p.height, graphWidth = p.width, graphX = 0, graphY = 0) {
        this.p = p
        this.xMin0 = xMin;
        this.xMax0 = xMax;
        this.yMin0 = yMin;
        this.yMax0 = yMax;

        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.background_color = p.color(255);
        this.axis_space = 0;
        this.canvasX = graphX
        this.canvasY = graphY;
        this.xTicks = [];
        this.yTicks = [];
        this.AxisColor = this.p.color(20);
        this.showArrows = false;
        this.graphWidth = graphWidth;
        this.graphHeight = graphHeight;
        this.graphArea = this.p.createGraphics(this.graphWidth, this.graphHeight);
        this.staticPoints = [];
        this.staticFunctions = [];
        this.interactiveFunctions = [];
        this.interactivePoints = [];
        this.tickSize = 10;
        this.gridColor = p.color(0, 0, 200, 60);
        this.isPanning = true;
        //this.mouseWasPressed = false;

    }
    graphAxislinSpace(num = this.graphWidth) {
        return linSpace(this.xMin, this.xMax, num);



    }
    /**
    * 
    * @param {number} start 
    * @param {number} stop 
    * @param {number} step 
    * @returns {number[]}
    */
    arange(start, stop, step) {
        let a = [];
        let num = this.p.floor((stop - start) / step)
        for (let i = 0; i < num; i++) {
            a.push(start + i * step);
        }
        return a

    }




    //TODO rename these so they make more sense
    /**
     * Converts an x value that you want to graph to the coordinate system of the graphArea
     * @param {number} x 
     * @returns {number}
     */
    _xToGraphSystem(x) {
        let xGraph = (this.graphWidth / (this.xMax - this.xMin)) * (x - this.xMin);
        return xGraph
    }
    /**
     * Converts an y value that you want to graph to the coordinate system of the graphArea
     * @param {number} y 
     * @returns {number}
     */
    _yToGraphSystem(y) {
        let yGraph = this.graphHeight - (this.graphHeight / (this.yMax - this.yMin)) * (y - this.yMin);
        //console.log(yGraph)
        return yGraph
    }


    _xToAxisSystem(x) {
        return ((this.xMax - this.xMin) / this.graphWidth) * x + this.xMin;
    }

    _yToAxisSystem(y) {
        return (this.graphHeight - y) * ((this.yMax - this.yMin) / this.graphHeight) + this.yMin;
    }
    autoTicks(tickStepX = 1, tickStepY = 1, centerX = 0, centerY = 0) {
        this.xTicks = this.arange(centerX, this.xMin, -tickStepX).concat(this.arange(centerX, this.xMax, tickStepX));
        this.yTicks = this.arange(centerY, this.yMin, -tickStepY).concat(this.arange(centerY, this.yMax, tickStepY));
    }

    /**
     * 
     * @param {number[]} ticks 
     */
    setXTicks(ticks) {
        this.xTicks = ticks

    }
    /**
     * 
    * @param {numbers[]} ticks 
    */
    setYTicks(ticks) {
        this.yTicks = ticks
    }
    drawAxisTicks() {
        this.graphArea.stroke(this.AxisColor);
        this.graphArea.strokeWeight(2);
        let vertTickBottom = this._yToGraphSystem(0) - this.tickSize / 2;
        let vertTickTop = this._yToGraphSystem(0) + this.tickSize / 2;
        this.xTicks.map(x => this._xToGraphSystem(x)).forEach(tickX => {
            this.graphArea.line(tickX, vertTickBottom, tickX, vertTickTop);

        });
        let horzTickLeft = this._xToGraphSystem(0) - this.tickSize / 2;
        let horzTickRight = this._xToGraphSystem(0) + this.tickSize / 2;
        this.yTicks.map(y => this._yToGraphSystem(y)).forEach(tickY => {
            this.graphArea.line(horzTickLeft, tickY, horzTickRight, tickY);
        });
    }
    drawAxisTickLabels(Xlabels = this.xTicks, Ylabels = this.yTicks) {
        this.graphArea.stroke(this.AxisColor);
        this.graphArea.strokeWeight(1);


        this.graphArea.textAlign(this.p.CENTER, this.p.TOP);
        let HorzAxisLabelTop = this._yToGraphSystem(0) + this.tickSize;
        for (let i = 0; i < Xlabels.length; i++) {
            this.graphArea.text(Xlabels[i], this._xToGraphSystem(this.xTicks[i]), HorzAxisLabelTop)

        }
        let VertAxisLabelLeft = this._xToGraphSystem(0) - this.tickSize;
        this.graphArea.textAlign(this.p.RIGHT, this.p.CENTER);
        for (let i = 0; i < Ylabels.length; i++) {
            this.graphArea.text(Ylabels[i], VertAxisLabelLeft, this._yToGraphSystem(this.yTicks[i]))

        }
    }
    drawInnerAxes() {
        this.graphArea.stroke(this.AxisColor);
        this.graphArea.strokeWeight(2);
        //x-axis
        //console.log(this._xToGraphSystem(this.xMin) ,this._yToGraphSystem(0), this._xToGraphSystem(this.xMax), this._yToGraphSystem(0))
        this.graphArea.line(this._xToGraphSystem(this.xMin), this._yToGraphSystem(0), this._xToGraphSystem(this.xMax), this._yToGraphSystem(0));
        //y-axis
        this.graphArea.line(this._xToGraphSystem(0), this._yToGraphSystem(this.yMin), this._xToGraphSystem(0), this._yToGraphSystem(this.yMax));
    }



    /**
     * Takes a function 
     * @param {function} func 
     */
    plotFunction(func) {
        let xs = this.graphAxislinSpace();
        let ys = xs.map(func);
        this.plotCurve(xs, ys);

    }
    plotPoint(x, y) {

        this.graphArea.strokeWeight(10);
        this.graphArea.stroke(0);
        // console.log(x,y);
        // console.log(this._xToGraphSystem(x), this._yToGraphSystem(y))
        this.graphArea.point(this._xToGraphSystem(x), this._yToGraphSystem(y));

    }


    plotPoints(xs, ys) {
        if (xs.length == ys.length) {
            for (let i = 0; i < xs.length; i++) {
                this.plotPoint(xs[i], ys[i]);
            }

        } else {
            console.log("arrays of xs and ys points need to be the same length")
        }
    }
    /**
     * plots a curve connecting the points from xs and ys arrays
     * @param {number[]} xs 
     * @param {number[]} ys 
     */
    plotCurve(xs, ys) {
        if (xs.length == ys.length) {
            this.graphArea.noFill();
            this.graphArea.strokeWeight(2);
            this.graphArea.stroke(0);
            this.graphArea.beginShape();
            for (let i = 0; i < xs.length; i++) {
                this.graphArea.curveVertex(this._xToGraphSystem(xs[i]), this._yToGraphSystem(ys[i]));
            }
            this.graphArea.endShape();

        } else {
            console.log("arrays of xs and ys points need to be the same length")
        }
    }



    addStaticPoint() {

    }
    addFunction(func, color) {
        let styledFunction = new Object();
        styledFunction.function = func

        this.funcs.push({ f: func, color: color })
    }


    drawGrid() {
        this.graphArea.stroke(this.gridColor);
        this.graphArea.strokeWeight(1);
        let vertGridLinekBottom = this._yToGraphSystem(this.yMin);
        let vertGridLineTop = this._yToGraphSystem(this.yMax);
        this.xTicks.map(x => this._xToGraphSystem(x)).forEach(tickX => {
            this.graphArea.line(tickX, vertGridLinekBottom, tickX, vertGridLineTop);

        });
        let horzGridLineLeft = this._xToGraphSystem(this.xMin);
        let horzGridLineRight = this._xToGraphSystem(this.xMax);
        this.yTicks.map(y => this._yToGraphSystem(y)).forEach(tickY => {
            this.graphArea.line(horzGridLineLeft, tickY, horzGridLineRight, tickY);
        });
    }
    checkOver() {
        return this.p.mouseX > (this.canvasX) && this.p.mouseX < (this.canvasX + this.graphWidth) && this.p.mouseY > (this.canvasY) && this.p.mouseY < (this.graphHeight);
    }


    pan(dx, dy) {
        this.xMin = this.xMin + dx;
        this.xMax = this.xMax + dx;
        this.yMin = this.yMin + dy;
        this.yMax = this.yMax + dy;

    }
    dragToPan() {
        if (this.p.mouseIsPressed && !this.isPanning && this.checkOver() == true) {
            console.log(this.p.mouseY);
            this.x0 = this.p.mouseX;
            this.y0 = this.p.mouseY;
            this.isPanning = true;
        }
        if (this.p.mouseIsPressed && this.checkOver() == true) {
            let dx = ((this.xMax - this.xMin) / this.graphWidth) * (this.x0 - this.p.mouseX);
            let dy = -((this.yMax - this.yMin) / this.graphHeight) * (this.y0 - this.p.mouseY);
            this.pan(dx, dy);
            this.x0 = this.p.mouseX;
            this.y0 = this.p.mouseY;

        } else {
            this.isPanning = false;
        }

    }
    scrollToZoom(delta) {
        this.zoom(1 - 0.1 * (delta / 100));
    }

    zoomX(zoom_factor) {


    }
    zoomX(zoom_factor) {

    }


    zoom(zoom_factor) {
        this.xMin *= 1 / zoom_factor;
        this.xMax *= 1 / zoom_factor;
        this.yMin *= 1 / zoom_factor;
        this.yMax *= 1 / zoom_factor;
    }
    resetAxes() {
        this.xMin = this.xMin0;
        this.xMax = this.xMax0;
        this.yMin = this.yMin0;
        this.yMax = this.yMax0;
    }

    display() {

        this.graphArea.background(this.background_color);
        this.drawInnerAxes()
        this.drawAxisTicks();
        this.drawGrid();
        this.drawAxisTickLabels();
        this.plotPoints([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6]);
        this.interactiveFunctions.forEach(f => { this.plotFunction(f); });
        this.p.image(this.graphArea, this.canvasX, this.canvasY);

    }
}




function sketch(p) {

    p.setup = () => {
        p.createCanvas(640, 640);

        plot = new Plotter(p, -10, 10, -10, 10, 400);
        plot.interactiveFunctions.push(x => pow(x, 1))
        plot.setXTicks(linSpace(-10, 11, 21));
        plot.setYTicks(linSpace(-10, 11, 21));


        slider = new CanvasSlider(p, 0, 20, 2, -1)
        slider.setPostion(100, 500);

    }
    p.draw = () => {
        p.background(255, 0, 100);
        slider.update();
        plot.autoTicks();
        var f = x => p.sin(x * slider.getValue())
        plot.interactiveFunctions[0] = f;
        plot.dragToPan();
        plot.display();
        slider.display();
    }

    p.keyTyped = () => {
        if (key == "z") {
            plot.zoom(1.1);
        }
        if (key == "x") {
            plot.zoom(0.9);
        }
        if (key == "r") {
            plot.resetAxes()
        }

    }
    p.mouseWheel = (event) => {
        plot.scrollToZoom(event.delta)
    }





}

new p5(sketch)