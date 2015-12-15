/* globals window, document, $, console */
(function (window, document, $, console) {
  'use strict';

  var xmlHttp,
      config,
      iconFolders;

  document.addEventListener('DOMContentLoaded', function () {
    var images = [],
      icons = [],
      $canvas = $('canvas'),
      canvas = document.querySelector('canvas'),
      currentFrame,
      out = document.querySelector('#console'),
      frameNo = document.querySelector('#frame-number'),
      demoImage = document.querySelector('#demo-img'),
      dragging = false,
      draggingDistance = 50,
      checkDragging,
      recording = false;

    function output (text) {
      var p = document.createElement('p');
      p.innerHTML = text;
      out.appendChild(p);
    }

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

    function highlightInGuide (pointerNo) {
      if (pointerNo > 0) {
        $('#pointers-guide li:nth-child(' + pointerNo + ')')[0].style.fontWeight = 'normal';
      }
      $('#pointers-guide li:nth-child(' + (pointerNo + 1) + ')')[0].style.fontWeight = 'bold';
    }

    function showPointersGuide () {
      var i,
        frag = document.createDocumentFragment(),
        li,
        guide;

      for (i = 0; i < iconFolders.length; i++) {
        li = document.createElement('li');
        li.id = iconFolders[i];
        li.innerHTML = iconFolders[i];
        frag.appendChild(li);
      }

      guide = document.querySelector('#pointers-guide');

      while (guide.firstChild) {
        guide.removeChild(guide.firstChild);
      }

      guide.appendChild(frag);
      highlightInGuide(0);
    }

    function nxtFrame (canvasElement, prevFrame) {
      if (currentFrame === undefined) {
        currentFrame = 35;
      } else if (prevFrame) {
        currentFrame = Math.abs((35 + currentFrame) % 36);
      } else {
        currentFrame = Math.abs((37 + currentFrame) % 36);
      }
      drawFrame(currentFrame, canvasElement);
      frameNo.innerHTML = currentFrame;
    }

    function getPosition (event, canvasElement) {
      var x, y;

      if (event.x !== undefined && event.y !== undefined) {
        x = event.x;
        y = event.y;
      } else {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }

      x -= canvasElement.offsetLeft;
      y -= canvasElement.offsetTop;

      x -= window.pageXOffset;
      y -= window.pageYOffset;

      return {
        x: x,
        y: y
      };
    }

    function handleMouseDown (event) {
      var iconFolder,
        icon,
        clickPos = getPosition(event, this),
        pointerClick = false;

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
          pointerClick = true;
          break;
        }
      }

      if (!pointerClick) {
        $canvas.mousemove(checkDragging);
        $canvas.on('mouseup', function quitDragging () {
          $canvas.off('mousemove');
          dragging = false;
        });
      }
    }

    $('#nxt-frame').on('mousedown', function () {
      if (!recording) {
        var i, j;
        //prepare icons object
        for (i = 0; i < 13; i++) {
          icons[i] = [];
          for (j = 0; j < 36; j++) {
            icons[i][j] = {};
          }
        }
        currentFrame = 35;
        nxtFrame(canvas);
        startRecording();
        recording = true;
        this.innerHTML = 'Next Frame';
      } else {
        stopRecording();
        nxtFrame(canvas);
        startRecording();
      }
    });

    checkDragging = (function () {
      var lastCheck = new Date(),
        lastPosition = {x: 0},
        diff,
        currPos;

      return function (event) {
        if (new Date() - lastCheck > 15) {
          lastCheck = new Date();
          if (dragging === true) {
            currPos = getPosition(event, event.target);
            diff = lastPosition.x - currPos.x;
          } else {
            dragging = true;
            diff = 0;
          }
          // If dragged for long enough.
          if (Math.abs(diff) > draggingDistance) {
            lastPosition = getPosition(event, event.target);
            if (diff > 0) { //dragging to the right;
              nxtFrame(event.target);
            } else { //dragging to the left;
              nxtFrame(event.target, true);
            }
          }
        }
      };
    }());
    //When in standby, this is the function that will be handling the canvas

    $canvas.on('mousedown', handleMouseDown);

    $('#modal').on('mousedown', function () {
      this.classList.remove('visible');
    });


    loadImages(function () {
      nxtFrame(canvas, 0);
    });
  });

  xmlHttp = new XMLHttpRequest();
  xmlHttp.open('GET', 'config.json', false); // false for synchronous request
  xmlHttp.send(null);
  config = JSON.parse(xmlHttp.responseText);
  iconFolders = Object.keys(config[Object.keys(config)[0]]);

}(window, document, jQuery, console));
