var socket;
$(document).ready(function(){
  socket = io();
  console.log(socket);

  //setInterval(function(){ socket.emit("asciiFrame", "FRAMEEEEE"); }, 5000);

  socket.on('asciiFrame', function(asciiFrame){
    document.getElementById("ascii").innerText = asciiFrame;
  });
})




/**** ASCII CONVERSION PART****/

var video = document.querySelector('video');
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext('2d');
var MediaStream = null;
var ascii = document.getElementById("ascii");


function snapshot() {
  if (MediaStream) {
    canvas.getContext('2d').drawImage(video, 0, 0);
    document.querySelector('img').src = canvas.toDataURL('image/webp');
    asciiFromCanvas(canvas);
  }
}

//video.addEventListener('click', snapshot, false);

var errorCallback = function(e) {
  console.log('Reeeejected!', e);
};

// Not showing vendor prefixes.
navigator.webkitGetUserMedia({video: {mandatory: {maxWidth: 160,maxHeight: 100}}
  , audio: false}, function(localMediaStream) {
  MediaStream = localMediaStream;
  var video = document.querySelector('video');
  video.src = window.URL.createObjectURL(localMediaStream);

  // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
  // See crbug.com/110938.
  video.onloadedmetadata = function(e) {
    setInterval(snapshot, 30);
  };
}, errorCallback);



function asciiFromCanvas(canvas) {
  // Original code by Jacob Seidelin (http://www.nihilogic.dk/labs/jsascii/)
  // Heavily modified by Andrei Gheorghe (http://github.com/idevelop)

  var characters = (" .,:;i1tfLCG08@").split("");

  var context = canvas.getContext("2d");
  var canvasWidth = canvas.width;
  var canvasHeight = canvas.height;

  var asciiCharacters = "";

  // calculate contrast factor
  // http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
  var contrastFactor = (259 * (255)) / (255 * (259));

  var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
  for (var y = 0; y < canvasHeight; y += 2) { // every other row because letters are not square
    for (var x = 0; x < canvasWidth; x++) {
      // get each pixel's brightness and output corresponding character

      var offset = (y * canvasWidth + x) * 4;

      var color = getColorAtOffset(imageData.data, offset);

      // increase the contrast of the image so that the ASCII representation looks better
      // http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
      var contrastedColor = {
        red: bound(Math.floor((color.red - 128) * contrastFactor) + 128, [0, 255]),
        green: bound(Math.floor((color.green - 128) * contrastFactor) + 128, [0, 255]),
        blue: bound(Math.floor((color.blue - 128) * contrastFactor) + 128, [0, 255]),
        alpha: color.alpha
      };

      // calculate pixel brightness
      // http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
      var brightness = (0.299 * contrastedColor.red + 0.587 * contrastedColor.green + 0.114 * contrastedColor.blue) / 255;

      var character = characters[(characters.length - 1) - Math.round(brightness * (characters.length - 1))];

      asciiCharacters += character;
    }

    asciiCharacters += "\n";
  }
  //document.getElementById("ascii").innerText = asciiCharacters;
  socket.emit("asciiFrame", asciiCharacters);
}

function getColorAtOffset(data, offset) {
  return {
    red: data[offset],
    green: data[offset + 1],
    blue: data[offset + 2],
    alpha: data[offset + 3]
  };
}

function bound(value, interval) {
  return Math.max(interval[0], Math.min(interval[1], value));
}

