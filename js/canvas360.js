/* globals window, document, console */
(function (window, document, console) {
  'use strict';

  var xmlHttp,
      config,
      iconFolders;

  document.addEventListener('DOMContentLoaded', function () {
    var images = [],
      canvas = document.querySelector('canvas'),
      currentFrame = 0,
      demoImage = document.querySelector('#demo-img');

    function drawFrame (frame, canvasElement) {
      var ctx = canvasElement.getContext('2d');
      ctx.drawImage(images[frame], 0, 0);
    }

    function loadImages (callback) {
      var i,
        loadedImages = 0;

      //Load frame images
      function imgloaded () {
        loadedImages += 1;
        if (loadedImages === 36) {
          callback();
        }
      }

      for (i = 0; i < 36; i++) {
        images[i] = new Image();
        images[i].src = 'img/img' + i + '.jpg';
        images[i].onload = imgloaded;
      }

      drawFrame(0, canvas);
    }

    function cumulativeOffset (element) {
      var top = 0,
        left = 0;

      do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
      } while(element);

      return {
        top: top,
        left: left
      };
    }

    function getPosition (event, canvasElement) {
      var x, y,
        offset = cumulativeOffset(canvasElement);

      if (event.x !== undefined && event.y !== undefined) {
        x = event.x;
        y = event.y;
      } else {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }

      x -= offset.left;
      y -= offset.top;

      x -= window.pageXOffset;
      y -= window.pageYOffset;

      return {
        x: x,
        y: y
      };
    }

    function handleClick (event) {
      var iconFolder,
        icon,
        clickPos = getPosition(event, this);

      //Check if the click was overy any of the pointers
      for (iconFolder in config[currentFrame]) {
        icon = config[currentFrame][iconFolder];

        // marker not in this frame
        if(icon === null) {
          continue;
        }

        if (clickPos.x >= icon.x1 && clickPos.x <= icon.x2 && clickPos.y >= icon.y1 && clickPos.y <= icon.y2) {
          demoImage.src = 'img/Icons/'+iconFolder+'/'+iconFolder+'.jpg';
          document.querySelector('#modal').classList.add('visible');
          break;
        }
      }
    }

    //When in standby, this is the function that will be handling the canvas
    canvas.addEventListener('click', handleClick);

    document.querySelector('#modal').addEventListener('click', function () {
      this.classList.remove('visible');
    });

    document.querySelector('input[type=range]').addEventListener('input', function (e) {
      currentFrame = e.target.value;
      console.log(currentFrame);
      drawFrame(currentFrame, canvas);
    }, false);


    loadImages(function () {
      drawFrame(currentFrame, canvas);
    });

  });

  xmlHttp = new XMLHttpRequest();
  xmlHttp.open('GET', 'config.json', false); // false for synchronous request
  xmlHttp.send(null);
  config = JSON.parse(xmlHttp.responseText);
  iconFolders = Object.keys(config[Object.keys(config)[0]]);

}(window, document, console));
