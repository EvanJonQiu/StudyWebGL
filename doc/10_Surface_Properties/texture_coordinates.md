# Texture Mapping - Texture Coordinates

纹理贴图最大的挑战是将纹理坐标分配给模型的顶点。Blender有丰富的工具来做这个事情。事实上，它包含的工具和技术比我们在一堂课中可能涵盖的要多。我们将讨论基础知识，您可以自行探索更高级的技术。

纹理贴图的典型目标是以不明显的方式将图像包裹在对向上，这个方式需要将图像覆盖整个模型和模型各个三角形上。但是也存在其他可能的场景。你可以为单个面或者一组面添加纹理。所以，要记住使用不同的纹理贴图渲染单个面通常需要你为分别渲染每个面，这将大大降低渲染速度。

## 纹理贴图基本原语（Texture Mapping Basic Primitives）

Blender 已经内置了适用于所有基本网格图元的纹理映射功能。因此，如果你想将图像包裹在三角形网格周围，那么过程是
* 选择一个模型
* 进入“edit mode"。（Tab key)
* 按住"a"键知道所有的面被选择
* 在属性面板中选择“Materials"面板
* 创建一个新的材质并且起一个适当的名字
* 将它“Assign”给模型的表面（当你做这步时，所有的面都应该被选中）
* 在材质仍旧是“active material"，选择纹理属性面板
* 创建一个新的贴图并起一个适当的名字
* 在“Type”下拉列表中选择“Image or Movie"
* 在"Image"部分，选择"Open"， 进入到文件浏览器，找到你想要使用的图片，并选择它。始终将纹理贴图文件保存在与使用它们的模型所在的文件夹中。这允许 Blender 找到没有文件路径的文件。
* 在"Mapping"部分：
  * For the “Coordinates:” drop-down menu select the “Generated” option. This means Blender will automatically generate the texture coordinates.
  * For the “Projection:” drop-down menu select the type of primitive you are texture mapping (e.g., flat, cube, tube, or sphere).
    * flat: The entire image is used for the quad(s) or triangle(s). If the aspect ratio of the image is different than the aspect ratio of the 3D surface, then the image will be distorted.
    > 平坦： 整个图像用于四边形或三角形。如果图像的纵横比与 3D 表面的纵横比不同，则图像会失真。
    * cube: The entire image is used for each of the 6 sides of the cube.
    > 立方体：整个图像用于立方体的 6 个边中的每一个。
    * tube: The entire image is wrapped around the model (assuming it is a torus).
    > 管：整个图像环绕模型（假设它是一个环面）。
    * sphere: The entire image is wrapped around the model (assuming it is a sphere).
    > 球体：整个图像环绕模型（假设它是一个球体）。
  * Note that in the case of “flat” and “cube” generated texture coordinates, the image is reused for each “side”, while the “tube” and “sphere” generated texture coordinates use a single copy of the image and wrap it around the entire model.
    > 请注意，在“平面”和“立方体”生成纹理坐标的情况下，每个“边”都会重复使用图像，而“管”和“球体”生成的纹理坐标使用图像的单个副本并将其环绕整个模型。

你可以通过在 Blender 中渲染模型或通过导出 OBJ 文件并查找以“vt”（顶点纹理坐标）开头的行来验证模型是否具有纹理坐标。

## UV Texture Mapping

在很多情况下，与上述“生成“的值相比，你需要更多的控制纹理坐标的分配。这时候就要使用“UV texture mapping"工具来完成。

> UV texture mapping
> OpenGL 和 WebGL 使用字母 s 和 t 描述纹理贴图的轴，但在“过去”，这些轴被称为 u 和 v*。术语“UV 纹理映射”是“旧时代”的“保留”。

基本思想是你使用一个 3D 模型并选择那些可以将模型“切割”并展开到到一个平面上的边缘。然后将展开的面放在纹理贴图图像的顶部并根据需要排列它们。这使您可以完全控制每个顶点的纹理坐标。

执行 UV 纹理贴图的步骤与上述描述的步骤相同，如下：
* 选择一个模型
* 进入“edit mode"。（Tab key)
* 按住"a"键知道所有的面被选择
* 在属性面板中选择“Materials"面板
* 创建一个新的材质并且起一个适当的名字
* 将它“Assign”给模型的表面（当你做这步时，所有的面都应该被选中）
* 在材质仍旧是“active material"，选择纹理属性面板
* 在“Type”下拉列表中选择“Image or Movie"
* 在"Image"部分，选择"Open"， 进入到文件浏览器，找到你想要使用的图片，并选择它。
* 在“Mapping"部分，在“Coordinates:"下拉菜单中选择"UV"选项。这表示你将把贴图坐标设置为“UV/Image editor”

你现在已经为每个顶点分配了纹理坐标，但不是您可能想要的纹理坐标。你需要变换模型的面，使它们位于纹理图像的正确部分上。可以按照下面的步骤来做：
* 将窗口面板配置更改为“UV editing”模式。这将允许你同时查看 3D 模型和“UV/Image Editor”。
* 在"Browse Image to be linked"下拉菜单中选择纹理贴图图像。这将使图像在“UV/Image Editor”中显示。
* 同样在“UV/Image Editor”的菜单选项中，启用“Keep UV and edit mode mesh selection in sync”选项。这允许你在“3D View”或“UV/Image Editor”窗口中选择顶点、边或面，并且将在另一个窗口中选择相应的元素。
* 在“3D View”窗口中更改先显示模式成"texture"。这使你可以在模型表面上查看纹理图像。

现在你可以准备编辑贴图坐标。如下：
* 在编辑模式下的“3D View”窗口中，更改为“edge selection”模式.
* 选择可以“cut”的边缘将模型展开到平面上。
* 调出边缘菜单（CRTL-E）并选择“Mark seams”。
* 将光标置于“3D view”窗口并选中所有面后，按“u”键。在弹出菜单中选择“unwrap”命令。这会在你选择的接缝处“切割”模型面，并将模型的面放在纹理图像上。如果你没有看到在“UV/Image Editor”中显示的面，最可能的原因是不能使用你为解封选择的边缘将模型进行展开。请注意，“UV/Image Editor”中的某些面可能位于彼此的顶部。当多个面使用纹理图像的同一部分时会发生这种情况。
* 使用普通编辑命令，例如“g”代表抓取、“s”代表缩放、“r”代表旋转、“b”代表框选择等，将面顶点移动到纹理图像的所需部分。如果你扭曲任何三角形（或四边形）的形状，生成的纹理贴图也会扭曲。

如果你不喜欢您的任何决定，你始终可以通过选择模型的所有边、清除边接缝（CRTL-E、“清除接缝”）、选择要切割的新边以“展开”模型来重新启动该过程。然后再次“解开”模型。

## Texture Mapping Data

纹理映射所需的数据存储在 OBJ 和 MTL 模型文件中。下面的示例显示的是立方体的数据。纹理坐标位于以“vt”开头的行上。这些值隐式地定义了一个从 1 开始索引的纹理坐标数组。在稍后定义面的文件中，每个顶点都具有自定义顶点的几何坐标 (x,y,z) 和自定义纹理坐标的 (s,t) 值。语法 5/2 定义了使用第 5 个 (x,y,z) 值和第 2 个 (s,t) 值的顶点。请注意，单个几何和纹理坐标用于多个面。

```javascript
# Blender v2.73 (sub 0) OBJ File: 'textured_cube_faces.blend'
# www.blender.org
mtllib textured_cube_faces.mtl
o Cube
v 1.000000 -1.000000 -1.000000
v 1.000000 -1.000000 1.000000
v -1.000000 -1.000000 1.000000
v -1.000000 -1.000000 -1.000000
v 1.000000 1.000000 -0.999999
v 0.999999 1.000000 1.000001
v -1.000000 1.000000 1.000000
v -1.000000 1.000000 -1.000000
vt 0.000000 0.000000
vt 1.000000 0.000000
vt 1.000000 1.000000
vt 0.000000 1.000000
usemtl Material
s off
f 1/1 2/2 3/3 4/4
f 5/1 8/2 7/3 6/4
f 1/1 5/2 6/3 2/4
f 2/1 6/2 7/3 3/4
f 3/1 7/2 8/3 4/4
f 5/1 1/2 4/3 8/4
```
“material definition”文件：MTL，将纹理贴图的文件名存储在材质的 map_Kd 属性中。下面是一个示例 MTL 文件：

```javascript
# Blender MTL File: 'textured_cube.blend'
# Material Count: 1

newmtl cube_material
Ns 96.078431
Ka 1.000000 1.000000 1.000000
Kd 0.640000 0.640000 0.640000
Ks 0.500000 0.500000 0.500000
Ke 0.000000 0.000000 0.000000
Ni 1.000000
d 1.000000
illum 2
map_Kd texture1.png
```

## Other Ways to Create/Calculate Texture Coordinates

纹理坐标制定了可以检索一个颜色的位置。对于基于图像的纹理映射，位置是 2D 图像中的一个位置。对于基于程序的纹理映射（你将在下一课中学习），纹理坐标的指定的位置是通过一个计算模式获得的。可以使用模型的几何 (x,y,z) 顶点作为纹理坐标。考虑以下场景：
* 在 (0,0,0) 到 (1,1,1) 范围内的单位立方体内定义模型。（模型总是可以缩放到渲染所需的任何大小。）对于每个顶点 (x,y,z)，使用 (x,y) 值作为您的 (s,t) 纹理坐标。请注意，如果 x 或 y 在表面上没有发生变化，那么操作不起作用。
* 在 (0,0,0) 到 (1,1,1) 范围内的单位立方体内定义模型。对于每个顶点 (x,y,z)，根据顶点法向量的方向，使用 (x,y)、(x,z) 或 (y,z) 作为 (s,t) 纹理坐标。例如，如果法向量指向 Z 或 -Z 方向，则使用 (x,y)，如果法向量指向 X 或 -X 方向，则使用 (y,z)，或者如果法向量指向指向 Y 或 -Y 方向，使用 (x,z)。（或者你可以区分并使用 (x,z) 表示 +Y 和 (z,x) 表示 -Y。）
* 使用任何合适的单位定义你的模型，但在将它们用于 (s,t) 坐标之前，在你的片段着色器中将顶点缩放到范围 (0.0, 1.0)。根据你定义模型的方式，您可能必须将模型几何的最小和最大限制传递给片段着色器。

