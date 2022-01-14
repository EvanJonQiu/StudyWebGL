# 6.1 - Introduction to Transformations

在之前的课程中，你已经学会了如何描述虚拟对象，包括它们的几何和它们的外貌（例如，它们的表面属性）。所有计算机图形学的基础是操纵这些对象并随着时间的推移在场景中创建运动的能力。本章的教程将帮助你了解如何变换对象的形状（shape）、位置（location）和方向（orientation）。这是计算机图形变得非常有趣的地方！

## Basic Transformations

计算机图形学中使用了三种基本变换：
* 平移（移动）- translate
* 缩放（缩小、放大或镜像）- scale
* 旋转（相对于某一个轴）- rotate

我们将接下来的课程中详细讨论每一个转换的细节，但首先让我们讨论一下这些转换是如何相似的。这三个转换保留了模型的基本属性。在应用这些转换中的任何一个或这些转换的任何组合后，以下将是正确的：
* 平行线仍然是平行的。
* 在转换之前形成一条线的点在转换之后仍然形成一条线。
* 保持距离比。变换前线的中点仍然是变换后线的中点。

数学家将具有这些性质的变换称为仿射变换（an affine transformation）。这种变换真正重点是：我们不需要对模型的每个点应用这些变换。如果我们对一个三角形的三个顶点应用这些变换，三角形内部的所有表面点都会被正确的转换。这是巨大的！它使 3D 实时计算机图形成为可能。

所以让我们总结一下，**我们可以通过只操纵它的顶点来变换一个模型!** 这一事实推动了 WebGL 着色器程序的整体结构。一个WebGL着色器程序包含两部分，顶点着色器操作模型定义的顶点，片段着色器为定义的点，线，三角形的每个像素分配颜色。