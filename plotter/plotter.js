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

/**
 * 
 * @param {number} start 
 * @param {number} stop 
 * @param {number} step 
 * @returns {number[]}
 */
function arange(start, stop, step) {
    let a = [];
    num = floor((stop - start) / step)
    for (let i = 0; i <= num; i++) {
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
    constructor(minValue, maxValue, initalValue = (minValue + maxValue) / 2, step = 0) {
        this.width = 100;
        this.height = 10;
        this.x = 0;
        this.y = 0;
        this.maxValue = maxValue;
        this.minValue = minValue;
        this.value = constrain(initalValue, this.minValue, this.maxValue);
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
        return (mouseX > this.x) && (mouseX < this.x + this.width) && (mouseY > this.y) && (mouseY < this.y + this.height);
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
        this.value = constrain(value, this.minValue, this.maxValue)
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
        if (mouseIsPressed && !this.isOver) {
            this.pressedBeforeOver = true;
        }
        if (mouseIsPressed && this.isOver && !this.pressedBeforeOver) {
            this.isActive = true;
            this.pressedBeforeOver = false;
        }
        if (!mouseIsPressed) {
            this.isActive = false;
            this.pressedBeforeOver = false;
        }
        if (this.isActive) {
            let mouseValue = (mouseX - this.x) * (this.maxValue - this.minValue) / this.width;
            this.value = constrain(mouseValue, this.minValue, this.maxValue);
            if (this.step > 0) {
                this.value = constrain(this.minValue + round((this.value - this.minValue) / this.step) * this.step, this.minValue, this.maxValue);
            }
            this.updateHandlePostion();
            //follow the mouseX as long as it is within bounds
            //round the value with the step 
            //handle pos will follow the value (us update handle postion for that)
        }
    }
    display() {
        noStroke()
        fill(200);
        rect(this.x, this.y, this.width, this.height);
        if (this.isOver || this.isActive) {
            fill(0);
        } else {
            fill(100);
        }
        ellipse(this.xHandle, this.yHandle, this.height, this.height);
        if (this.isActive && this.showValueTip) {
            textAlign(CENTER, CENTER);
            text(this.value, this.xHandle, this.yHandle - this.valueTipHeight)
        }


    }

}



class Plotter {
    /**
     * 
     * @param {number} xMin 
     * @param {number} xMax 
     * @param {number} yMin 
     * @param {number} yMax 
     * @param {number} graphHeight 
     * @param {number} graphWidth 
     * @param {number} graphX 
     * @param {number} graphY 
     */
    constructor(xMin, xMax, yMin, yMax, graphHeight = height, graphWidth = width, graphX = 0, graphY = 0) {
        this.xMin0 = xMin;
        this.xMax0 = xMax;
        this.yMin0 = yMin;
        this.yMax0 = yMax;

        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.background_color = color(255);
        this.axis_space = 0;
        this.canvasX = graphX
        this.canvasY = graphY;
        this.xTicks = [];
        this.yTicks = [];
        this.AxisColor = color(20);
        this.showArrows = false;
        this.graphWidth = graphWidth;
        this.graphHeight = graphHeight;
        this.graphArea = createGraphics(this.graphWidth, this.graphHeight);
        this.staticPoints = [];
        this.staticFunctions = [];
        this.interactiveFunctions = [];
        this.interactivePoints = [];
        this.tickSize = 10;
        this.gridColor = color(0, 0, 200, 60);
        this.isPanning = true;
        //this.mouseWasPressed = false;

    }
    graphAxislinSpace(num = this.graphWidth) {
        return linSpace(this.xMin, this.xMax, num);



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
        this.xTicks = arange(centerX, this.xMin, -tickStepX).concat(arange(centerX, this.xMax, tickStepX));
        this.yTicks = arange(centerY, this.yMin, -tickStepY).concat(arange(centerY, this.yMax, tickStepY));
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


        this.graphArea.textAlign(CENTER, TOP);
        let HorzAxisLabelTop = this._yToGraphSystem(0) + this.tickSize;
        for (let i = 0; i < Xlabels.length; i++) {
            this.graphArea.text(Xlabels[i], this._xToGraphSystem(this.xTicks[i]), HorzAxisLabelTop)

        }
        let VertAxisLabelLeft = this._xToGraphSystem(0) - this.tickSize;
        this.graphArea.textAlign(RIGHT, CENTER);
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
        console.log(func)
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
        return mouseX > (this.canvasX) && mouseX < (this.canvasX + this.graphWidth) && mouseY > (this.canvasY) && mouseY < (this.graphHeight);
    }


    pan(dx, dy) {
        this.xMin = this.xMin + dx;
        this.xMax = this.xMax + dx;
        this.yMin = this.yMin + dy;
        this.yMax = this.yMax + dy;

    }
    dragToPan() {
        if (mouseIsPressed && !this.isPanning && this.checkOver() == true) {
            ;
            this.x0 = mouseX;
            this.y0 = mouseY;
            this.isPanning = true;
        }
        if (mouseIsPressed && this.checkOver() == true) {
            let dx = ((this.xMax - this.xMin) / this.graphWidth) * (this.x0 - mouseX);
            let dy = -((this.yMax - this.yMin) / this.graphHeight) * (this.y0 - mouseY);
            this.pan(dx, dy);
            this.x0 = mouseX;
            this.y0 = mouseY;

        } else {
            this.isPanning = false;
        }

    }
    scrollToZoom(delta) {
        let zoomSpeed = 0.01

        //this.zoom(delta*zoomFactor/100);
        this.zoomAroundPoint(1 + zoomSpeed * delta / 100, this._xToAxisSystem(mouseX), this._yToAxisSystem(mouseY));

    }

    zoomX(zoom_factor) {


    }
    zoomX(zoom_factor) {

    }


    zoom(zoomAmount) {
        let xRange = this.xMax - this.xMin;
        let yRange = this.yMax - this.yMin;
        this.xMin -= zoomAmount * xRange;
        this.xMax += zoomAmount * xRange;
        this.yMin -= zoomAmount * yRange;
        this.yMax += zoomAmount * yRange;
    }
    zoomAroundPoint(zoomFactor, x, y) {
        let xRange = this.xMax - this.xMin;
        let yRange = this.yMax - this.yMin;

        this.xMin = zoomFactor * this.xMin - (zoomFactor - 1) * x;
        this.xMax = zoomFactor * xRange + this.xMin;


        this.yMin = zoomFactor * this.yMin - (zoomFactor - 1) * y;
        this.yMax = zoomFactor * yRange + this.yMin;
    }

    OriginToGraphCenter() {
        let xRange = this.xMax - this.xMin;
        let yRange = this.yMax - this.yMin;
        this.xMin = -xRange / 2;
        this.xMax = xRange / 2;
        this.yMin = -yRange / 2;
        this.yMax = yRange / 2;

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
        image(this.graphArea, this.canvasX, this.canvasY);

    }
}

function squareWave(x) {
    let A = 1
    let P = 1
    let D = 0.5
    if (x < 0) {
        return;
    }
    if (x % P >= 0 && x % P < D * P) {
        return A;
    } else {
        return 0;
    }

}

function squareWaveA(n, A = 1, D = 0.5) {
    if (n == 0) {
        return A / 2;
    }
    return A / (n * PI) * sin(2 * PI * n * D)
}
function squareWaveB(n, A = 1, D = 0.5) {
    return 2 * A / (n * PI) * (sin(PI * n * D)) ** 2;

}

function fsquareWave(N) {
    let P = 1
    return function (x) {
        let sum = squareWaveA(0) ;
        for (let n = 1; n <= N; n++) {
            sum += squareWaveA(n) * cos((2 * PI * n / P) * x) + squareWaveB(n) * sin((2 * PI * n / P) * x);
        }
        return sum;
    }
}

function fsquareWave(N) {
    let P = 1
    return function (x) {
        let sum = squareWaveA(0) ;
        for (let n = 1; n <= N; n++) {
            sum += squareWaveA(n) * cos((2 * PI * n / P) * x) + squareWaveB(n) * sin((2 * PI * n / P) * x);
        }
        return sum;
    }
}
function setup() {
    createCanvas(640, 640);

    plot = new Plotter(-10, 10, -10, 10, 400);
    let a = x => x ** 2
    plot.interactiveFunctions = [a, a]

    plot.setXTicks(linSpace(-10, 11, 21));
    plot.setYTicks(linSpace(-10, 11, 21));


    slider = new CanvasSlider(0, 200, 0, 1)
    slider.setPostion(100, 500);
}

function mousePressed() {

}
function mouseWheel(event) {
    plot.scrollToZoom(event.delta)
}


function mouseReleased() {

}

function keyTyped() {
    if (key == "z") {
        plot.zoom(1.1);
    }
    if (key == "x") {
        plot.zoom(0.9);
    }
    if (key == "r") {
        plot.resetAxes()
    }
    if (key == "c") {
        plot.OriginToGraphCenter();
    }
    if (key == "m") {
        console.log(plot._xToAxisSystem(mouseX), plot._yToAxisSystem(mouseY))
    }
    if (key == "z") {

    }


}

function draw() {
    background(255, 0, 100);
    slider.update();
    plot.autoTicks();
    let value = slider.getValue()
    var P = 1;
    var f = fsquareWave(value);
    plot.interactiveFunctions[0] = f
    //console.log(plot.interactiveFunctions[0])
    //plot.interactiveFunctions[1] = f
    plot.dragToPan();
    plot.display();
    slider.display();


}
