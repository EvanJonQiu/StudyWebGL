# 一个简单的WebGL程序过程

## WebGL程序主流程

1. 在HTML页面中定义一个canvas

```html
<body>
  <canvas id="c" width="398" height="298"></canvas>
  ...
</body>  
```

2. 分别定义顶点着色器程序和片段着色器程序

```html
<script id="vertex-shader-3d" type="x-shader/x-vertex">
  // vertex shader
  precision mediump int;
  precision mediump float;

  uniform vec4 u_FragColor;
  attribute vec4 a_position;

  void main() {
    gl_Position = a_position;
  }
</script>
```

```html
<script id="fragment-shader-3d" type="x-shader/x-fragment">
  //fragment shader
  precision mediump int;
  precision mediump float;

  uniform vec4 u_FragColor;

  void main() {
    gl_FragColor = u_FragColor;
  }
</script>
```

3. 获取canvas对象中的WebGL context: gl

```javascript
function main() {
  ...
  var canvas = document.getElementById("c");
  var gl = canvas.getContext("webgl");

  if (!gl) {
    return;
  }
  ...
}
```

4. 设置gl的初始化状态

```javascript
function main() {
  ...
  // clear canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  ...
}
```

5. 编译和连接顶点着色器和片段着色器程序

- 加载和编译顶点着色器程序

```javascript
  function loadVertexShader(gl) {
    const vertexShaderScript = document.getElementById("vertex-shader-3d");
    if (!vertexShaderScript) {
      throw ('*** Error: unknown script element' + "vertex-shader-3d");
    }
    let vertexShaderSource = vertexShaderScript.text;

    // Create the shader object
    const shader = gl.createShader(gl.VERTEX_SHADER);

    // Load the shader source
    gl.shaderSource(shader, vertexShaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      const lastError = gl.getShaderInfoLog(shader);
      console.log('*** Error compiling shader \'' + shader + '\':' + lastError + `\n` + shaderSource.split('\n').map((l,i) => `${i + 1}: ${l}`).join('\n'));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
```

- 加载和编译片段着色器程序

```javascript
  function loadFragmentShader(gl) {
    const fragmentShaderScript = document.getElementById("fragment-shader-3d");
    if (!fragmentShaderScript) {
      throw ('*** Error: unknown script element' + "fragment-shader-3d");
    }
    let fragmentShaderSource = fragmentShaderScript.text;

    // Create the shader object
    const shader = gl.createShader(gl.FRAGMENT_SHADER);

    // Load the shader source
    gl.shaderSource(shader, fragmentShaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      const lastError = gl.getShaderInfoLog(shader);
      console.log('*** Error compiling shader \'' + shader + '\':' + lastError + `\n` + shaderSource.split('\n').map((l,i) => `${i + 1}: ${l}`).join('\n'));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
```

- 创建渲染程序，并将顶点着色器和片段着色器程序于渲染程序进行连接

```javascript
  function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }
```

在主流程中，程序调用顺序

```javascript
function main() {
  ...
  var vertexShader = loadVertexShader(gl);
  var fragmentShader = loadFragmentShader(gl);

  var program = createProgram(gl, vertexShader, fragmentShader);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);
  ...
}
```
**注意:** 有些情况，只有在调用`gl.useProgram()`以后才能获取到渲染程序中的变量。

6. 获取渲染程序中的变量对象

```javascript
function main() {
  ...
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var colorLocation = gl.getUniformLocation(program, "u_FragColor");
  ...
}
```

7. 处理三维模型,将要渲染的三维模型数据传给渲染程序

- 创建缓冲区

```javascript
function main() {
  ...
  // Create a buffer and put three 2d clip space points in it
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  ...
}
```

- 三维模型数据拷贝到缓冲区中

```javascript
function main() {
  ...
  var positions = [
    0, 0,
    0, 0.5,
    0.7, 0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  ...
}
```

- 将缓冲区于渲染程序绑定

```javascript
function main() {
  ...
  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  ...
}
```

- 设置模型绘制参数
```javascript
function main() {
  ...
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
  ...
}
```

- 设置颜色
```javascript
function main() {
  ...
  // set color
  var pyramid_color = new Float32Array([1, 0, 0.5, 1]);
  gl.uniform4fv(colorLocation, pyramid_color);
  ...
}
```

8. 绘制模型
```javascript
function main() {
  ...
  // draw
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 3;
  gl.drawArrays(primitiveType, offset, count);
  ...
}
```

## 代码

1. 请参考SimpleWebGLExample中的代码

