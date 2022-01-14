# 3.5 - Material Properties

三维建模是要捕捉一个对象的形式，但是我们还希望对对象的表面属性进行建模。表面属性包含但不仅限于：
* 物体的表面是什么颜色的？是纯色的还是多颜色的？
* 对象表面如何反光？是亮色还是暗色？
* 对象表面是光滑、粗糙还是凹凸不平？
* 表面是平的还是弯曲的？
* 表面是否是透明的用以让一些光线穿过它？如果是，光线是否会折射（改变其传播方向）？

所有的这些表面属性基本上就是一个问题：光线如何从物体表面反射到你的眼睛里（或相机的镜头）中。如果场景中没有光线，你不能看到任何东西。而且光线的特性也不是统一的。例如，一个迪斯科舞厅可能有红色频闪灯，而厨房的炉子上方可能有明亮的筒灯。这两种不同的光源将以非常不同的方式与物体的表面特性相互作用。所以我们也需要对光源进行建模！

实际上，我们需要建模的是物体的表面属性与光源属性间的相互作用。由于现实世界的场景几乎总是有多个光源，这一点很复杂。模型的外观是来自光源的反射光和从其他物体反射的光的组合。这是一个非常困难的问题，我们通常只是尝试使用简化的假设来近似估计会发生什么。

本教程将介绍我们用来模拟表面和光相互作用的基本假设。我们将涵盖颜色问题和光线反射问题。