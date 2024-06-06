//make a lewis digram generator
//atoms are put together and bounds are formed

function calc_valence_electrons(total_electrons) {
    let valence_electrons = total_electrons;
    if (valence_electrons <= 2) {
        return valence_electrons;
    }
    valence_electrons -= 2;
    if (total_electrons <= 18) {
        valence_electrons = valence_electrons % 8
        if (valence_electrons == 0) {
            return 8
        }
        return valence_electrons
    }
    if (total_electrons <= 54) {
        return -1 //TODO
    }




}
class BankElement {
    constructor(symbol, atomic_number, group, charge){
        
    }

}



class Atom {
    constructor(symbol, atomic_number, group ,charge, x0, y0, r) {
        this.isDrag = false;
        this.isHover = false;
        this.x = x0;
        this.y = y0;
        this.r = r
        this.electronRadius = r / 8;
        this.dragScaleFactor = 1;

        this.symbol = symbol;
        this.atomic_number = atomic_number;
        this.total_electrons = atomic_number - charge;
        this.valence_electrons = group % 10
        // if(this.total_electrons < 0 ){
        //     console.log(`Atom ${this.symbol} with atomic number ${this.atomic_number} can't have a charge less than the atomic number`)
        //     console.log('setting charge to 0')
        // }
        // this.valence_electrons
        // this.paired_electrons
        // this.unpaired_electrons
    }
    checkOver(x, y) {
        return ((x - this.x) ** 2 + (y - this.y) ** 2 <= this.r ** 2);
    }

    updateHover(x, y) {//checks if x,y coordinates are over the atom
        this.isHover = this.checkOver(x, y);
    }

    pressed() {
        if (this.checkOver(mouseX, mouseY) == true) {
            this.isDrag = true;
            this.xOffset = this.x - mouseX;
            this.yOffset = this.y - mouseY;
        }
    }
    release() {
        this.isDrag = false;

    }

    updatePostion() {
        if (this.isDrag) {
            this.x = mouseX + this.xOffset;
            this.y = mouseY + this.yOffset;
        }
    }
    drawUnpairedElectron(position) {
        let eX;
        let eY;
        switch (position) {
            case 1:
                eX = this.x + this.r*this.dragScaleFactor;
                eY = this.y;
                break;
            case 2:
                eX = this.x;
                eY = this.y + this.r*this.dragScaleFactor;
                break;
            case 3:
                eX = this.x - this.r*this.dragScaleFactor;
                eY = this.y;
                break;
            case 4:
                eX = this.x;
                eY = this.y - this.r*this.dragScaleFactor;
                break;
            default:
                console.console.log(`electron postion must be 1, 2, 3, or 4`);
                console.assert(false);
        }
        fill(0, 0, 225);
        noStroke();
        ellipse(eX, eY,this.dragScaleFactor *  2 * this.electronRadius, this.dragScaleFactor * 2 * this.electronRadius);
    }
    drawLoanPair(position) {
        let e1X;
        let e1Y;
        let e2X;
        let e2Y;

        switch (position) {
            case 1:
                e1X = this.x + this.dragScaleFactor * this.r;
                e1Y = this.y + this.dragScaleFactor * (this.electronRadius + this.electronRadius / 2);
                e2X = this.x + this.dragScaleFactor * this.r;
                e2Y = this.y - this.dragScaleFactor * (this.electronRadius + this.electronRadius / 2);
                break;
            case 2:
                e1X = this.x + this.dragScaleFactor * (this.electronRadius + this.electronRadius / 2);
                e1Y = this.y + this.dragScaleFactor * this.r;
                e2X = this.x - this.dragScaleFactor * (this.electronRadius + this.electronRadius / 2);
                e2Y = this.y + this.dragScaleFactor * this.r;
                break;
            case 3:
                e1X = this.x - this.dragScaleFactor * this.r;
                e1Y = this.y + this.dragScaleFactor * (this.electronRadius + this.electronRadius / 2);
                e2X = this.x - this.dragScaleFactor * this.r;
                e2Y = this.y - this.dragScaleFactor * (this.electronRadius + this.electronRadius / 2);
                break;
            case 4:
                e1X = this.x + this.dragScaleFactor * (this.electronRadius + this.electronRadius / 2);
                e1Y = this.y - this.dragScaleFactor * this.r;
                e2X = this.x - this.dragScaleFactor * (this.electronRadius + this.electronRadius / 2);
                e2Y = this.y - this.dragScaleFactor * this.r;
                break;
            default:
                console.console.log(`electron postion must be 1, 2, 3, or 4`);
                console.assert(false);
        }
        fill(0, 0, 225);
        noStroke();
        ellipse(e1X, e1Y, this.dragScaleFactor * 2 * this.electronRadius, this.dragScaleFactor * 2 * this.electronRadius);
        ellipse(e2X, e2Y, this.dragScaleFactor * 2 * this.electronRadius, this.dragScaleFactor * 2 * this.electronRadius);
    }
    display() {
        //TODO make the atom bigger when it is being dragged
        //TODO display the electrons
        if(this.isDrag){
            this.dragScaleFactor = 1.1
        }else{
            this.dragScaleFactor = 1
        }
        //draw circle around atom (also the "click box")
        stroke(0)
        strokeWeight(4);
        fill(255)
        ellipse(this.x, this.y, 2 * (this.dragScaleFactor*this.r) ,2* (this.dragScaleFactor*this.r))
        
        //Draw the symbol
        strokeWeight(1);
        fill(0)
        textSize(this.dragScaleFactor*this.r/4 )
        textAlign(CENTER, CENTER);
        text(this.symbol, this.x, this.y)
        this.drawLoanPair(1)
        this.drawUnpairedElectron(2)
    }
}


function setup() {
    createCanvas(640, 360);
    a = new Atom('H', 1, 1,0, 50, 50, 50)
    atoms = [new Atom('H', 1, 1,0, 100, 200, 50) , new Atom('O',8, 16,0, 100, 300, 50)]
}

function mousePressed() {
        atoms.forEach(a =>a.pressed());
    
}



function mouseReleased() {
    atoms.forEach(a =>a.release());

}


function draw() {
    background(100);
    atoms.forEach(a =>
        {
            a.updateHover(mouseX, mouseY);
            a.updatePostion();
            a.display();
        }
    )


}
