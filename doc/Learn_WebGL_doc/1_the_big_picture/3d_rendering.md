# 1.2 - 3D Computer Graphics - What and How

计算机图形是使用计算机创建的图片和视频。

使用计算机描述图片有两种基本的方法：
* 光栅图形(Raster graphics) - 使用很多小的颜色点来描述图片。每一个点称为像素(pixel),它是图片元素的缩写。如果这些点足够小并且挨的足够近，人是看不到这些点的，而是看到一张图片。
* 矢量图形(Vector graphics) - 使用数学方程将对象描述成几何图形。图片是由这些数学描述创建的，这些过程被称为渲染过程。渲染的结果是二维光栅图像。

## The Graphics Pipeline

[将矢量图形表示的对象转换成光栅图像的过程，包含如下步骤: ](http://learnwebgl.brown37.net/the_big_picture/3d_rendering.html#the-graphics-pipeline)