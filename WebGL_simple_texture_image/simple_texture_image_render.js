var SimpleTextureImageRender = function(gl, program, model_dictionary) {

  var self = this;

  var cube;

  var matrix = new Learn_webgl_matrix();
  var transform = matrix.create();
  var projection = matrix.createOrthographic(-2.0, 2.0, -2.0, 2.0, -4.0, 4.0);
  var rotate_x_matrix = matrix.create();
  var rotate_y_matrix = matrix.create();

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 0.0;
  self.angle_y = 0.0;

  this.render = function () {
    var j, model_names;

    // Clear the entire canvas window background with the clear color
    // out.display_info("Clearing the screen");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Build individual transforms
    matrix.setIdentity(transform);
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection, rotate_x_matrix, rotate_y_matrix);
    //matrix.print("transform", transform);

    // Draw each model
    cube.render(transform);
  };

  cube = new Learn_webgl_model_render_30(gl, program, model_dictionary.cube);
}