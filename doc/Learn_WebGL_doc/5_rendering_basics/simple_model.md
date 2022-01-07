# 5.4 - A Simple Model

渲染模型不是一个简单的过程。如果我们从最简单的例子开始，逐渐增加复杂性，就会更容易理解事情是如何运作的。当你渲染复杂模型时，你将需要在 Blender（或其他一些建模工具）中设计这些模型。出于我们的目的，让我们手动定义一个非常简单的 3D 模型来使用。

## A Simple 3D Model

检查 `simple_model_01.js` 文件中的代码，请注意以下重要思想：
* `Triangle` 函数（37行）是一个不包含任何功能的类定义。它将保存定义一个三角形的数据。开始时很简单，一个 `Triangle` 对象将包含一个包含三个顶点的数组。
* `SimpleModel` 函数（48行）是一个不包含任何功能的类定义。它将保存模型的“名称”和三角形对象的数组。模型最简单的形式就是三角形的集合。
* `CreatePyramid` 函数（59行）创建了一个名为模型的 SimpleModel 类的实例，给它一个名字叫“简单”，并将其三角形数组设置为金字塔的 4 个三角形。

```javascript
/**
 * simple_model_01.js, By Wayne Brown, Spring 2016
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
 * A simple triangle composed of 3 vertices.
 * @param vertices Array An array of 3 vertices.
 * @constructor
  */
window.Triangle = function (vertices) {
  var self = this;
  self.vertices = vertices;
};

//-------------------------------------------------------------------------
/**
 * A simple model composed of an array of triangles.
 * @param name String The name of the model.
 * @constructor
 */
window.SimpleModel = function (name) {
  var self = this;
  self.name = name;
  self.triangles = [];
};

//-------------------------------------------------------------------------
/**
 * Create a Simple_model of 4 triangles that forms a pyramid.
 * @return SimpleModel
 */
window.CreatePyramid = function () {
  var vertices, triangle1, triangle2, triangle3, triangle4;

  // Vertex data
  vertices = [  [ 0.0, -0.25, -0.50],
                [ 0.0,  0.25,  0.00],
                [ 0.5, -0.25,  0.25],
                [-0.5, -0.25,  0.25] ];

  // Create 4 triangles
  triangle1 = new Triangle([vertices[2], vertices[1], vertices[3]]);
  triangle2 = new Triangle([vertices[3], vertices[1], vertices[0]]);
  triangle3 = new Triangle([vertices[0], vertices[1], vertices[2]]);
  triangle4 = new Triangle([vertices[0], vertices[2], vertices[3]]);

  // Create a model that is composed of 4 triangles
  var model = new SimpleModel("simple");
  model.triangles = [ triangle1, triangle2, triangle3, triangle4 ];

  return model;
};
```

在接下来的课程序列中，我们将使用这个简单的模型来执行以下操作：
* 整个模型使用单一颜色来渲染金字塔。
* 每个面使用不同的颜色来渲染金字塔。
* 每个顶点使用不同的颜色来渲染金字塔。
* 使用每个顶点的纹理坐标来渲染金字塔。

通过这些不同的示例，你会发现着色器程序、缓冲区对象和 JavaScript 渲染代码是非常相互依赖的。当您更改其中之一时，它们都必须更改！


## A Side Note about JavaScript Functions

为了使演示代码可在网页中编辑，必须使用非标准语法定义函数，使它们“事后”（after the fact）可更改。当网页被加载时，这些函数会被添加到JavaScript环境当中。但是演示代码需要重新定义它们。`This is tricky JavaScript stuff that I would like to not explain, but you will be confused if it is not explained, so here goes...`

全局 JavaScript 空间是由名为 window 的特殊对象定义的。如果你想检查此对象，请在开发人员工具的 JavaScript 控制台窗格中键入 window 并按 Enter。然后，你可以通过单击对象前面的向右箭头来展开该对象以查看其属性。（全局环境有很多东西）

当你定义一个函数时，你正在创建一个对象。对象可以被赋值给一个变量，正在创建一个对象，或者像任何变量一样被修改。当你在全局空间中创建一个函数，会使用函数名称作为属性名称添加到 window 对象中，称为它的新属性。这个新属性是对新函数对象的引用。但是，JavaScript 向函数对象添加了额外的属性，使该对象不可修改。让我们看一个例子：

```javascript
// Create a global function
function example1(a,b,c) {
 ...
}

// Create a function and store it in a global variable
var example2 = function (a,b,c) {
  ...
}
```

现在，你有两个新的函数对象和两个新的window的属性：`window.example1` 和 `window.example2` 。两个属性都保持着对函数对象的引用。然而，这些对象被神秘的属性所修改，这些属性使得这些函数不能被修改。

如果我们直接定义一个 window 对象的属性，函数定义和 window 属性不会被添加任何神秘属性。因此，如果我们定义一个全局函数如下：

```javascript
// Create a global property that references a function
window.example3 = function (a,b,c) {
 ...
}
```

不会对新属性执行任何秘密更改，我们可以将 window.example3 属性重新定义为我们想要的任何内容，包括不同版本的函数代码！