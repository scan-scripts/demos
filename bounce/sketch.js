

const GROW_SPEED = 0.01


function randomColorValues() {
  return
}



class Ball {
  constructor(x, y, r) {
    this.position = new p5.Vector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.mult(0);
    this.r = r;
    this.m = r*r / 0.1;
    this.color = [256, 256, 256, 200];
  }
  calcEnergy(){
    let K = this.m * this.velocity.mag()/2;
    let V =this.m*  g*(height-this.position.y);
    return K+V;
  }
  update() {
    this.velocity.add(gravity);
    this.position.add(this.velocity);
    
  }

  updateMass() {
    this.m = this.r*this.r/ 10;
  }

  isInBounds() {
    if (this.position.x > width - this.r) {
      this.position.x = width - this.r;
      return false;
    } else if (this.position.x < this.r) {
      this.position.x = this.r;
      return false;
    } else if (this.position.y > height - this.r) {
      this.position.y = height - this.r;
      return false;
    } else if (this.position.y < this.r) {
      this.position.y = this.r;
      return false;
    }
    return true
  }
  setBoundedPostion(newX, newY) {
    if (newX > width - this.r) {
      this.position.x = width - this.r;
    } else if (newX < this.r) {
      this.position.x = this.r;
    } else {
      this.position.x = newX;
    }
    if (newY > height - this.r) {
      this.position.y = height - this.r;
    } else if (newY < this.r) {
      this.position.y = this.r;
    }
    else this.position.y = newY;
  }


  setBoundedRadius(newR) {
    if (this.position.x > width - newR) {
      this.position.x = width - this.r;
      return;
    }
    if (this.position.x < newR) {
      this.position.x = this.r;
      return;
    }
    if (this.position.y > height - newR) {
      this.position.y = height - this.r;
      return;
    }
    if (this.position.y < newR) {
      this.position.y = this.r;
      return;
    }
    this.r = newR;

  }




  checkBoundaryCollision() {
    if (this.position.x > width - this.r) {
      this.position.x = width - this.r;
      this.velocity.x *= -1;
    } else if (this.position.x < this.r) {
      this.position.x = this.r;
      this.velocity.x *= -1;
    } else if (this.position.y > height - this.r) {
      this.position.y = height - this.r;
      this.velocity.y *= -1;
    } else if (this.position.y < this.r) {
      this.position.y = this.r;
      this.velocity.y *= -1;
    }
  }

  checkCollision(other) {
    // Get distances between the balls components
    let distanceVect = p5.Vector.sub(other.position, this.position);

    // Calculate magnitude of the vector separating the balls
    let distanceVectMag = distanceVect.mag();

    // Minimum distance before they are touching
    let minDistance = this.r + other.r;

    if (distanceVectMag < minDistance) {

      // other.position.add(correctionVector);
      // this.position.sub(correctionVector);

      // get angle of distanceVect
      let theta = distanceVect.heading();
      // precalculate trig values
      let sine = sin(theta);
      let cosine = cos(theta);

      /* bTemp will hold rotated ball this.positions. You 
       just need to worry about bTemp[1] this.position*/
      let bTemp = [new p5.Vector(), new p5.Vector()];

      /* this ball's this.position is relative to the other
       so you can use the vector between them (bVect) as the 
       reference point in the rotation expressions.
       bTemp[0].this.position.x and bTemp[0].this.position.y will initialize
       automatically to 0.0, which is what you want
       since b[1] will rotate around b[0] */
      bTemp[1].x = cosine * distanceVect.x + sine * distanceVect.y;
      bTemp[1].y = cosine * distanceVect.y - sine * distanceVect.x;

      // rotate Temporary velocities
      let vTemp = [new p5.Vector(), new p5.Vector()];

      vTemp[0].x = cosine * this.velocity.x + sine * this.velocity.y;
      vTemp[0].y = cosine * this.velocity.y - sine * this.velocity.x;
      vTemp[1].x = cosine * other.velocity.x + sine * other.velocity.y;
      vTemp[1].y = cosine * other.velocity.y - sine * other.velocity.x;

      /* Now that velocities are rotated, you can use 1D
       conservation of momentum equations to calculate 
       the final this.velocity along the x-axis. */
      let vFinal = [new p5.Vector(), new p5.Vector()];

      // final rotated this.velocity for b[0]
      vFinal[0].x =
        ((this.m - other.m) * vTemp[0].x + 2 * other.m * vTemp[1].x) /
        (this.m + other.m);
      vFinal[0].y = vTemp[0].y;

      // final rotated this.velocity for b[0]
      vFinal[1].x =
        ((other.m - this.m) * vTemp[1].x + 2 * this.m * vTemp[0].x) /
        (this.m + other.m);
      vFinal[1].y = vTemp[1].y;

      // hack to avoid clumping
      bTemp[0].x += vFinal[0].x;
      bTemp[1].x += vFinal[1].x;

      /* Rotate ball this.positions and velocities back
       Reverse signs in trig expressions to rotate 
       in the opposite direction */
      // rotate balls
      let bFinal = [new p5.Vector(), new p5.Vector()];

      bFinal[0].x = cosine * bTemp[0].x - sine * bTemp[0].y;
      bFinal[0].y = cosine * bTemp[0].y + sine * bTemp[0].x;
      bFinal[1].x = cosine * bTemp[1].x - sine * bTemp[1].y;
      bFinal[1].y = cosine * bTemp[1].y + sine * bTemp[1].x;

      // update balls to screen this.position
      other.position.x = this.position.x + bFinal[1].x;
      other.position.y = this.position.y + bFinal[1].y;

      this.position.add(bFinal[0]);

      // update velocities
      this.velocity.x = cosine * vFinal[0].x - sine * vFinal[0].y;
      this.velocity.y = cosine * vFinal[0].y + sine * vFinal[0].x;
      other.velocity.x = cosine * vFinal[1].x - sine * vFinal[1].y;
      other.velocity.y = cosine * vFinal[1].y + sine * vFinal[1].x;

      //shifts the balls back along the axis connecting them so they are not overlapping
      let distanceCorrection = (minDistance - distanceVectMag)/2 ;
      let d = distanceVect.copy();
      let correctionVector = d.normalize().mult(distanceCorrection);
      other.position.add(correctionVector);
      this.position.sub(correctionVector);

    }
  }




  display() {
    noStroke();
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);
  }

}
let g = 0.1 
gravity = new p5.Vector(0,g);
let balls = [];
balls.push(new Ball(100, 100, 10))
let mouseToggle = true;
let mouseWasPressed = false;
let mouseWasReleased = false;
let nextBall = new Ball(0, 0, 10);
let paused = false;



function setup() {
  createCanvas(1000, 1600);
}

function mouseWheel(event) {
  if (mouseIsPressed) {
    nextBall.setBoundedRadius(nextBall.r * (1 - GROW_SPEED * event.delta / 90))
    nextBall.updateMass();
  }
}
function keyTyped(){
  if (key == "p"){
    paused = !paused;

  } 
  if (key = "e"){
   let E = 0;
   let Ei;
   for(let i = 0; i<balls.length ; i++){
    Ei = balls[i].calcEnergy();
    E = E +Ei ;
   }
   console.log("total E =", E)
  }
}

function draw() {
  background(51);
  mouseWasReleased = false;
  if (mouseIsPressed) {
    mouseWasPressed = true;
  }
  if (mouseWasPressed && !mouseIsPressed) {
    mouseWasReleased = true;
    console.log("click was released")
    mouseWasPressed = false;
  }
  if (mouseIsPressed) {
    nextBall.display();
    for (let i = 0; i < 3; i++) {
      nextBall.color[i] = nextBall.color[i] + random(-20, 20);
    }

    // if(nextBall.isInBounds()){
    //   nextBall.r = nextBall.r*(1+GROW_SPEED);

    // }
    if (nextBall.isInBounds())
      nextBall.setBoundedPostion(mouseX, mouseY)


  }

  if (mouseWasReleased) {
    nextBall.checkBoundaryCollision();
    // for (let i = 0; i < balls.length; i++) {
    //   nextBall.checkCollision(balls[i]);
    // }
    balls.push(nextBall);
    nextBall = new Ball(mouseX, mouseY, 20);
    nextBall.setBoundedPostion(mouseX, mouseY)
  }

  for (let i = 0; i < balls.length; i++) {
    if(!paused){
      balls[i].update()
    }
    balls[i].display();
    balls[i].checkBoundaryCollision();
    for (let j = i + 1; j < balls.length; j++) {
      balls[i].checkCollision(balls[j]);
      balls[i].checkBoundaryCollision();
      balls[j].checkBoundaryCollision();
    }
  }

  //console.log(ball.position)
}
