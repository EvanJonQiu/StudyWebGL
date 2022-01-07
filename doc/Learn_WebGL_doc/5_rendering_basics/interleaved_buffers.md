# 5.9 - Interleaved Buffers

当你玩电子游戏时，当您进入新关卡或新场景时游戏会暂停，并且屏幕通常会空白几秒钟。此时电子游戏发生了什么？也许你可以根据之前的课程进行猜测？

GPU的内存是有限的。当你玩电子游戏并切换到一个新的场景时，游戏必须删除当前所有的缓冲区对象，创建新的缓冲区对象并且将渲染新场景所需要的模型数据上传到缓冲区对象中。现在你知道了！

## Managing Buffer Objects

将模型数据上传到缓冲区对象时，有两种方式：
* 像之前的课程那样，为每类数据分别创建缓冲区对象。每一个顶点着色器的属性变量会被连接到唯一的缓冲区对象上。
* 为模型的所有数据创建单个的缓冲区对象并插入数据。

你已经看到了第一种方法的几个示例。对于只有几个模型的简单场景，这种方法可以满足。当你要创建有100个模型的复杂场景，交错数据（interleaved data）的方法会更好。

交错数据将所有的模型放到一个一维数组中并且上传到一个单一的缓冲区对象中。当你将顶点着色器中的属性变量连接到一个缓冲区对象上，你必须告诉WebGL，如何为这些变量获取特定的数据。这是使用 `gl.vertexAttribPointer` 函数的参数完成的。

```javascript
gl.vertexAttribPointer(uint index, int size, enum type, bool normalized, long stride, long offset);
```

这些参数的含义如下：
* `index` : 要连接的属性变量的位置
* `size` : 属性值中的组件个数；1， 2， 3，4
* `type` : 每个组件值的数据类型；例如，`gl.FLOAT`。
* `normalized` : 如果为真，整数值被标准化(normalized)为 -1.0 到 + 1.0；对于 WebGL，始终为 false。
* `stride` : 一个属性值的开始到下一个属性值之间的字节数。
* `offset` : 获得第一个值要跳过的字节数。

一个例子应该让事情变得清楚。模型中每个顶点都有一个(x, y, z)值, 一个RGB颜色值和一个(s,t)纹理坐标值。每个顶点的这 8 个值将按顺序存储在一个一维数组中。数据如下所示：

```javascript
[x1,y1,z1, r1,g1,b1, s1,t1, x2,y2,z2, r2,g2,b2, s2,t2, x3,y3,z3, r3,g3,b3, s3,t3,...]
```

假设你的顶点着色器具有以下三个需要链接到单个缓冲区对象的属性变量。

```javascript
attribute vec3 a_vertex;
attribute vec3 a_color;
attribute vec2 a_texture;
```

你需要使缓冲区对象处于活动状态，然后像这样调用 `gl.vertexAttribPointer` 函数三次：

```javascript
var buffer_data = new Float32Array(size);
bytes_per_float = buffer_data[0].BYTES_PER_ELEMENT;

gl.bindBuffer(gl.ARRAY_BUFFER, buffer_object_id);

gl.vertexAttribPointer(vertex_location,  3, gl.FLOAT, false, bytes_per_float*8, 0);
gl.vertexAttribPointer(color_location,   3, gl.FLOAT, false, bytes_per_float*8, bytes_per_float*3);
gl.vertexAttribPointer(texture_location, 2, gl.FLOAT, false, bytes_per_float*8, bytes_per_float*6);
```

## Glossary

### interleaved data

将模型的所有属性值存储在单个一维数组中。WebGL 图形管道可以访问正确的值，前提是它知道第一个值从哪里开始，以及从一个属性值的开始到下一个属性值的开始有多少字节。