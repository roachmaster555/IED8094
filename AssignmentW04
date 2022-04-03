let webcam;
let detector;

let detectedObjects = [];

let img_ratio;

let count = 0;

let recordButton;
let stopButton;

let startTime = 0;

let writerState = 0; // 0: do not write. 1: write
let myWriter;

let mm;
let dd;
let ho;
let mi;
let se;

let pausedTime;

function setup() {
  //createCanvas(2960, 1440); //phone
  createCanvas(640, 600); //mac
  webcam = createCapture(VIDEO);
  //webcam.size(2960, 1360); //phone
  webcam.size(640, 440); //mac
  webcam.hide();
  //detector.detect(webcam, gotDetections);

  recordButton = createButton("Record");
  recordButton.mouseReleased(startLog);
  recordButton.position(300, 510);
  pauseButton = createButton("Pause");
  pauseButton.mouseReleased(pauseLog);
  pauseButton.position(200, 510);
  stopButton = createButton("Stop");
  stopButton.mouseReleased(saveLog);
  stopButton.position(400, 510);
}
///////////////////////////////////////
function startLog() {
  mm = month();
  dd = day();
  ho = hour();
  mi = minute();
  se = second();

  let fileName = "data_" + mm + dd + "_" + ho + mi + se + ".txt";

  myWriter = createWriter(fileName);

  writerState = 1; //이제부터 로그를 시작해라
  startTime = millis(); //Start 버튼을 누른 시간을 기록
}

function pauseLog() {
  writerState = 0.5;

  pausedTime = (millis() - startTime) / 1000;
  restartButton = createButton("Restart");
  restartButton.mouseReleased(restartLog);
  restartButton.position(200, 510);
}
function restartLog() {
  writerState = 1;
  startTime = millis() - pausedTime * 1000;
  millis() - startTime;
  pauseButton = createButton("Pause");
  pauseButton.mouseReleased(pauseLog);
  pauseButton.position(200, 510);
}

function saveLog() {
  myWriter.close();
  myWriter.clear();

  writerState = 0; //이제 로그를 멈춰라
}
///////////////////////////////////////

function draw() {
  background(0);
  image(webcam, 0, 0);

  let recordingTime = (millis() - startTime) / 1000;
  let timeMin = int(recordingTime / 60);
  let timeSec = int(recordingTime % 60);
  let timeMSec = int((recordingTime * 100) % 100);
  let logMsg = recordingTime + ",";
  let xyPositions = "";

  fill(255);
  noStroke();
  mm = month();
  dd = day();
  ho = hour();
  mi = minute();

  text("Time: " + mm + "/" + dd + "  " + ho + ":" + mi, 10, 30);
  if (writerState == 0) {
    text("Recording Time: " + 0, 10, 60);
  } else if (writerState == 0.5) {
    let pausedtimeMin = int(pausedTime / 60);
    let pausedtimeSec = int(pausedTime % 60);
    let pausedtimeMSec = int((pausedTime * 100) % 100);
    text(
      "Recording Time: " +
        pausedtimeMin +
        ":" +
        pausedtimeSec +
        "." +
        pausedtimeMSec,
      10,
      60
    );
  } else if (writerState == 1) {
    text("Recording Time: " + timeMin + ":" + timeSec + "." + timeMSec, 10, 60);
  }
}
