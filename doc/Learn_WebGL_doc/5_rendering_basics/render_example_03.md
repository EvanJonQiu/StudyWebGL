# 5.7 - Example 3: One Color per Vertex

这个示例将帮助我们理解着色器程序中的 `varying` 变量。我们希望三角形内像素的颜色在三角形的表面上发生变化。这允许各种特殊效果，例如渐变色和灯光效果。

为了演示 `varying` 变量的工作原理，我们可以保留之前的着色器程序，只更改我们的数据。我们将为三角形的每个顶点分配不同的颜色。

## The Model

`Triangle3` 对象包含3个顶点和三种颜色。以下示例显示了我们 3D 模型的新版本。

```javascript
/**
 * simple_model_03.js, By Wayne Brown, Spring 2016
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
/**
 * A triangle composed of 3 vertices and a color.
 * @param vertices Array The triangle's vertices.
 * @param colors Array An array of 3 color values.
 * @constructor
  */
window.Triangle3 = function (vertices, colors) {
  var self = this;
  self.vertices = vertices;
  self.colors = colors;
}

//-------------------------------------------------------------------------
/**
 * A simple model composed of an array of triangles.
 * @param name String The name of the model.
 * @constructor
 */
window.SimpleModel2 = function (name) {
  var self = this;
  self.name = name;
  self.triangles = [];
}

//-------------------------------------------------------------------------
/**
 * Create a Simple_model of 4 triangles that forms a pyramid.
 * @return SimpleModel2
 */
window.CreatePyramid3 = function () {
  var vertices, triangle1, triangle2, triangle3, triangle4;
  var red, green, blue, purple;

  // Vertex data
  vertices = [  [ 0.0, -0.25, -0.50],
                [ 0.0,  0.25,  0.00],
                [ 0.5, -0.25,  0.25],
                [-0.5, -0.25,  0.25] ];

  // Colors in RGB
  red    = [1.0, 0.0, 0.0];
  green  = [0.0, 1.0, 0.0];
  blue   = [0.0, 0.0, 1.0];
  purple = [1.0, 0.0, 1.0];

  // Create 4 triangles
  triangle1 = new Triangle3([vertices[2], vertices[1], vertices[3]],
                            [blue, green, purple]);
  triangle2 = new Triangle3([vertices[3], vertices[1], vertices[0]],
                            [purple, green, red]);
  triangle3 = new Triangle3([vertices[0], vertices[1], vertices[2]],
                            [red, green, blue]);
  triangle4 = new Triangle3([vertices[0], vertices[2], vertices[3]],
                            [red, blue, purple]);

  // Create a model that is composed of 4 triangles
  var model = new SimpleModel2("simple");
  model.triangles = [ triangle1, triangle2, triangle3, triangle4 ];

  return model;
}


```

## The Shader Programs

我们的着色器程序与之前的示例一样，保持不变，为了方便我们可以继续讨论它们，把它们再次显示在下面。

shader02.vert

```javascript
// Vertex Shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

uniform   mat4 u_Transform;

attribute vec3 a_Vertex;
attribute vec3 a_Color;

varying vec4 v_vertex_color;

void main() {
  // Transform the location of the vertex
  gl_Position = u_Transform * vec4(a_Vertex, 1.0);

  v_vertex_color = vec4(a_Color, 1.0);
}


```

shader02.frag

```javascript
// Fragment shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

varying vec4 v_vertex_color;

void main() {
  gl_FragColor = v_vertex_color;
}

```

之前的顶点着色器解释是顶点着色器的职责是定位顶点，并为该顶点设置 `gl_Position ` 输出变量。这是对的，但这只说了故事的一半。顶点着色器也要准备并将顶点相关的数据传递给片段着色器。请记住，片段是与单个像素相关的数据集合。所以，在顶点着色器中声明的任何 `varying` 变量都将传递给该单个顶点的片段着色器。如果我们在一个顶点着色器中定义和计算6个 `varying` 变量，所有的这6个值都会被传递给片段着色器。`varying` 变量可以被认为是该单个顶点的片段着色器的参数。

为什么它们被称为 `varying` 变量？这是因为当它们应用于三角形的单个像素时，它们会自动更改它们的值。从技术上讲，这些值是线性插值的（linearly interpolated）。术语 **interpolated** 的意思是给定了开始和结束的值，中间的值从起始值逐渐变化成结束值。例如，从10开始到22结束，有3个中间值，插值将产生13, 16和19。术语 `linearly interpolated` 意味着任何两个连续值之间的差异是相同的。

`varying` 变量的线性插值是自动进行的。你无法控制插值也不能停止插值。如果你想在一个三角形上的所有像素都保持一个值，你仍旧需要将其声明为 `varying` 变量,但是你可以将起始值和结束值设置为相同的值，插值将计算出一个不会改变的值。例如，从 10 到 10 ，插值将把中间的每个值计算为10。

## The Buffer Object

在此示例中，顶点颜色的缓冲区对象中的数据发生了变化。研究以下示例中 `simple_model_render_03.js` 文件中的代码。

```javascript
/**
 * learn_webgl_vob_model_01.js, By Wayne Brown, Fall 2015
 *
 * Given
 *   - a model definition as defined in learn_webgl_model_01.js, and
 *   - specific shader programs: vShader01.vert, fShader01.frag
 * Perform the following tasks:
 *   1) Build appropriate Vertex Object Buffers (VOB's)
 *   2) Create GPU VOB's for the data and copy the data into the buffers.
 *   3) Render the VOB's
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
/**
 * Given a model description, create the buffer objects needed to render
 * the model. This is very closely tied to the shader implementations.
 * @param gl Object The WebGL state and API
 * @param program Object The shader program the will render the model.
 * @param model Simple_model The model data.
 * @param model_color The color of the model faces.
 * @param out Object Can display messages to the webpage.
 * @constructor
 */
window.SimpleModelRender_03 = function (gl, program, model, out) {

  var self = this;

  // Variables to remember so the model can be rendered.
  var number_triangles = 0;
  var triangles_vertex_buffer_id = null;
  var triangles_color_buffer_id = null;

  // Shader variable locations
  var a_Vertex_location = null;
  var a_Color_location = null;
  var u_Transform_location = null;

  //-----------------------------------------------------------------------
  /**
   * Create a Buffer Object in the GPU's memory and upload data into it.
   * @param gl Object The WebGL state and API
   * @param data TypeArray An array of data values.
   * @returns Number a unique ID for the Buffer Object
   * @private
   */
  function _createBufferObject(gl, data) {
    // Create a buffer object
    var buffer_id;

    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      out.displayError('Failed to create the buffer object for ' + model.name);
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer_id;
  }

  //-----------------------------------------------------------------------
  /**
   * Using the model data, build a 1D array for the Buffer Object
   * @private
   */
  function _buildBufferObjectData() {
    var j, k, m, nv, numberVertices, triangle, vertex, all_vertices;
    var nc, all_colors, color;

    // Create a 1D array that holds all of the  for the triangles
    if (model.triangles.length > 0) {
      number_triangles = model.triangles.length;
      numberVertices = number_triangles * 3;
      all_vertices = new Float32Array(numberVertices * 3);
      all_colors = new Float32Array(numberVertices * 3);

      nv = 0;
      nc = 0;
      for (j = 0; j < model.triangles.length; j += 1) {
        triangle = model.triangles[j];

        for (k = 0; k < 3; k += 1) {
          vertex = triangle.vertices[k];
          color = triangle.colors[k];

          // Store the vertices.
          for (m = 0; m < 3; m += 1, nv += 1) {
            all_vertices[nv] = vertex[m];
          }

          // Store the colors.
          for (m = 0; m < 3; m += 1, nc += 1) {
            all_colors[nc] = color[m];
          }
        }
      }

      triangles_vertex_buffer_id = _createBufferObject(gl, all_vertices);
      triangles_color_buffer_id = _createBufferObject(gl, all_colors);
    }

    // Release the temporary vertex array so the memory can be reclaimed.
    all_vertices = null;
    all_colors = null;
  }

  //-----------------------------------------------------------------------
  /**
   * Get the location of the shader variables in the shader program.
   * @private
   */
  function _getLocationOfShaderVariables() {
    // Get the location of the shader variables
    u_Transform_location = gl.getUniformLocation(program, 'u_Transform');

    a_Vertex_location    = gl.getAttribLocation(program, 'a_Vertex');
    a_Color_location     = gl.getAttribLocation(program, 'a_Color');
  }

  //-----------------------------------------------------------------------
  // These one-time tasks set up the rendering of the models.
  _buildBufferObjectData();
  _getLocationOfShaderVariables();

  //-----------------------------------------------------------------------
  /**
   * Delete the Buffer Objects associated with this model.
   * @param gl Object The WebGL state and API.
   */
  self.delete = function (gl) {
    if (number_triangles > 0) {
      gl.deleteBuffer(triangles_vertex_buffer_id);
    }
  };

  //-----------------------------------------------------------------------
  /**
   * Render the model.
   * @param gl Object The WebGL state and API.
   * @param transform 4x4Matrix The transformation to apply to the model vertices.
   */
  self.render = function (gl, transform) {

    // Set the transform for all the triangle vertices
    gl.uniformMatrix4fv(u_Transform_location, false, transform);

    // Activate the model's vertex Buffer Object
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

    // Bind the vertices Buffer Object to the 'a_Vertex' shader variable
    gl.vertexAttribPointer(a_Vertex_location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Vertex_location);

    // Activate the model's color Buffer Object
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_color_buffer_id);

    // Bind the color Buffer Object to the 'a_Color' shader variable
    gl.vertexAttribPointer(a_Color_location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color_location);

    // Draw all of the triangles
    gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);
  };

};


```

## Access to Shader Variables

着色器程序没有改变，所以获取着色器变量位置没有改变。

## Linking a Buffer Object to an Attribute Variable

与缓冲区对象的链接保持不变。

## Rendering

模型的渲染保持不变。上面例子中的渲染函数在第 172-193 行。

## Summary

组成点、线或三角形的片段的颜色使用插值分配颜色。从顶点计算的这些值是通过从起始值和结束值插值计算得出的。