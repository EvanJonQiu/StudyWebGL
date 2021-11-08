# 理解矩阵变换

矩阵变换公式：

```javascript
projectionMat * translationMat * rotationMat * scaleMat * position
```

从左向右解释：矩阵改变的都是画布的坐标空间， 画布的起始空间是裁剪空间的范围(-1 到 +1)，矩阵从左到右改变着画布所在的空间, 画布的起始空间是裁剪空间的范围(-1 到 +1)，矩阵从左到右改变着画布所在的空间<br/>

1. 没有矩阵（或者单位矩阵），公式中没有单位矩阵，为了便于理解，可以想象成这样：<br/>

```javascript
identityMat * projectionMat * translationMat * rotationMat * scaleMat * position
```

2. 投影矩阵：projectionMat。投影矩阵是将坐标在裁剪空间(各方向单位为 -1 到 +1)和像素空间之间进行转换。
3. 原点被移动到了tx, ty（translationMat），所以空间移动了
4. 旋转空间：rotationMat
5. 进行缩放：scaleMat
6. 在着色器中，将position转换到这个空间中。


## 参考资料
1. [WebGL 二维矩阵](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-2d-matrices.html)

