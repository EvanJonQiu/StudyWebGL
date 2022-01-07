# 5.3 - A Primer on Buffer Objects

缓冲区对象是GPU上一个连续的内存块，它可以被GPU上执行的着色器程序快速的访问。缓冲区对象保存了着色器程序需要渲染的数据。缓冲区对象是个1维数组。基于我们的目的，我们将考虑缓冲区对象始终是同质的-也就是说，每个值都具有相同类型。（你可以将不同的数据类型与JavaScript代码进行混用，但是让我们保持代码的简单性）

缓冲区对象为顶点着色器程序中的 `attribute` 变量提供数据。请记住，WebGL是OpenGL的一个受限子集，WebGL只允许 `attribute` 变量的类型为：`float`, `vec2`, `vec3`, `vec4`, `mat2`, `mat3`, 和 `mat4`。这些都是浮点数据。因此，你创建的所有的缓冲区对象将会是浮点数值的数组。

JavaScript不是强类型语言(a strongly typed language)，它不会区分不同类的数字。大部分程序有短整型，整形，浮点型，双精度型数据类型。JavaScript只有一种数字类型: `number`。JavaScript 被修改为通过添加“类型化数组”（typed array）对象来处理二进制数据值。对于WebGL来说，你的所有缓冲区对象将会包含 `Float32Array` 数组。

```javascript
// Floating point arrays.
var f32 = new Float32Array(size); // Fractional values with 7 digits of accuracy
```

将数据放入到“类型化数组”的方式有两种：
* 包括一个普通的 JavaScript 数字数组作为构造函数的参数。
* 创建特定大小的数组，然后为各个元素设置特定值。

下面的代码演示了这两个方法：
```javascript
// Create an array containing 6 floats. Notice the brackets around the array data.
var my_array = new Float32Array( [1.0, 2.0, 3.0, -1.0, -2.0, -3.0] );

// Create an array to hold 4 floating point numbers.
var an_array = new Float32Array(4);
an_array[0] = 12.0;
an_array[1] =  5.0;
an_array[2] = 37.0;
an_array[3] = 18.3;
```

## Creating and Initializing Buffer Objects

注意，缓冲区对象存在于GPU中，但是它们是通过JavaScript代码中调用WebGL API来创建、管理、和删除的。下面是创建缓冲区对象并用数据填充它的典型命令序列。

```javascript
//-----------------------------------------------------------------------
function createAndFillBufferObject(gl, data) {
  var buffer_id;

  // Create a buffer object
  buffer_id = gl.createBuffer();
  if (!buffer_id) {
    out.displayError('Failed to create the buffer object for ' + model_name);
    return null;
  }

  // Make the buffer object the active buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

  // Upload the data for this buffer object to the GPU.
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  return buffer_id;
}
```

上面的代码中，请注意以下几点：
* 创建对象缓冲区（object buffer）只不过是为新缓冲区保留一个新 ID。
* 你通常会有很多的对象缓冲区，但是只有一个是“活动的缓冲区”(active buffer)。当你对缓冲区对象发出命令时，你总是在操纵“活动缓冲区”。`bindBuffer` 函数使用 `buffer_id` 将“活动缓冲区”更改为特定的缓冲区。
* `bindData` 函数将数据从你的JavaScript程序中拷贝到GPU中的缓冲区对象当中。如果缓冲区对象中已经含有数据，那么当前的数据将被删除，而新的数据将被添加到缓冲区对象中。
* 当你将数据拷贝到GPU中的时候，你将收到的主要错误信息是 `OUT_OF_MEMORY`。上面的代码会调用 `gl.getError()` 函数来检查 gl 的错误，但我们会担心稍后会发现错误。

## Shaders, Buffers, and the Graphics Pipeline

着色器程序有时很难“wrap your brain around”，因为图形管道和着色器程序之间的关系并不明显，有时甚至从未解释过。让我们尝试编写一些伪代码来描述图形管道如何执行渲染。

每一次你的JavaScript程序调用 `gl.drawArrays(mode, start, count)` 函数，`count` 参数表示通过图形管道发送的顶点数。保存在缓冲区对象当中的顶点数组中的每一个顶点都会调用一次你的顶点着色器程序。在图形管道内部，执行此操作的算法（该算法对于你来说是隐藏的）：

```javascript
for (j = start; j < count; j += 1) {
  call vertex_shader(vertex_buffer[j]);
}
```

如果要创建复杂的图形图像，顶点和片段着色器需要的不仅仅是位置数据。这些信息包括颜色、法向量、纹理坐标等。因为图形管道针对速度进行了优化，因此其他数据必须按照与顶点数据相同的顺序组织在数组中。如果每个顶点都有额外的属性，上面的伪代码就变成了这样：

```javascript
for (j = start; j < count; j += 1) {
  call vertex_shader(vertex_buffer[j], color_buffer[j], normal_vector_buffer[j], ...);
}
```

这是 WebGL 渲染的一个重要基本原则。所有数据都必须基于“每个顶点”的基础上进行组织，这是因为管道的工作方式决定的。这意味着在某些情况下，你的数据必须在数组中多次复制才能与顶点数据“匹配”。这对于内存使用来说可能非常低效，但它使渲染速度非常快。为了说明这个原则，假设你想使用特定颜色渲染一个三角形。你必须创建一个数组来存储每个单独顶点的颜色，即使所有三个顶点都具有相同的颜色。下面的代码显示了代表 3 个顶点的 9 个值的数组。如果顶点的颜色来自缓冲区对象中的数组，则颜色必须存储三次才能与顶点数据“匹配”。在下面的示例中，颜色“红色”被存储了 3 次。

```javascript
var triangle_vertices = [0,0,0, 1,6,2, 3,4,1];
var triangle_color    = [1,0,0, 1,0,0, 1,0,0]
```