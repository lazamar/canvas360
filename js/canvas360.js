/* globals window, document, $, FileReader */
(function (window, document, $, FileReader, console) {
  'use strict';

  var zoom = 0.5;

  document.addEventListener('DOMContentLoaded', function () {
    var images = [],
      icons = [],
      iconFolders = [
        '01_David_Mexico',
        '02_Spa',
        '03_Family_Pool',
        '04_Feature_Pool',
        '05_VIP_Pool',
        '06_Residence_Pool',
        '07_Townhouse_Villas',
        '08_Conference_Arrival',
        '09_Hotel_Arrival',
        '10_Residence_Arrival',
        '11_Beach',
        '12_PHT_ Deck',
        '13_Speciality_Restaurant'
      ],
      $canvas = $('canvas'),
      canvas = document.querySelector('canvas'),
      currentFrame,
      out = document.querySelector('#console'),
      frameNo = document.querySelector('#frame-number'),
      demoImage = document.querySelector('#demo-img'),
      modal = document.querySelector('#modal'),
      dragging = false,
      draggingDistance = 50,
      checkDragging,
      recording = false;

    function downloadFile () {
      var data = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(icons)),
        a = document.createElement('a');
      a.href = 'data:' + data;
      a.download = 'data.json';
      a.innerHTML = 'Download coordinates';
      document.body.appendChild(a);
    }

    function readSingleFile (e) {
      var file = e.target.files[0],
        reader;
      if (!file) {
        return;
      }
      reader = new FileReader();
      reader.onload = function (e) {
        var contents = e.target.result;
        icons = JSON.parse(contents);
        console.log(icons);
      };
      reader.readAsText(file);
    }

    function output (text) {
      var p = document.createElement('p');
      p.innerHTML = text;
      out.appendChild(p);
    }

    function clearOutput () {
      out.innerHTML = '';
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
      var x,
        y,
        mouseX,
        mouseY;

      if (event.x !== undefined && event.y !== undefined) {
        x = event.x;
        y = event.y;
      } else {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }

      x -= canvasElement.offsetLeft;
      y -= canvasElement.offsetTop;
      x = x - window.pageXOffset;
      y = y - window.pageYOffset;
      mouseX = x;
      mouseY = y;

      return {
        x: mouseX,
        y: mouseY
      };
    }

    function handleMouseDown (event) {
      var i,
        ico,
        pos = getPosition(event, this),
        pointerClick = false;

      //Take zoom into account
      pos.x = pos.x * (1 / zoom);
      pos.y = pos.y * (1 / zoom);

      //Check if the click was overy any of the pointers
      for (i = 0; i < icons.length; i++) {
        ico = icons[i][currentFrame];
        if (pos.x > ico.x && pos.x < ico.x + ico.w && pos.y > ico.y && pos.y < ico.y + ico.h) {
          output(iconFolders[i]);
          //Load corresponding image and show modal.
          demoImage.src = 'img/Icons/' + iconFolders[i] + '/' + iconFolders[i] + '.jpg';
          demoImage.style.transform = 'translateY(0px)';
          modal.style.visibility = 'visible';
          modal.style.opacity = 1;
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

    function stopRecording () {
      $canvas.off('mousedown');
      $canvas.off('mouseup');
    }

    function startRecording () {
      var currentPointer = 0;

      showPointersGuide();
      clearOutput();
      $('#reset')[0].className = '';
      $canvas.off('mousedown');

      $canvas.on('mousedown', function canvasMouseDown (event) {
        var pos = getPosition(event, this);
        icons[currentPointer][currentFrame].x = pos.x;
        icons[currentPointer][currentFrame].y = pos.y;
      });

      $canvas.on('mouseup', function canvasMouseUp (event) {
        var pos = getPosition(event, this);
        icons[currentPointer][currentFrame].w = pos.x - icons[currentPointer][currentFrame].x;
        icons[currentPointer][currentFrame].h = pos.y - icons[currentPointer][currentFrame].y;

        output('Recorded data for ' + iconFolders[currentPointer] + ' for frame ' + currentFrame);
        if (currentPointer + 1 < icons.length) {
          currentPointer += 1;
          highlightInGuide(currentPointer);
        } else if (currentFrame < 35) {
          stopRecording();
          output('Frame finished.');
        } else {
          stopRecording();
          $('#reset')[0].className = 'hidden';
          $('#nxt-frame').innerHTML = 'Start Recording';
          $canvas.on('mousedown', handleMouseDown);
          output('Everything finished');
          output(JSON.stringify(icons));
          downloadFile();
        }
      });
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

    $('#reset').on('mousedown', function () {
      stopRecording();
      startRecording();
    });

    $('#file-input').on('change', readSingleFile);

    checkDragging = (function () {
      var lastCheck = new Date(),
        lastPosition = {x: 0},
        diff,
        currPos;

      return function (event) {
        if (new Date() - lastCheck > 0) {
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
      demoImage.style.transform = 'translateY(-250px)';
      this.style.opacity = 0;
      this.style.visibility = 'hidden';
    });


    loadImages(function () {
      nxtFrame(canvas, 0);
    });
  });

  //To be removed
  window.parent.document.body.style.zoom = zoom;

}(window, document, jQuery, FileReader, console));
