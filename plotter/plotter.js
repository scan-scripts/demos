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
                //this.value = constrain(this.minValue + round((this.value - this.minValue) / this.step) * this.step, this.minValue, this.maxValue);
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
     */
    constructor(xMin, xMax, yMin, yMax) {
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.background_color = color(255);
        this.axis_space = 25
        this.canvasX = this.axis_space / 2;
        this.canvasY = this.axis_space / 2;
        this.xTicks = [];
        this.yTicks = [];
        this.AxisColor = color(20);
        this.showArrows = false;
        this.graphWidth = width - this.axis_space
        this.graphHeight = height - this.axis_space
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
        let HorzAxisLabelTop = this._yToGraphSystem(0) +this.tickSize ;
        for (let i = 0; i < Xlabels.length; i++) {
            this.graphArea.text(Xlabels[i], this._xToGraphSystem(this.xTicks[i]), HorzAxisLabelTop)

        }
        let VertAxisLabelLeft = this._xToGraphSystem(0) - this.tickSize;
        this.graphArea.textAlign(RIGHT,CENTER);
        for (let i = 0; i < Ylabels.length; i++) {
            this.graphArea.text(Ylabels[i], VertAxisLabelLeft,this._yToGraphSystem(this.yTicks[i]))

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
        let vertGridLinekBottom = this._yToGraphSystem(0) - this.graphHeight / 2;
        let vertGridLineTop = this._yToGraphSystem(0) + this.graphHeight / 2;
        this.xTicks.map(x => this._xToGraphSystem(x)).forEach(tickX => {
            this.graphArea.line(tickX, vertGridLinekBottom, tickX, vertGridLineTop);

        });
        let horzGridLineLeft = this._xToGraphSystem(0) - this.graphWidth / 2;
        let horzGridLineRight = this._xToGraphSystem(0) + this.graphWidth / 2;
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
            console.log(mouseY);
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

    zoomX(zoom_factor) {


    }
    zoomX(zoom_factor) {

    }

    zoom(zoom_factor) {
        this.xMin *=  1/zoom_factor;
        this.xMax *=  1/zoom_factor;
        this.yMin *=  1/zoom_factor;
        this.yMax *=  1/zoom_factor;
    }

    display() {
        background(150);
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



function setup() {
    createCanvas(640, 360);

    plot = new Plotter(-10, 10, -10, 10);
    plot.interactiveFunctions.push(x => pow(x, 1))
    plot.setXTicks(linSpace(-10, 11, 21));
    plot.setYTicks(linSpace(-10, 11, 21));

    
    slider = new CanvasSlider(0, 10, 2, -1)
    slider.setPostion(100, 100);
}

function mousePressed() {

}



function mouseReleased() {

}

function keyTyped(){
    if(key == "z"){
        plot.zoom(1.1);
    }
    if(key == "x"){
        plot.zoom(0.9);
    }

}

function draw() {


    slider.update();
    var f = x => sin(x * slider.getValue())
    plot.interactiveFunctions[0] = f;
    plot.dragToPan();
    plot.display();
    slider.display();


}
