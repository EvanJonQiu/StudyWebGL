# 5.6 - Example 2: One Color per Triangle

我们希望对模型的渲染有更多的控制，每个表面可能有不同的颜色。这可以使用我们之前版本的着色程序通过调用 `gl.drawArrays()` 函数，分别绘制每个三角形来完成。代码看起来像这样：

```javascript
// Draw each triangle separately
for (start = 0, color_index = 0; start < number_vertices; start += 3, color_index += 1) {
  // Set the color of the triangle
  gl.uniform4fv(u_Color_location, colors[color_index]);

  // Draw a single triangle
  gl.drawArrays(gl.LINE_LOOP, start, 3);
}
```

然而，如果一个模型由100个或者1000个三角形组成，我们的主要问题将会是速度问题。JavaScript 程序中对 WebGL 命令的每次调用都是一个巨大的时间消耗。如果我们希望图形更快，我们需要使用 `gl.drawArrays` 的单个调用来绘制整个模型。

所以我们需要改变一些事情。当我们说改变事物时，我们的意思是改变几乎所有事物！

## The Model

模型的数据结构将会影响你如何编写其他代码。这可能有很多种可能，但是，让我们为每个“三角形”对象存储一个颜色值。以下示例显示了我们新的 3D 模型。请注意以下更改：

|Lines    |Description  |
|---------|-------------|
|38-42    |`Triangle2` 对象保存颜色。|
|72-75    |定义了各种颜色值。 |
|78-81    |每个 `Triangle2` 对象的创建都会传递不同的颜色。 |

```javascript
/**
 * simple_model_02.js, By Wayne Brown, Spring 2016
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
 * @param color Array The triangle's color.
 * @constructor
  */
window.Triangle2 = function (vertices, color) {
  var self = this;
  self.vertices = vertices;
  self.color = color;
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
 * @return SimpleModel
 */
window.CreatePyramid2 = function () {
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
  triangle1 = new Triangle2([vertices[2], vertices[1], vertices[3]], green);
  triangle2 = new Triangle2([vertices[3], vertices[1], vertices[0]], blue);
  triangle3 = new Triangle2([vertices[0], vertices[1], vertices[2]], red);
  triangle4 = new Triangle2([vertices[0], vertices[2], vertices[3]], purple);

  // Create a model that is composed of 4 triangles
  var model = new SimpleModel2("simple");
  model.triangles = [ triangle1, triangle2, triangle3, triangle4 ];

  return model;
}
```

## The Shader Programs

我们的着色器程序必须进行修改，因为我们的三维模型的每个顶点现在有两个属性：位置(x, y, z), 颜色(r, g, b)。所以我们的顶点着色器程序有两个属性变量：`a_Vertex` 和 `a_Color`。检查下面的着色器程序例子，并且研究它：

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

## Vertex Shader

|Lines    |Description  |
|---------|-------------|
|7        |本着色器中执行的 `gl.drawArrays()` 函数，只有一个变量是常量，`uniform` 模型变换矩阵 `u_Transform`|
|9-10     |每个顶点有两个属性：位置和颜色 |
|12       |使用 `varying` 存储量词将数值从顶点着色器传递到片段着色器中。这将在以后更有意义。现在，我们需要一个 `varying` 变量将顶点的颜色传给片段着色器。（注意，顶点的位置已经通过 `gl_position` 变量传递给片段着色器。）
|18       |将顶点的RGB颜色转换成RGBA颜色值并将其传递给片段着色器。|

## Fragment Shader

|Lines    |Description  |
|---------|-------------|
|7        |使用与顶点着色器相同的名称声明一个 `varying` 变量。当着色器被编译并被连接时，这个变量将包含在顶点着色器中设置的值。|
|10       |使用顶点的颜色来设置正在渲染的三角形内每个像素的颜色。|

## The Buffer Object(s)

因为每个顶点有两个属性，一个是位置，一个是颜色，我们将创建两个缓冲区对象。就像我们讨论的那样，每一个顶点必须被赋上一种颜色，即使这需要同样的颜色值重复 3 次。研究以下示例中 `simple_model_render_02.js` 文件中的代码。确保你能找到为两个缓冲区对象收集的数据的位置，然后在 GPU 中创建单独的缓冲区对象。

```javascript
/**
 * simple_model_render_02.js, By Wayne Brown, Spring 2016
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
window.SimpleModelRender_02 = function (gl, program, model, out) {

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
    var nc, all_colors;

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

          // Store the vertices.
          for (m = 0; m < 3; m += 1, nv += 1) {
            all_vertices[nv] = vertex[m];
          }

          // Store the colors.
          for (m = 0; m < 3; m += 1, nc += 1) {
            all_colors[nc] = triangle.color[m];
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
      gl.deleteBuffer(triangles_color_buffer_id);
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

因为你的变量在着色器程序种已经被改变了，你需要修改你的渲染代码来获得着色器变量的位置。上面演示代码的第 135-138 行获取着色器变量位置：

```javascript
// Get the location of the shader variables
u_Transform_location = gl.getUniformLocation(program, 'u_Transform');

a_Vertex_location    = gl.getAttribLocation(program, 'a_Vertex');
a_Color_location     = gl.getAttribLocation(program, 'a_Color');
```

## Linking a Buffer Object to an Attribute Variable

我们现在有两个缓冲区对象可以在渲染模型时连接到变量。上述演示中的第 170-181 行执行了变量连接：

```javascript
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
```

注意，你必须在使用 `gl.vertexAttribPointer()` 函数将缓冲区对象连接到变量之前使用 `gl.bindBuffer()` 函数激活缓冲区对象。

## Rendering

我们现在只需调用一次 `gl.drawArrays()` 函数就可以渲染整个模型。研究上面例子中第 164-185 行的渲染函数。

需要注意的是，我们不需要再像之前的章节那样渲染三角形的边缘。为什么？着色器程序现在需要为每个顶点从缓冲区对象种获取颜色。使用我们上面定义的着色器程序，我们可以通过创建第三个缓冲区对象并为每个顶点重复的使用黑色来渲染三角形的边缘。然后我们可以将 `a_Color` 变量连接到这个新缓冲区，并像我们在上一课中所做的那样渲染边缘。这样做会非常耗费内存。另一个选择是使用两个单独的着色器程序：其中一个着色器程序绘制表面，激活另一个着色器程序绘制边缘。这两种选择都需要权衡。

你可以像这样更改活动着色器程序：

```javascript
gl.useProgram(program);
```
改变了激活的着色器程序，就是改变了渲染上下文，这需要时间，它会降低渲染速度。因此，因此，你应该尽可能少地在着色器程序之间切换。

## Summary

为一个模型的每一个三角形使用不同的颜色，我们需要修改模型定义，着色器程序，缓冲区对象，以及渲染代码。这些都是相遇依赖的。这会使代码的开发变得困难，因为我们需要在不同的地方做一些修改。在修改渲染代码时了解 “big picture” 非常重要。
