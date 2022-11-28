//Stanley weather monster thingy

//gradient backdrop 

var colorSelect;
let c1, c2;

//monster variables 
var w = window.innerWidth, h = window.innerHeight;

var r = (w < h)?w/7:h/7; //  creature size
var x_off = 1000,y_off = 1000,z_off = 1000;
var vertices_amount = 100;

var px_offset = r/1;    // amplitude of curves
var NOISE_SCALE = 200;  // softness of curves 

var Z_SPEED = .007; // noise change per frame

var X_SPEED = 0;
var Y_SPEED = 0;

var MOUSE_FORCE = -2; 

var dom_fps = document.getElementById("fps");
var prevTime;
var color_x,
    color_speed = -.25

//weather
let weatherjson = false; 
let weatherloaded = 0; 
let counter = 0; 
let yr, ukdate; 

//face
let face;

//tracking
var imageLocation; 
var imageLocation2;

//rain
var drop = []



function setup() {
  createCanvas(1920, 1080);

  colorSelect = [color('red'), color('green'), color('blue')]; //colour array 

  setInterval(countdown, 1000); 

  //Images
  face = loadImage('Face.png'); 
  img = loadImage('temp.png');

  frameRate(50);
  color_x = (360); //colour changer 

  imageLocation = createVector(width/2, height/2); //body tracking
  imageLocation2 = createVector(width/2, height/2); //face tracking 

  for(var i = 0; i < 200; i++) { //droplet creation 
    drop[i] = new Drop();
}
}


function countdown(){

//API data 
  let m = month();
  let d = day();
  counter--; 

  if(counter<0){
    
    counter = 30;        
    yr = int(random(1963, 2022));
   
    let apidate = `${yr}-${m}-${d}`;
    ukdate = `${d}-${m}-${yr}`;
    
    let weatherurl = "https://archive-api.open-meteo.com/v1/era5?";
    weatherurl += `latitude=51.5002&longitude=-0.1262`;
    weatherurl += `&start_date=${apidate}&end_date=${apidate}`;
    weatherurl += "&daily=temperature_2m_max,rain_sum&timezone=auto";
    
    loadJSON(weatherurl, loadedweather); 
  }
}


//loadweather
function loadedweather(json){
  weatherjson = json; 
  weatherloaded++; 
}

let gravity = weatherjson.daily.rain_sum;

//rain functions
function Drop() {
    if(weatherjson===true) return;

    this.rainX = random(0, width);
    this.rainY = random(0, -height);
    
    this.show = function() {
        //aspects of the raindrops 
      noStroke();
      fill(colorSelect[2]);
      ellipse(this.rainX, this.rainY, random(5), random(15));  //position, shape/size of drops
    }
    this.update = function() {
        //rain fall aspects
      this.speed = random(5, 10);
      this.gravity = 1.01;
      this.rainY = this.rainY + this.speed*this.gravity;  
      
      if (this.rainY > height) {
        this.rainY = random(0, -height);
        this.gravity = 0;
  }
  }
  }


function draw() {

    //body tracking variables 

    var target = createVector(mouseX, mouseY);

    var distance = target.dist(imageLocation);
    var mappedDistance = map(distance, 50, 0, 1.5, 0.5);
  
    target.sub(imageLocation);
    target.normalize();
    target.mult(mappedDistance);
    
    imageLocation.add(target);

    //face track variables 

    var target2 = createVector(mouseX, mouseY);

    var distance2 = target2.dist(imageLocation2);
    var mappedDistance2 = map(distance2, 40, 0, 1.5, 0.5);

    target2.sub(imageLocation2);
    target2.normalize();
    target2.mult(mappedDistance2);

    imageLocation2.add(target2);

//graident 
c1 = color(255);
c2 = color(63, 191, 191);

//smoothness between colours 
  for(let y=0; y<height; y++){
      n = map(y, 0, height, 0, 1);
      let newc = lerpColor(c1, c2, n);
      stroke(newc);
      line(0, y, width, y);
  }

colorMode(HSB);
  
  // draw shape:
  push();
  translate(imageLocation.x, imageLocation.y);

  //monster
  noStroke();
  fill(color_x,255,255);
  
  //points of sphere alogside 
  beginShape();

  for (var a=0; a<TWO_PI;a+=TWO_PI/vertices_amount) {
    var x2 = r*sin(a);
    var y2 = r*cos(a);
    
    var new_x = x2 + (
                noise(
        ((x_off+x2)/NOISE_SCALE),
        ((y_off+y2)/NOISE_SCALE),
               z_off) * px_offset * sin(a));
    
    var new_y = y2 + (
                noise(
        ((x_off+x2)/NOISE_SCALE),
        ((y_off+y2)/NOISE_SCALE),
               z_off) * px_offset * cos(a))
    vertex(new_x,new_y);
  }
  endShape();
  
  pop();

  //face
  imageMode(CENTER);
    image(face, imageLocation2.x, imageLocation2.y, 75, 75);

  // NOISE offsets
  z_off += Z_SPEED;
  x_off += X_SPEED;
  y_off += Y_SPEED;
  color_x += color_speed;
  if(color_x >= 180) color_x -= 180;

  //text info

  fill(0);
  textSize(16);
  text(frameCount, width-150, 18);
  text(counter, width-90, 18);
  text(weatherloaded, width-25, 18);

  fill(0);
  noStroke();
  ellipse(width/2, 0, 400, 400);

  fill(255);
  noStroke();
  ellipse(width/2, 0, 300, 300);

  fill(0);
  noStroke();
  ellipse(width/2, 0, 200, 200);

  //weather info displayal 
  if(weatherjson===false) return;

  
  let temp = weatherjson.daily.temperature_2m_max;
  let rain = weatherjson.daily.rain_sum;

  let pos = map(temp, -20, 40, -1000, 0);
  image(img, 0, pos); 

  let x = 10;
  let y = 30;
  fill(255);
  textFont('HelveticaNowMicro-Bold');
  text(`Date: ${ukdate}`, 895, y);
  text(`Temp:  ${temp}°C`, 906, y+15);
  text(`Rain:  ${rain}mm`, 910, y+30);


  //rain
  for(var i = 0; i < 200; i++) {
    drop[i].show();
    drop[i].update();
  }
}