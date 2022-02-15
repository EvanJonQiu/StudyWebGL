# 7.1 - Introduction to Cameras

我们想要在虚拟场景中移动并从不同的有利位置查看它，就像你使用真实世界中的相机一样。在真实的世界中，场景是保持精致的，而一个人通过移动到各个有利位置来拍照。但是事实证明在虚拟世界中，保持相机静止而是移动相机前的场景，在数学上更有效。并且，事实证明，我们可以非常容易地移动相机前的整个场景。

我们的虚拟相机将位于全局原点并朝向`-Z`轴向下看。Y 轴指向上方，X 轴指向相机的右侧。相机将始终处于此位置和方向。我们对相机的讨论集中在如何在固定相机前获得所需的场景视图。

## Camera Motion vs. Scene Motion

一个人利用前景和背景的关系，无意识地判断自己是在移动还是周围的物体在移动。假设你的眼睛就是相机，并且你正坐在车里旅行。靠近你的物体，例如沿街的建筑物，在你的视野中快速移动，远处的景色也在移动，但是移动的速度更慢。实际上，在你的视觉感知（visual cue）近处的物体和远处的物体都在移动，即相机（也就是你）在移动。如果你停下你的车，并看着其他车辆经过，变化的是背景变得完全静止。前景和背景的运动差异允许你的大脑辨别你是否移动或者静止。基于这个原因，当我们在相机前移动场景时，重要的是场景中的所有内容包括背景都会被移动。

动画是通过随时间改变场景中对象的位置和方向来创建的，或是通过改变正在查看场景的相机的位置和方向，或通过移动对象和相机。如果你保持物体静止并移动相机，则所需的运动与你保持相机静止并移动物体所需的运动相反。例如，考虑一个物体你想将它从相机前的左侧向右侧移动。如果相机处于默认位置并朝向 -Z 轴的方向，对象需要被沿 X 轴进行转换，从 -5 平移到 +5。然而，同样的动作可以通过从右到左移动相机来产生，比如从+5到-5。如果背景中没有任何东西，就不可能知道相机或物体是否在移动，或者两者是否都在移动。因此，请注意物体的运动和相机的运动对于视觉上相同的运动是相反的。因此，当你在场景中移动对象时，你会根据对象的坐标系进行思考。但是当你移动相机时，你需要考虑相机的坐标系。

## A Camera Definition

要定义一个相机，我们需要一个位置和一个方向。我们通常将这个相机的位置称为 `eye` 位置并且我们使用一个全局点（eye_x, eye_y, eye_z）来定义这个位置。相机的方向最好由定义的局部右手坐标系的三个正交轴（orthogonal axes）来定义。为了将这些轴与全局的 x, y, z 坐标轴区分开，我们使用名称 u, v, n (这些名称是任意的，当你搜索网络时，你会发现相机轴的不同表示法。) 如果相机位于原点朝向 -Z 轴，那么 u 将与 x 轴对齐，v 将与 y 轴对齐, n 将与 z 轴对齐。下面的表示法是以上内容的总结，其中符号 - -> 表示“映射到”。

```javascript
u --> x
v --> y
n --> z
```

我们可以使用下面显示的 12 个值来指定相机，它们定义了一个全局点和三个向量。

```javascript
eye = (eye_x, eye_y, eye_z)  // the location of the camera
u = <ux, uy, uz>             // points to the right of the camera
v = <vx, vy, vz>             // points up from the camera
n = <nx, ny, nz>             // points backwards; -n is the center of view
```

这些值必须定义每个相机轴，使其与其他两个轴成 90 度角，并且这些轴构成右手坐标系。在数学上，对于有效的右手相机坐标系，以下条件必须为真。为了简化数学，我们总是将轴存储为单位向量。请记住，叉积（cross product）中向量的顺序很重要。如果你要改变以下向量的顺序，你将不会得到正确的结果。

```javascript
dot_product(u,v) === 0    // cos(90) == 0
dot_product(v,n) === 0    // cos(90) == 0
dot_product(n,u) === 0    // cos(90) == 0
cross_product(u,v) === n
cross_product(v,n) === u
cross_product(n,u) === v
```

## Specifying a Virtual Camera

程序员很难使用指定右手坐标系的三个归一化向量来定义相机方向。因此，我们通常会用更自然的术语来定义相机，让计算机计算相机坐标系。可以使用两个点和一个向量来实现对相机的简单描述，如下所示：

* 指定相机的位置。
  * 这实际上为我们提供了两个值 —— `eye` 位置和形成相机坐标系轴的参考点。
* 指定相机正在查看(looking at)的位置
  * 该值可以是镜头前方沿其视线的任何点。它沿视线的确切位置无关紧要。该点定义了 -n 轴的方向。由于我们将坐标系轴归一化为单位长度，所以这个向量的方向是我们唯一关心的事情。
  * 作为程序员，你有责任确保该点和 `eye` 位置形成一个向量。如果两个点在同一位置，-n 轴将不是有效向量，lookAt() 函数将无法创建有效的相机坐标系。
* 指定相机 “up” 的大致方向
  * 这个向量不必是精确的。典型值为<0,1,0>，指向 Y 轴方向。
  * 这个向量的叉积(cross product)和视线向量的负值将产生相机坐标系的 u 轴。
  * 如果 “up” 向量正好沿着相机的视线，叉积计算将失败，相机坐标系将无效。作为程序员，你有责任确保视线矢量和“向上矢量”（up vector）不指向同一方向。
  * 相机坐标系的最后一个轴 v，它直接指向相机的 “up” ，它是通过取 u 和 n 向量的叉积来计算的。

基于这些想法，Javascript `Learn_webgl_matrix` 类包含以下函数：

```javascript
/** -----------------------------------------------------------------
 * Set a camera matrix.
 * @param M Float32Array The matrix to contain the camera transformation.
 * @param eye_x Number The x component of the eye point.
 * @param eye_y Number The y component of the eye point.
 * @param eye_z Number The z component of the eye point.
 * @param center_x Number The x component of a point being looked at.
 * @param center_y Number The y component of a point being looked at.
 * @param center_z Number The z component of a point being looked at.
 * @param up_dx Number The x component of a vector in the up direction.
 * @param up_dy Number The y component of a vector in the up direction.
 * @param up_dz Number The z component of a vector in the up direction.
 */
self.lookAt = function (M, eye_x, eye_y, eye_z, center_x, center_y, center_z, up_dx, up_dy, up_dz) {
```

以下演示允许你更改这些参数并立即查看结果。对参数进行试验，直到你对它们如何更改相机视图感到满意为止。

[演示示例](http://learnwebgl.brown37.net/07_cameras/camera_introduction.html)

## Camera Errors

无效的相机定义将产生不可预测的渲染输出。我们已经讨论了会在相机中产生错误的条件，但是在代码中包含测试以避免这些潜在错误非常重要。如果出现以下情况，使用 lookat() 函数计算的相机将无效：

* “eye” 和 “center” 点是同一位置。
* “up vector”与视线方向相同（它们是 “eye” 和 “center” 两点之间的向量）。对于这种情况，“同向”(same direction) 包括正向和负向。从数学上讲，如果“up vector”和视线向量之间的角度的正弦为零（如果向量之间的角度为 0 或 180 度，则会发生这种情况），相机定义将失败。