# 5.5 - Example 1: One Color per Model

我们将要渲染一个所有面都是单一颜色的简单的金字塔模型。我们需要考察以下问题：
* 着色器程序如何处理模型的顶点。
* 模型的数据是如何在对象缓冲区中组织的。
* 渲染时如何执行的。

## The Shader Programs

检查以下演示中的着色器程序，然后在下面研究它们的描述。

shader01.vert
```javascript
// Vertex Shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

uniform   mat4 u_Transform;
uniform   vec4 u_Color;

attribute vec3 a_Vertex;

void main() {
  // Transform the location of the vertex
  gl_Position = u_Transform * vec4(a_Vertex, 1.0);
}

```

shader01.frag
```javascript
// Fragment shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

uniform vec4 u_Color;

void main() {
  gl_FragColor = u_Color;
}
```

## Vertex Shader

|Lines | Description|
|------|------------|
|7-8   |模型渲染时，它的所有顶点都使用相同的变换矩阵。所有的面将使用相同的颜色渲染。那些 `uniform` 变量在渲染开始前会被设置一次。请注意，我们约定以 u_ 开头。这将帮助你跟踪变量的类型。（WebGL 着色器可能不太关心你的变量名称。这个约定是给你的 - 程序员！）|
|7     |`mat4` 是一个4x4的矩阵；16个浮点数|
|8     |`vec4` 是一个4个浮点数的向量；在本例中，颜色定义为 RGBA（red, green, blue, alpha）|
|10    |每个渲染的三角形的顶点都会改变。因此变量 `a_Vertex` 是一个属性变量。它将从缓冲区对象中取其值。`vec3` 是一个三个浮点数的数组(x, y, z)。|
|12-15 |`main()` 函数始终是着色器的入口点。该函数将对模型中的每个顶点执行一次。|
|14    |这个着色器在每个顶点上执行一个命令。它使用线性代数矩阵乘法将 4x4 矩阵乘以 4x1 向量。WebGL 着色器内置了矩阵数学！请注意，顶点只有三个值 (x,y,z)，但矩阵乘法需要 4 个值。

## Fragment Shader

|Lines | Description|
|------|------------|
|7     |像素的颜色都一样，所以我们只有一个 `uniform` 值 `u_Color`。因为该变量是全局的并且与全局顶点着色器变量同名，所以该变量链接到顶点着色器的同名变量。|
|9-11  |`main()` 函数始终是着色器的入口点。该函数将为渲染图元的每个片段（点、线或三角形）执行一次。|
|10    |此着色器对每个片段执行单个命令。它是用来设置片段的颜色。|

## The Buffer Object(s)

为渲染此模型而更改的唯一属性是其顶点。因此，我们只需要一个缓冲区对象。记住，缓冲区对象是1维的，同构的浮点值数组。我们需要将定义三角形的所有顶点收集到一个顶点数组中，并且顶点的顺序很重要。在创建数组之前，你需要决定三角形的渲染方式。共有三种选择：`gl.TRIANGLE`、`gl.TRIANGLE_STRIP` 或 `g.TRIANGLE_FAN`。另外，每个三角形的顶点从表面看上去，必须是逆时针顺序。我们的金字塔模型可以通过缓冲区对象在一次“传递”中使用 `gl.TRIANGLE` 或 `gl.TRIANGLE_STRIP` 模式进行渲染。为了保持简单，在这个例子中使用 `gl.TRIANGLE` 模式。(如果更改渲染模式，则必须更改顶点的顺序)

创建缓冲区对象是一个预处理步骤，只需要发生一次。让我们把任务分成两部分：
* 以正确的顺序将三角形顶点放入一维数组中。这是由下面的代码中的 `_buildBufferObjectData()` 函数完成的。
* 创建顶点并将其上传到 GPU 的内存中。这是由下面的代码中的 `_createBufferObject()` 函数完成的。

请注意，这两个函数是 JavaScript 类定义的私有函数，它们仅在执行构造函数代码时调用一次。

本例中，为填充缓冲区对象而创建的一维数组包含以下数据。请注意，每个连续的三个值代表一个顶点。

```javascript
[0.5, -0.25, 0.25, 0, 0.25, 0, -0.5, -0.25, 0.25, -0.5, -0.25, 0.25, 0, 0.25, 0, 0, -0.25, -0.5, 0, -0.25, -0.5, 0, 0.25, 0, 0.5, -0.25, 0.25, 0, -0.25, -0.5, 0.5, -0.25, 0.25, -0.5, -0.25, 0.25]
```

```javascript
/**
 * simple_model_render_01.js, By Wayne Brown, Fall 2015
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
window.SimpleModelRender_01 = function (gl, program, model, model_color, out) {

  var self = this;

  // Variables to remember so the model can be rendered.
  var number_triangles = 0;
  var triangles_vertex_buffer_id = null;

  // Shader variable locations
  var a_Vertex_location = null;
  var u_Color_location = null;
  var u_Transform_location = null;

  var edge_color = new Float32Array( [0.0, 0.0, 0.0, 1.0]); // BLACK

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
    var j, k, m, nv, numberVertices, triangle, vertex, vertices3;

    // Create a 1D array that holds all of the  for the triangles
    if (model.triangles.length > 0) {
      number_triangles = model.triangles.length;
      numberVertices = number_triangles * 3;
      vertices3 = new Float32Array(numberVertices * 3);

      nv = 0;
      for (j = 0; j < model.triangles.length; j += 1) {
        triangle = model.triangles[j];

        for (k = 0; k < 3; k += 1) {
          vertex = triangle.vertices[k];

          for (m = 0; m < 3; m += 1, nv += 1) {
            vertices3[nv] = vertex[m];
          }
        }
      }

      triangles_vertex_buffer_id = _createBufferObject(gl, vertices3);
    }

    // Release the temporary vertex array so the memory can be reclaimed.
    vertices3 = null;
  }

  //-----------------------------------------------------------------------
  /**
   * Get the location of the shader variables in the shader program.
   * @private
   */
  function _getLocationOfShaderVariables() {
    // Get the location of the shader variables
    u_Color_location     = gl.getUniformLocation(program, 'u_Color');
    u_Transform_location = gl.getUniformLocation(program, 'u_Transform');
    a_Vertex_location    = gl.getAttribLocation(program,  'a_Vertex');
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
    var j, start;

    // 1. Render the triangles:

    // Set the transform for all the triangle vertices
    gl.uniformMatrix4fv(u_Transform_location, false, transform);

    // Set the color for all of the triangle faces
    gl.uniform4fv(u_Color_location, model_color);

    // Activate the model's vertex Buffer Object
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

    // Bind the vertices Buffer Object to the 'a_Vertex' shader variable
    gl.vertexAttribPointer(a_Vertex_location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Vertex_location);

    // Draw all of the triangles
    gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);

    // 2. Render the edges around each triangle:

    // Set the color for all of the edges
    gl.uniform4fv(u_Color_location, edge_color);

    // Draw a line_loop around each of the triangles
    for (j = 0, start = 0; j < number_triangles; j += 1, start += 3) {
      gl.drawArrays(gl.LINE_LOOP, start, 3);
    }

  };

};

```

## Access to Shader Variables

为了渲染模型，你将在着色器程序中设置一些值，然后发出 `gl.drawArrays()` 命令。但是你有一个问题，你的数据在 JavaScript 程序的 RAM 中，而你的着色器程序是GPU上的编译程序。你如何将数据传递给着色器？分为两个步骤：
* 预处理：获取到变量在着色器程序中的位置。这相当于可以用作数组查找的索引。着色器程序中变量的位置永远不会改变，所以这些位置只需要获取一次。
* 在着色器程序中使用变量的位置来更新它。

要在着色器程序中获取变量的位置，请使用适当的 WebGL 函数：

```javascript
uint getUniformLocation(Object shader_program, string variable_name);
ulong getAttribLocation(Object shader_program, string variable_name);
```

这些函数的示例可以在上面演示代码的第 133-135 行中找到。

要在着色器程序中设置变量的值，请使用适当的 WebGL 函数:

```javascript
void uniform[1234][fi](uint location, value1, value2, value3, ...);
void uniform[1234][fi]v(uint location, Array values);
void uniformMatrix[234]fv(uint location, bool transpose, Array matrix);
```

括号中的字符，*[234]*，表示要设置的值的数量。*[fi]* 中的 **f** 意味着你正在设置一个浮点值, **i** 意味着设置的是整数。你可以将值作为离散变量发送，也可以作为单个数组中的多个值发送。使用数组的函数以 v 结尾。可以在上述演示代码的第 158、161 和 176 行找到设置着色器程序变量值的示例。

## Linking a Buffer Object to an Attribute Variable

属性变量从数组中获取它的值。这个数组通常存储在缓冲区对象当中。数组中使用的位置由调用 `gl.drawArrays(mode, start, count)` 函数中的第二个和第三个参数决定。`start` 参数给出起始的数组索引，`count` 参数指定使用多少个顶点。你必须先启用“顶点数组”，然后才能访问缓冲区对象中的值。将着色器程序中的 `a_Vertex` 属性变量链接到缓冲区对象如下所示：

```javascript
gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

gl.enableVertexAttribArray(a_Vertex_location);

gl.vertexAttribPointer(a_Vertex_location, 3, gl.FLOAT, false, 0, 0);
```

首先，你必须使特定的缓冲区对象处于活动状态。这是通过 `bindBuffer` 命令完成的。然后，你可以使用 `enableVertexAttribArray` 函数从缓冲区对象获取数据。然后，你通过调用 `vertexAttribPointer` 函数来描述缓冲区对象中数值的组织情况。第一个参数 `a_Vertex_location` 是已编译着色器程序中变量的位置，该变量将设置为缓冲区的值。让我们推迟对其他参数的正式描述。现在，其他参数告诉着色器，顶点数据中的每个顶点有 3 个值，并且这些值都是浮点数。

## Rendering

在示例代码中， `gl.drawArrays(mode, start, count)` 命令被调用了 5 次。 （参见第 171 和 180 行。）让我们讨论一下原因。

着色器被编写为使用单一颜色进行渲染。我们想要渲染一个带有黑色边缘的红色金字塔。因此我们必须调用 `drawArrays()` 函数至少两次：当颜色设置为红色时调用一次，颜色更改为黑色后调用第二次。查看演示代码。注意颜色在第161行被设置成红色，三角形被渲染是在第171行。接着，颜色被改成黑色实在176行（`edge_color`)，然后缓冲区对象中的相同顶点被用来在 `gl.LINE_LOOP` 模式下绘制三角形边缘。然而，这不能用单个绘制命令完成，因为顶点在缓冲区对象中不是这样组织的。所以我们每次都必须遍历缓冲区并更改起始索引。

## Summary

在接下来的几节课中，我们将修改我们的模型、着色器程序和渲染代码，以生成更复杂的图形。在继续下一课之前，理解上面介绍的概念很重要。因此，在继续之前，请再次阅读本课程。
