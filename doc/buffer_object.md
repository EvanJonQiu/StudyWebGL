# WebGL中的缓冲区(Buffer Objects)

## 创建缓冲区并将数据加载到缓冲区中

```javascript

// 创建缓冲区
var buffer_id = gl.createBuffer();

// 激活缓冲区
gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

// 加载数据
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

```

需要说明的是，在每次使用缓冲区前，需要使用`gl.bindBuffer()`先激活缓冲区，例如,在绘制三维对象前，要将缓冲区与着色器变量进行绑定<br/>

```javascript
// 颜色变量
var colorLocation = gl.getAttribLocation(program, "a_Color");

  ...

gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(colorLocation);
```

**所以，在每次需要对缓冲区进行操作时，需要使用`gl.bindBuffer()`函数获取到缓冲区对象，然后再进行操作。**