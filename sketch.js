let webcam;
let detector;

let myVidoeRec;

let state = 0;
// 0: main page  1: recording page  2: paused page  3: saved page

let btn_pause = [];
let btn_record = [];
let btn_stop = [];
let icon_person = [];
let stateIndicator = [];

let recordingTime = '00:00:00'; //Text type variable
let recordingStartTime = 0; //Number type varialbe
let pausedStartTime = 0; //Number type variable
let pausedTime = 0; //Number type variable
let totalPausedTime = 0; //Number type variable

let peopleNumber = 0;

let detectedObjects = [];

let myWriter;
let writerMsg='';
let fileName;

let rearSetting;

function preload() {  
  detector = ml5.objectDetector('cocossd');
  
  // 0: main page  1: recording page  2: paused page  3: saved page
  btn_pause[0] = loadImage('img/nothing_recording.png');
  btn_pause[1] = loadImage('img/pause_recording.png');
  btn_pause[2] = loadImage('img/pausing_recording.png');
  btn_record[0] = loadImage('img/start_recording.png');
  btn_record[1] = loadImage('img/stop_recording.png');
  btn_record[2] = loadImage('img/restart_recording.png');
  btn_stop[0] = loadImage('img/save_text.png');
  btn_stop[1] = loadImage('img/discard_text.png');
  btn_stop[2] = loadImage('img/cancel_text.png');
  
  icon_person[0] = loadImage('img/icon_person.png');
  icon_person[1] = loadImage('img/icon_pausedPerson.png');
}

function setup() {
  rearSetting = {
    audio: false,
    video: {
      facingMode: {
        exact: "environment" //rear camera
      }
    }
  }
  
  //createCanvas(2960, 1440);
  createCanvas(windowWidth, windowHeight);
  webcam = createCapture(rearSetting);
  //webcam.size(2960, 1224);
  webcam.size(windowWidth, windowHeight);
  webcam.hide();
  
  myVideoRec = new P5MovRec();
  
  detector.detect(webcam, gotDetections);
}

function draw() {
  background(0);
  calculateRecordingTime();
  //drawVideoPreview(0,0,2960,1224);
  drawVideoPreview(0,0,windowWidth,windowHeight);
  if(state==1){
    doCOCOSSD();
    writeLog();
  }
  drawButtons(state);
  drawStatusBar(state);
  drawCounter(state);
  saveReport();
  peopleNumber = 0;
}

function drawVideoPreview(x, y, w, h){
  image(webcam, x, y, w, h);
}

function drawButtons(currentState){
  if(currentState == 3){
    image(btn_stop[0], 234*4, 312*4, 72*4, 40*4);
    image(btn_stop[1], 334*4, 312*4, 72*4, 40*4);
    image(btn_stop[2], 434*4, 312*4, 72*4, 40*4);
  }
  else{
    image(btn_pause[currentState], 1200, 1272, 28*4, 28*4);
    image(btn_record[currentState], 1400, 1248, 40*4, 40*4);
  }
}

function drawCounter(currentState){
  fill(255, 51);
  noStroke();
  
  textFont('Roboto');
  textSize(20*4);
  
  if(currentState == 1){
    fill(255);
    textAlign(LEFT);
    text(peopleNumber, 708*4, 339*4);
    image(icon_person[0], 692*4,324*4,12*4,16*4);
  }
  else if(currentState == 2){
    fill(255, 153);
    textAlign(LEFT);
    text(peopleNumber, 708*4, 339*4);
    tint(255,153);
    image(icon_person[1], 692*4,324*4,12*4,16*4);
    tint(255);
  }
}

function drawStatusBar(currentState){
  fill(0);
  noStroke();
  rect(0,306*4, 740*4, 54*4);
  
  fill(255, 51);
  noStroke();
  rect(14*4,312*4,72*4,40*4,10*4);
  
  textFont('Roboto');
  
  
  let currentTime = ''+year()+'.'+nf(month(),2,0)+'.'+nf(day(),2,0)+'.'+'\n'+nf(hour(),2,0)+':'+nf(minute(),2,0)+':'+nf(second(),2,0);

  textAlign(CENTER);
  
  if(currentState==0){
    fill(255,153);
    textSize(20*4);
    text(recordingTime, 437*4,340*4);
  }
  else if(currentState==1){
    fill(186,8,8);
    textSize(20*4);
    text(recordingTime, 437*4,340*4);
    fill(255)
  }
  else if(currentState==2){
    fill(186,8,8, 153);
    textSize(20*4);
    text(recordingTime, 437*4,340*4);
    fill(255,153)
  }
  else{
    fill(255,153)
  }
  textSize(12*4);
  text(currentTime, 50*4, 330*4);
}


function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }
  
  detectedObjects = results;
  detector.detect(webcam, gotDetections);
}



function mouseReleased(){
  if(state == 0){
    if(dist(mouseX, mouseY, 740*4/2, 333*4) <= 20*4){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 0.Main Page.
      recordingStartTime = millis();
      startLog();
      myVideoRec.startRec(); // start recording video
    }
  }else if(state == 1){
    if(dist(mouseX, mouseY, 314*4, 333*4) <= 14*4){ // for Pause BTN
      state = 2; //go to 2.Paused Page from 1.Recording Page.
      pausedStartTime = millis();
    }
    if(dist(mouseX, mouseY, 740*4/2, 333*4) <= 20*4){ // for Stop BTN
      state = 3; //go to 3.Saved Page from 1.Recording Page.
      pausedStartTime = millis();      
    }
  }else if(state == 2){
    if(dist(mouseX, mouseY, 740*4/2, 333*4) <= 20*4){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 2.Paused Page.
      totalPausedTime = totalPausedTime + pausedTime;
    }
  }else if(state == 3){
    if(234*4<=mouseX && mouseX <=306*4 && 312*4<=mouseY && mouseY<=352*4){ //SAVE
      state = 0; //go to 0.Main Page from 3.Saved Page.
      initializeTimes();
      saveLog();
      myVideoRec.stopRec(); // stop and save the video
      recordingTime = '00:00:00';
      print("SAVED!")
    }
    else if(334*4<=mouseX && mouseX<=406*4 && 312*4<=mouseY && mouseY<=352*4){ //DISCARD
      state = 0; //go to 0.Main Page from 3.Saved Page.
      initializeTimes();
      myWriter.clear();
      //saveLog();
      myVideoRec = new P5MovRec(); // stop and save the video
      recordingTime = '00:00:00';
      print("DISCARDED!")
    }
    else if(434*4<=mouseX && mouseX<=506*4 && 312*4<=mouseY && mouseY<=352*4){ //CANCEL
      state = 2; //go to 0.Main Page from 3.Saved Page.
      print("CLOSED!")
    }
  }
}
function initializeTimes(){
  recordingStartTime = 0;
  pausedStartTime = 0;
  pausedTime = 0;
  totalPausedTime = 0;
}

function calculateRecordingTime(){
  let cur_time = millis();
  
  if(state == 0){ //0.Main Page
    recordingTime = '00:00:00';
  }else if(state == 1){ //1.Recording Page
    let rec_time = cur_time - recordingStartTime - totalPausedTime;
    let rec_sec = int(rec_time / 1000) % 60;
    let rec_min = int(rec_time / (1000*60)) % 60;
    let rec_hour = int(rec_time / (1000*60*60)) % 60;
    
    recordingTime = ''+nf(rec_hour,2,0)+':'+nf(rec_min,2,0)+':'+nf(rec_sec,2,0);
  }else if(state == 2){ //2.Paused Page
    pausedTime = millis() - pausedStartTime;
  }else if(state == 3){ //3.Saved Page
    pausedTime = millis() - pausedStartTime;
    //recordingTime = '00:00:00';
  }
}

function doCOCOSSD(){
  let tempMsg='';
  for (let i = 0; i < detectedObjects.length; i++) {
    let object = detectedObjects[i];
    
    if(object.label == 'person'){
      peopleNumber = peopleNumber + 1;
      
      stroke(255,92,0);
      strokeWeight(4*4);
      noFill();
      rect(object.x, object.y, object.width, object.height);
      noStroke();
      fill(255,92,0);
      textSize(16*4);
      text(object.label+' '+peopleNumber, object.x + 120, object.y-24);
      
      let centerX = object.x + (object.width/2);
      let centerY = object.y + (object.height/2);
      strokeWeight(4*4);
      stroke(255,92,0);
      point(centerX, centerY);
      
      tempMsg = tempMsg+','+peopleNumber+','+centerX+','+centerY;
      //개별 사람마다의 X, Y 좌표값 저장
    }
  }
  let millisTime = int(millis() - recordingStartTime - totalPausedTime);
  writerMsg = ''+recordingTime+','+millisTime+','+peopleNumber+''+tempMsg;
  // 현재 레코딩 타임과 함께 tempMsg 저장
}


function startLog(){
  let mm = nf(month(),2,0);
  let dd = nf(day(),2,0);
  let ho = nf(hour(),2,0);
  let mi = nf(minute(),2,0);
  let se = nf(second(),2,0);
  
  fileName = 'data_'+ mm + dd +'_'+ ho + mi + se+'.csv';
  
  myWriter = createWriter(fileName);
}

function saveLog(){
  myWriter.close();
  myWriter.clear();
}

function writeLog(){
  myWriter.print(writerMsg);
}

function saveReport(){
  if (state==3){
    fill(0, 157);
    noStroke();
    rect(145*4,82*4,450*4,180*4,10*4);

    textFont('Space Mono');
    textSize(16*4);
    textAlign(CENTER);
    fill(255);
    text("ID: " + fileName + '\n' + '\n' + 'Total Runtime: ' + recordingTime, 370*4, 153*4)
  }
}