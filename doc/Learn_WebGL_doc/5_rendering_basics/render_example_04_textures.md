# 5.8 - Example 4: Textures

这个例子有望帮助你对着色器程序感兴趣。我们不会详细讨论这些步骤，但代码显示在下面的演示中。

片段着色器为每个像素分配颜色。它们可以像之前的例子那样简单，也可以做到难以置信的复杂。只有想象才能限制你。

此示例执行以下操作：
* `simple_model_04.js` 中定义的模型得到增强，可以存储每个顶点的“纹理坐标”。在本例中，“纹理坐标”是由程序纹理贴图使用的 2 个数字，它片段着色器中实现。
* 构建三个缓冲区对象：一个是存储顶点的位置（x, y, z），一个是存储顶点的颜色 RGB,一个是存储纹理坐标。我们将其称为 (s,t)。
* 在渲染的饿时候，每一个在顶点着色器中的属性变量都会被连接到包含它们数据的缓冲区对象。
* 渲染整个模型只需要调用一次 `gl.drawArrays()`。
* 片段着色器使用纹理坐标来修改每个片段的颜色。请注意，纹理坐标和顶点颜色在为顶点设置的值之间“变化”它们的值。

## A Texture Map Example

```javascript
/**
 * simple_model_04.js, By Wayne Brown, Spring 2016
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
window.Triangle4 = function (vertices, colors, textures) {
  var self = this;
  self.vertices = vertices;
  self.colors = colors;
  self.textures = textures;
};

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
};

//-------------------------------------------------------------------------
/**
 * Create a Simple_model of 4 triangles that forms a pyramid.
 * @return SimpleModel2
 */
window.CreatePyramid4 = function () {
  var vertices, triangle1, triangle2, triangle3, triangle4;
  var red, green, blue, purple;
  var ta, tb, tc;

  // Vertex data
  vertices = [  [-0.5, 0.0,   0.5],
                [ 0.5, 0.0,   0.5],
                [ 0.0, 0.0,  -0.5],
                [ 0.0, 0.7,   0.0 ] ];

  // Colors in RGB
  red    = [1.0, 0.0, 0.0];
  green  = [0.0, 1.0, 0.0];
  blue   = [0.0, 0.0, 1.0];
  purple = [1.0, 0.0, 1.0];

  // Texture coordinates
  ta = [0, 0];
  tb = [40, 0];
  tc = [20, 40];

  // Create 4 triangles
  triangle1 = new Triangle4([vertices[2], vertices[1], vertices[3]],
                            [blue, green, purple],
                            [tb, ta, tc]);
  triangle2 = new Triangle4([vertices[3], vertices[1], vertices[0]],
                            [purple, green, red],
                            [tc, tb, ta]);
  triangle3 = new Triangle4([vertices[0], vertices[1], vertices[2]],
                            [red, green, blue],
                            [ta, tc, tb]);
  triangle4 = new Triangle4([vertices[0], vertices[2], vertices[3]],
                            [red, blue, purple],
                            [tb, ta, tc]);

  // Create a model that is composed of 4 triangles
  var model = new SimpleModel2("simple");
  model.triangles = [ triangle1, triangle2, triangle3, triangle4 ];

  return model;
};


```
shader03.vert

```javascript
// Vertex Shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

uniform   mat4 u_Transform;

attribute vec3 a_Vertex;
attribute vec3 a_Color;
attribute vec2 a_Texture;

varying vec4 v_vertex_color;
varying vec2 v_texture;

void main() {
  // Transform the location of the vertex
  gl_Position = u_Transform * vec4(a_Vertex, 1.0);

  // Pass on the color and texture coordinates for this vertex to the fragment shader
  v_vertex_color = vec4(a_Color, 1.0);
  v_texture = a_Texture;
}


```
shader03.frag

```javascript
// Fragment shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

varying vec4 v_vertex_color;
varying vec2 v_texture;

//-------------------------------------------------
// modify the color based on the texture coordinates
vec4 modify_color(vec2 tex_coords, vec4 color) {
  float s = tex_coords[0];
  float t = tex_coords[1];
  vec3 rgb = vec3(color);
  vec4 new_color;

  if ( mod((floor(s/10.0) + floor(t/10.0)),2.0) == 1.0) {
    // Make the color lighter
    new_color = vec4(clamp(rgb * 1.2, 0.0, 1.0), 1.0);
  } else {
    // Make the color darker
    new_color = vec4(rgb * 0.8, 1.0);
  }
  return new_color;
}

//-------------------------------------------------
void main() {
  gl_FragColor = modify_color(v_texture, v_vertex_color);
}


```

## Summary

在离开这个话题之前，让我们再次总结一下：
* 顶点着色器从缓冲区对象中获取顶点和顶点相关的数据。所有的缓冲区对象都是1维数组。缓冲区对象中的数据按顶点组织。顶点着色器计算场景中顶点的位置，并准备片段着色器计算颜色所需的任何数据。
* 片段着色器程序从顶点着色器接收每个顶点的数据，然后在图元的片段上插入值（点、线或三角形）
* 预处理步骤必须创建适当的缓冲区对象并将模型数据复制到 GPU 的缓冲区对象中。
* 每次渲染模型时，着色器的变量必须链接到其适当的缓冲区对象，然后 `gl.drawArrays()` 启动渲染过程。
