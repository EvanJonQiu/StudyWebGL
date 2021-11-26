/**
 * learn_webgl_events_01.js, By Wayne Brown, Fall 2015
 *
 * These event handlers can modify the characteristics of a scene.
 * These will be specific to a scene's models and the models' attributes.
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 C. Wayne Brown
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

//-------------------------------------------------------------------------
function CameraLookatEvents(scene, control_id_list) {

  var self = this;

  //-----------------------------------------------------------------------
  self.mouse_drag_started = function (event) {

    //console.log("started mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = event;
    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = false;
    }
  };

  //-----------------------------------------------------------------------
  self.mouse_drag_ended = function (event) {

    //console.log("ended mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = null;

    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = true;
      self.animate();
    }
  };

  //-----------------------------------------------------------------------
  self.mouse_dragged = function (event) {
    var delta_x, delta_y, new_x, new_y;
    var x_limit, y_limit;

    // Limit the change in angle to -30 to + 30 degree;
    x_limit = 180 * 0.017453292519943295;
    y_limit =  60 *  0.017453292519943295;

    //console.log("drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    if (start_of_mouse_drag) {
      delta_x = -(event.clientX - start_of_mouse_drag.clientX) * 0.01745;
      delta_y = (event.clientY - start_of_mouse_drag.clientY) * 0.01745;

      new_x = scene.angle_x + delta_x;
      new_y = scene.angle_y + delta_y;

      if (new_x >= -x_limit && new_x <= x_limit) {
        scene.angle_x = new_x;
      }
      if (new_y >= -y_limit && new_y <= y_limit) {
        scene.angle_y = new_y;
      }
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //------------------------------------------------------------------------------
  function _updateValuesDisplay() {
    $('#eye_text').html('<strong>eye ('
        + Number($("#W1_eyeX").val()).toFixed(1) + ', '
        + Number($("#W1_eyeY").val()).toFixed(1) + ', '
        + Number($("#W1_eyeZ").val()).toFixed(1) + ')</strong>');
    $('#center_text').html('<strong>center ('
        + Number($("#W1_cX").val()).toFixed(1) + ', '
        + Number($("#W1_cY").val()).toFixed(1) + ', '
        + Number($("#W1_cZ").val()).toFixed(1) + ')</strong>');
    $('#up_text').html('<strong>up &lt;'
        + Number($("#W1_upX").val()).toFixed(1) + ', '
        + Number($("#W1_upY").val()).toFixed(1) + ', '
        + Number($("#W1_upZ").val()).toFixed(1) + '&gt;</strong>');
  }

  //------------------------------------------------------------------------------
  self.html_control_event = function (event) {
    var control;

    control = $(event.target);
    if (control) {
      switch (control.attr('id')) {
        case "W1_reset":
          // Change the render values
          var zero = 0;
          var one = 1;
          var five = 5;
          scene.eyex = zero;
          scene.eyey = zero;
          scene.eyez = five;
          scene.centerx = zero;
          scene.centery = zero;
          scene.centerz = zero;
          scene.upx = zero;
          scene.upy = one;
          scene.upz = zero;

          // Change the sliders
          $("#W1_eyeX").val(zero);
          $("#W1_eyeY").val(zero);
          $("#W1_eyeZ").val(five);

          $("#W1_cX").val(zero);
          $("#W1_cY").val(zero);
          $("#W1_cZ").val(zero);

          $("#W1_upX").val(zero);
          $("#W1_upY").val(one);
          $("#W1_upZ").val(zero);

          // Changed displayed text
          _updateValuesDisplay();
          scene.render();
          break;

        case "W1_eyeX":
          var eyex = Number(control.val());
          scene.eyex = eyex;
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_eyeY":
          var eyey = Number(control.val());
          scene.eyey = eyey;
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_eyeZ":
          var eyez = Number(control.val());
          scene.eyez = eyez;
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_cX":
          var centerx = Number(control.val());
          scene.centerx = centerx;
          scene.render();
          _updateValuesDisplay()
          break;

        case "W1_cY":
          var centery = Number(control.val());
          scene.centery = centery;
          scene.render();
          _updateValuesDisplay()
          break;

        case "W1_cZ":
          var centerz = Number(control.val());
          scene.centerz = centerz;
          scene.render();
          _updateValuesDisplay()
          break;

        case "W1_upX":
          scene.upx = Number(control.val());
          scene.render();
          _updateValuesDisplay()
          break;

        case "W1_upY":
          scene.upy = Number(control.val());
          scene.render();
          _updateValuesDisplay()
          break;

        case "W1_upZ":
          scene.upz = Number(control.val());;
          scene.render();
          _updateValuesDisplay()
          break;
      }
    }
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    var j;
    for (j = 0; j < control_id_list.length; j += 1) {
      var control = $('#' + control_id_list);
      if (control) {
        control.unbind("click", self.html_control_event);
      }
    }
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Private variables
  var out = scene.out;    // Debugging and output goes here.
  var canvas = scene.canvas;

  // Remember the current state of events
  var start_of_mouse_drag = null;
  var previous_time = Date.now();
  var animate_is_on = scene.animate_active;

  // Control the rate at which animations refresh
  var frame_rate = 30; // 33 milliseconds = 1/30 sec
  //var frame_rate = 0; // gives screen refresh rate (60 fps)

  // Add an onclick callback to each HTML control
  var j;
  for (j = 0; j < control_id_list.length; j += 1) {
    var id = '#' + control_id_list[j];
    var control = $(id);
    if (control) {
      var control_type = control.prop('type');
      if (control_type === 'checkbox') {
        control.click( self.html_control_event );
      } else if (control_type === 'submit') {
        control.click( self.html_control_event );
      } else {
        //control.on( 'input', self.html_control_event );
        var a = document.getElementById(control_id_list[j]);
        document.addEventListener('input', self.html_control_event)
      }
    }
  }
}



