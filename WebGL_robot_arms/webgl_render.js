window.webgl_render = function(gl, program, model, transformLocation, colorLocation, positionAttributeLocation) {
  var self = this;

  var number_triangles = 0;
  var triangles_vertex_buffer_id = null;
  var triangles_color_buffer_id = null;
  var triangles_normal_buffer_id = null;
  var triangles_smooth_normal_buffer_id = null;

  var number_lines = 0;
  var lines_vertex_buffer_id = null;
  var lines_color_buffer_id = null;

  var number_points = 0;
  var points_vertex_buffer_id = null;
  var points_color_buffer_id = null;

  function _createBufferObject(data) {
    // Create a buffer object
    var buffer_id;

    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      console.log('Failed to create the buffer object for ' + model.name);
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer_id;
  }

  function _buildBufferObjects() {

    // Build the buffers for the triangles
    if (model.triangles !== null && model.triangles.vertices.length > 0) {
      number_triangles = model.triangles.vertices.length / 3 / 3;
      triangles_vertex_buffer_id = _createBufferObject(model.triangles.vertices);
      triangles_color_buffer_id = _createBufferObject(model.triangles.colors);
      triangles_normal_buffer_id = _createBufferObject(model.triangles.flat_normals);
      triangles_smooth_normal_buffer_id = _createBufferObject(model.triangles.smooth_normals);
    }

    // Build the buffers for the lines
    if (model.lines !== null && model.lines.vertices.length > 0) {
      number_lines = model.lines.vertices.length / 3 / 2;
      lines_vertex_buffer_id = _createBufferObject(model.lines.vertices);
      lines_color_buffer_id = _createBufferObject(model.lines.colors);
    }

    // Build the buffers for the points
    if (model.points !== null && model.points.vertices.length > 0) {
      number_points = model.points.vertices.length / 3; // 3 components per vertex
      points_vertex_buffer_id = _createBufferObject(model.points.vertices);
      points_color_buffer_id = _createBufferObject(model.points.colors);
    }

  }

  function _renderPoints() {
    if (number_points > 0) {
      // Activate the model's vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, points_vertex_buffer_id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionAttributeLocation);

      // Activate the model's point color object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, points_color_buffer_id);

      // Bind the colors VOB to the 'a_Color' shader variable
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(colorLocation);

      // Draw all of the lines
      gl.drawArrays(gl.POINTS, 0, number_points);
    }
  }

  function _renderLines() {
    if (number_lines > 0) {
      // Activate the model's line vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, lines_vertex_buffer_id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionAttributeLocation);

      // Activate the model's line color object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, lines_color_buffer_id);

      // Bind the colors VOB to the 'a_Color' shader variable
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(colorLocation);

      // Draw all of the lines
      gl.drawArrays(gl.LINES, 0, number_lines * 2);
    }
  }

  function _renderTrianglesJustColors() {
    if (number_triangles > 0) {
      // Activate the model's triangle vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionAttributeLocation);

      // Activate the model's triangle color object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, triangles_color_buffer_id);

      // Bind the colors VOB to the 'a_Color' shader variable
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(colorLocation);

      // Draw all of the triangles
      gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);
    }
  }

  _buildBufferObjects();

  self.render = function (transform) {

    gl.uniformMatrix4fv(transformLocation, false, transform);

    _renderPoints();
    _renderLines();
    _renderTrianglesJustColors();
  }
};