
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
function calcTickStep(range){
    const order = Math.floor(Math.log10(range));
    const significand =  range/10**order;
    // console.log("range", range)
    // console.log("order", order)
    // console.log("significand", significand)
    if (0<=significand && significand<2){
        return 10**(order-1);          
    }
    if (2<=significand&& significand<5){
        return 2*10**(order-1);
    }
    if (5<=significand&& significand<10){
        return 5*10**(order-1);           
    }
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
        this.sectionZoomToggle = false;
        this.section = {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            active: false
        }
        //this.mouseWasPressed = false;
        this.tickStepX = 1;// calcTickStep(this.maxX- this.minX);
        this.tickStepY = 1;// calcTickStep(this.maxY- this.minY);
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



    autoTickStep(){
        const rangeX = this.xMax - this.xMin;
        const rangeY = this.yMax - this.yMin;
        this.tickStepX = calcTickStep(rangeX);
        this.tickStepY = calcTickStep(rangeY);
        //console.log(this.tickStepX, this.tickStepY)


    }
    autoTicks(centerX = 0, centerY = 0) {
        this.autoTickStep()
        this.xTicks = arange(centerX, this.xMin, -this.tickStepX).concat(arange(centerX, this.xMax,this.tickStepX));
        this.yTicks = arange(centerY, this.yMin, -this.tickStepY).concat(arange(centerY, this.yMax, this.tickStepY));
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
            let digits = 15;
            let label = Number(Xlabels[i].toFixed(digits));
            this.graphArea.text(label , this._xToGraphSystem(this.xTicks[i]), HorzAxisLabelTop)

        }
        let VertAxisLabelLeft = this._xToGraphSystem(0) - this.tickSize;
        this.graphArea.textAlign(RIGHT, CENTER);
        for (let i = 0; i < Ylabels.length; i++) {
            if (Ylabels[i] === undefined) {
                console.log(Ylabels[i])
            }
            let digits =15;
            let label = Number(Ylabels[i].toFixed(digits));
            this.graphArea.text(label , VertAxisLabelLeft, this._yToGraphSystem(this.yTicks[i]))

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
        //console.log(func)
        let xs = this.graphAxislinSpace();
        let ys = xs.map(func);
        this.plotSplineGraph(xs, ys);

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
    plotSplineGraph(xs, ys) {
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
    plotLineGraph(xs, ys) {
        if (xs.length == ys.length) {
            this.graphArea.noFill();
            this.graphArea.strokeWeight(2);
            this.graphArea.stroke(0);
            this.graphArea.beginShape();
            for (let i = 0; i < xs.length; i++) {
                this.graphArea.vertex(this._xToGraphSystem(xs[i]), this._yToGraphSystem(ys[i]));
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
        plot.autoTicks();
        

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
    overGraph() {
        return ((mouseX >= this.graphX) && (mouseX <= this.graphX + this.graphWidth) && (mouseY >= this.graphY) && (mouseY <= this.graphY + this.graphHeight))
    }

    drawSection() {
        this.graphArea.strokeWidth(1);
        this.graphArea.stroke('red');
        this.graphArea.rectMode(CORNERS);
        this.graphArea.rect(this._xToAxisSystem(this.section.startX), this._yToAxisSystem(this.section.startY),
            this._xToAxisSystem(this.section.endX), this._yToAxisSystem(this.section.endY));
    }

    axisToSection() {
        let x1 = this._xToAxisSystem(this.section.startX);
        let x2 = this._xToAxisSystem(this.section.endX);
        let y1 = this._xToAxisSystem(this.section.startY);
        let y2 = this._xToAxisSystem(this.section.endY);


        this.xMin = min(x1, x2);
        this.yMin = min(y1, y2);
        this.xMax = max(x1, x2);
        this.yMax = max(y1, y2);
    }

    sectionZoom() {
        if (this.sectionZoomToggle === true) {
            //console.log(this.section)
            //TODO fix this



            if (this.overGraph() && mouseIsPressed && this.section.active === false) {
                this.section.startX = mouseX;
                this.section.startY = mouseY;
                this.section.active = true;
            }
            if (this.overGraph() && this.section.active === true) {
                this.section.endX = mouseX;
                this.section.endY = mouseY;
                if (mouseIsPressed) {
                    this.drawSection()
                }
                if (!mouseIsPressed) {
                    this.axisToSection()
                    //reset the section
                    this.section = {
                        startX: 0,
                        startY: 0,
                        endX: 0,
                        endY: 0,
                        active: false
                    }
                }
            }
        } else {
            this.section.active = false;
        }

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
        plot.autoTicks();
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

class PlotterFunction {
    constructor(lineType = "spline", color = color(0), strokeWeight = 2) {
        this.lineType

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
        let sum = squareWaveA(0);
        for (let n = 1; n <= N; n++) {
            sum += squareWaveA(n) * cos((2 * PI * n / P) * x) + squareWaveB(n) * sin((2 * PI * n / P) * x);
        }
        return sum;
    }
}

function fsquareWave(N) {
    let P = 1
    return function (x) {
        let sum = squareWaveA(0);
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

    input = createInput('');
    input.position(200, 410);


    slider = new CanvasSlider(0, 20, 0, 1)
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
    if (key == "r") {
        plot.resetAxes()
    }
    if (key == "c") {
        plot.OriginToGraphCenter();
    }
    if (key == "m") {
        console.log(plot._xToAxisSystem(mouseX), plot._yToAxisSystem(mouseY))
    }
    if (key == "s") {

        plot.sectionZoomToggle = !plot.sectionZoomToggle;
        console.log(plot.sectionZoomToggle)
    }
    if (key == "z") {

    } if (keyCode == ENTER) {
        console.log("you pressed enter")
        let userFunction;
        let msg = input.value()

        try {
            let parsed_exp = math.parse(msg);
            let compiled_exp = parsed_exp.compile();
            userFunction = x => compiled_exp.evaluate({ x: x })
            console.log(userFunction(5));

        } catch (error) {
            console.log("invalid syntax")
            //console.error(error)
            userFunction = x => { }
        }
        plot.interactiveFunctions[1] = userFunction
    }


}


function repaint() {


}

function draw() {
    if (true) {
        background(255, 0, 100);
        slider.update();
        
        //plot.sectionZoom();
        let value = slider.getValue()
        var P = 1;
        var f = fsquareWave(value);
        plot.interactiveFunctions[0] = f
        //console.log(plot.interactiveFunctions[0])

        plot.dragToPan();
        plot.display();
        slider.display();
    }

    //text(input.value(), 400, 400);

}
// test = math.compile("x+x^2")
// foo = x=> test.
// console.log(test)