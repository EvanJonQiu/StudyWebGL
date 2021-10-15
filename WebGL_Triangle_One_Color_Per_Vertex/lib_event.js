var q_event = function (scene, canvas_id) {
  var self = this;

  var start_of_mouse_drag = null;

  self.mouse_drag_started = function (event) {
    start_of_mouse_drag = event;
    event.preventDefault();

  };

  self.mouse_drag_ended = function (event) {
    start_of_mouse_drag = null;

    event.preventDefault();
  };

  self.mouse_dragged = function (event) {
    var delta_x, delta_y;

    //console.log("drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = -(event.clientY - start_of_mouse_drag.clientY);
      //console.log("moved: " + delta_x + " " + delta_y);

      scene.angle_x -= delta_y;
      scene.angle_y += delta_x;
      scene.buildData();
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  self.createAllEventHandlers = function () {
    var id = '#' + canvas_id;
    $( id ).mousedown( self.mouse_drag_started );
    $( id ).mouseup( self.mouse_drag_ended );
    $( id ).mousemove( self.mouse_dragged );
  };

  self.createAllEventHandlers();
}