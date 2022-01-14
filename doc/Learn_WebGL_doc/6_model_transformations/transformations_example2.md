# 6.8 - Chaining Transformations - Adding a Forearm

上一课演示了矩阵变换的初始化和使用。本课将演示如何将变换链接在一起以产生复杂的运动。

## A Robot Arm - The forearm

之前的演示渲染了一个表示机器人手臂底部的对象。让我们在底座上添加一个“前臂”连杆。前臂将围绕底座中的红色销轴旋转。为了使前臂旋转，它的旋转轴需要在原点，所以我们在 Blender 中设计模型，并将红色销钉穿过前臂的位置放在原点。这将适用于你创建的所有模型。你设计它们，以便它们可以轻松地围绕其本地原点（local origin）进行缩放和旋转。然后可以将模型移动到场景中的所需位置。

![forearm](./pic/forearm.png)

对于前臂，我们希望它围绕底座中的红色销轴旋转。由于旋转始终围绕轴进行，因此需要先进行旋转。然后可以将手臂移动到销钉的位置。使用从右到左的转换顺序，因此：

```javascript
modelTransform = | translateToPin | * | rotateForearm |
```

可是,等等。底座在旋转。所以我们不能简单地将前臂移到底座上。发生在底座上的旋转同样需要发生在前臂上。所以我们也将基本旋转应用到前臂上，但是需要在它被旋转和平移之后。所以我们的 modelTransform 看起来像这样：

```javascript
modelTransform = | baseRotation | * | translateToPin | * | rotateForearm |
```

## Scene Rendering Initialization

面的演示程序是上一课代码的修改版本。它为机器人手臂添加了一个前臂模型。我们需要两个新的变换矩阵来操纵前臂。一次变换将围绕底座的销旋转手臂。旋转可能会在每个新帧上发生变化，因此该矩阵将在初始化代码中创建，但在帧渲染函数中分配其值。平移矩阵可以创建并赋值一次，因为到枢轴销的距离是恒定的并且永远不会改变。研究示例代码，然后查看下面的代码描述。如果你想进行实验，演示代码是可修改的。

```javascript
/**
 * simple_transform_example_render.js, By Wayne Brown, Spring 2016*
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
 * Initialize and render a scene.
 * @param learn Learn_webgl An instance of Learn_webgl
 * @param vshaders_dictionary Object a set of vertex shaders
 * @param fshaders_dictionary Object a set of fragment shaders
 * @param models Object a set of models
 * @param controls Array a list of control id's
 * @constructor
 */
window.SceneSimpleExampleRender2 = function (learn, vshaders_dictionary,
                                         fshaders_dictionary, models, controls) {

  // Private variables
  var self = this; // Store a local reference to the new object.

  var out = learn.out;
  var events;
  var canvas;

  var gl = null;
  var program = null;
  var render_models = {};

  var matrix = new Learn_webgl_matrix();
  var transform = matrix.create();
  var projection = matrix.createOrthographic(-10, 10, -2, 18, -20, 20);
  var view = matrix.create();
  var base_y_rotate = matrix.create();
  var forearm_rotate = matrix.create();
  var forearm_translate = matrix.create();

  // Set the forearm_translate to a constant translation along the Y axis
  matrix.translate(forearm_translate, 0, 2, 0);

  // We don't have a real view transform at this time, but we want to look
  // down on the model, so we will rotate everything by 10 degrees.
  matrix.rotate(view, 10, 1, 0, 0);

  // Public variables that will be changed by event handlers or that
  // the event handlers need access to.
  self.canvas_id = learn.canvas_id;
  self.base_y_angle = 0.0;
  self.forearm_angle = 0.0;
  self.animate_active = true;

  //-----------------------------------------------------------------------
  // Public function to render the scene.
  self.render = function () {

    // Clear the entire canvas window background with the clear color and
    // the depth buffer to perform hidden surface removal.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // The base is being rotated by the animation callback so the rotation
    // about the y axis must be calculated on every frame.
    matrix.rotate(base_y_rotate, self.base_y_angle, 0, 1, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection, view, base_y_rotate);

    // Draw the base model
    render_models.base.render(transform);

    // Set the rotation matrix for the forearm; rotate about the Z axis
    matrix.rotate(forearm_rotate, self.forearm_angle, 0, 0, 1);

    // Calculate the transform for the forearm
    matrix.multiplySeries(transform, projection, view, base_y_rotate,
        forearm_translate, forearm_rotate);

    // Draw the forearm model
    render_models.forearm.render(transform);
  };

  //-----------------------------------------------------------------------
  // Public function to delete and reclaim all rendering objects.
  self.delete = function () {
    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);
    program = null;

    // Delete each model's buffer objects
    render_models.base.delete();
    render_models.forearm.delete();
    render_models = null;

    // Disable any animation
    self.animate_active = false;

    // Remove all event handlers
    events.removeAllEventHandlers();
    events = null;

    // Release the GL graphics context
    gl = null;
  };

  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  canvas = learn.getCanvas(self.canvas_id);
  if (canvas) {
    gl = learn.getWebglContext(canvas);
    if (!gl) {
      return;
    }
  }

  // Enable hidden-surface removal
  gl.enable(gl.DEPTH_TEST);

  // Set up the rendering shader program and make it the active shader program
  program = learn.createProgram(gl, vshaders_dictionary.shader05, fshaders_dictionary.shader05);
  gl.useProgram(program);

  // Create the Buffer Objects needed for this model and copy
  // the model data to the GPU.
  render_models.base = new Learn_webgl_model_render_05(gl, program, models.Base, out);
  render_models.forearm = new Learn_webgl_model_render_05(gl, program, models.Forearm, out);

  // Set up callbacks for the user and timer events
  events = new SimpleTransformExampleEvents2(self, controls);
  events.animate();
};

```

关于执行构造函数代码时发生的预处理操作：

| Lines | description |
|------------|--------|
| 60-61 | 创建了两个新的变换来操纵前臂。|
| 64 | 前臂的平移设置为沿 Y 轴的 2 个常数单位。|
| 74 | 创建一个类变量来存储前臂的角度。它是公开的，因此 HTML 滑块事件处理程序可以更改其值。|
| 153 | 在 GPU 中创建缓冲区对象，并将模型数据复制到 GPU 用于前臂模型。|

## Rendering a Single Frame

每次需要渲染场景时，都会调用第 79-103 行的 `render` 函数。此功能与之前的演示版本相同，但有以下例外：

| Lines | description |
|------------|--------|
| 96 | 置前臂的旋转矩阵是因为前臂的旋转可以在每一帧上改变。|
| 99-100 | 计算前臂的变换。请注意，包括基本旋转。还要注意从右到左的变换顺序。转换的顺序很关键。|
| 103 | 使用计算的变换来渲染前臂模型。|