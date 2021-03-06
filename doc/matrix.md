# WebGL中的矩阵与数学中的矩阵

线性方程：
<br/>
1x + 1y + 1z = r1
<br/>
2x + 2y + 2z = r2
<br/>
3x + 3y + 3z = r3
<br/>

使用矩阵进行表示：
<br/>
![数学矩阵](./pic/f1.png)
<br/>
第一列，第二列，第三列分别对应x, y, z。
<br/>

在WebGL中的矩阵计算，采用的是**pre-multiplying convention**,即：<br/>
![WebGL矩阵](./pic/f2.png)


同时在WebGL中，矩阵都存储在一个一维数组中，在计算时存在一定的运算难度，比如要获取z轴，则需要这样做：<br/>
M[2], M[5], M[8]<br/>

所以在WebGL中，采用如下格式书写矩阵<br/>
1x, 2x, 3x,<br/>
1y, 2y, 3y,<br/>
1z, 2z, 3z,<br/>

在获取某一维度的值时，可以直接使用m.slice(6, 8).<br/>

**所以**,在WebGL中的矩阵与数学中的矩阵行列是不相同的，WebGL矩阵的行对应着数学矩阵中的列。

## 注意
**在阅读Learn WebGL和WebGL Fundamentals两篇文章时，请注意他们各自使用的矩阵模式差异。**

## 参考资料

1. [matrix](http://learnwebgl.brown37.net/transformations2/transformations_matrices.html)


