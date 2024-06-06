function mysqr(x){
    return x**2;
}

function linSpace(start,stop,num){
    let a = [];
    let step = (stop-start)/num;
    for(let i = 0; i < num; i++){
        a.push(start + i*step);
    }
    return a

}
/* 
TODO
store the ponts and functions to plot we only need to redraw them when when plot changes
all the not yet implemented methods
figure out user input 

*/

class Plotter{
    constructor(x_min, x_max,y_min,y_max){
        this.x_min = x_min;
        this.x_max = x_max;
        this.y_min = y_min;
        this.y_max = y_max;
        this.background_color = color(255);
        this.axis_space = 25
        this.xTicks = [];
        this.yTicks = [];
        this.showArrows = false;
        this.graphWidth = width - this.axis_space
        this.graphHeight = height - this.axis_space
        this.graphArea =  createGraphics(this.graphWidth, this.graphHeight);

    }
    _xToGraphSystem(x){
        let xGraph = (this.graphWidth/(this.x_max - this.x_min)) * x - this.x_min;
        return xGraph
    }
    _yToGraphSystem(y){
        let yGraph = this.graphHeight - (this.graphHeight/(this.y_max - this.y_min)) * y - this.y_min;
        //console.log(yGraph)
        return yGraph
    }

    setXTicks(){

    }
    setYTicks(){
        
    }
    drawXAxis(){
        stroke(100)
        strokeWeight(2)
        strokeCap(SQUARE);
        line(this.axis_space/2 ,height - this.axis_space/2 , width - this.axis_space/2 ,height -  this.axis_space/2 );
    }
    drawYAxis(){
        stroke(100)
        strokeWeight(2)
        strokeCap(SQUARE);
        line(this.axis_space/2 ,height - this.axis_space/2 , this.axis_space/2 ,  this.axis_space/2  );
    }

    pan(){

    }

    plotFunction(func){
        
        let xs = linSpace(this.x_min, this.x_max, this.graphWidth);
        let ys = xs.map(func);
        this.plotPoints(xs,ys)

    }
    plotPoint(x,y){
        this.graphArea.strokeWeight(10);
        this.graphArea.stroke(0);
        this.graphArea.point(this._xToGraphSystem(x),this._yToGraphSystem(y));

    }
    plotPoints(xs,ys){
        if(xs.length == ys.length){
            for(let i = 0; i < xs.length; i++){
                this.plotPoint(xs[i],ys[i]);
            }
            
        }else{
            console.log("arrays of xs and ys points need to be the same length")
        }
    }

    grid(){

    }

    zoomX(zoom_factor){

    }
    zoomX(zoom_factor){

    }

    zoom(zoom_factor){

    }

    display(){
        background(150);
        this.graphArea.background(this.background_color);
        this.plotPoints([1,2,3,4,5,6],[1,2,3,4,5,6]);
        this.plotFunction(mysqr);
        image(this.graphArea, this.axis_space/2, this.axis_space/2);
        this.drawXAxis()
        this.drawYAxis()
        

    }





}



function setup() {
    createCanvas(640, 360);
    
    plot = new Plotter(0,10,0,100);
}

function mousePressed() {

}



function mouseReleased() {

}


function draw() {
    plot.display()

}
