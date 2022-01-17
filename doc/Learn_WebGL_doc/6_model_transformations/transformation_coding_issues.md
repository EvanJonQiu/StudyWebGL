# 6.12 - Coding Issues

我们已经讨论了渲染和转换的理论，并且你已经研究了几个演示程序。但是如何创建自己的独立 WebGL 程序呢？建议你从一个工作程序开始并对其进行修改以满足你的需要。本课解释了你一直在试验的演示程序的软件模块。

## The HTML Code:

WebGL 程序需要来自服务器的大量数据文件。服务器异步响应文件下载请求，这意味着文件将在第一个可用的机会下载，但不需要按照你请求的顺序。因此，首要任务是下载你需要的所有文件。

JavaScript 文件 `learn_webgl_02.js` 包含一个名为 `Learn_webgl` 的类。此类的对象可以下载的所有文件。在 HTML 文件的底部，但在 body 元素内，包含一个 `<script>` 元素，如下例所示：

```javascript
<script>
  var models = ["../../lib/models/RobotBase.obj",
                "../../lib/models/Forearm.obj",
                "../../lib/models/Upperarm.obj"];
  var shaders = ["../../lib/shaders/shader05.vert", "../../lib/shaders/shader05.frag"];
  var controls = ["W1_forearm_angle", "W1_upperarm_angle", "W1_pause"];
  var my_program = new Learn_webgl("W1_canvas", "SceneRender", models, shaders, controls);
</script>
```

此 JavaScript 代码创建要下载的模型文件列表、要下载的着色器程序列表以及 HTML 控制元素 ID 列表。然后它创建一个 `Learn_webgl` 类的实例并向其发送以下参数：
* 要渲染到的画布的 ID。
* “渲染”类的名称。 （这个类知道如何为 WebGL 渲染初始化画布，以及如何在画布中渲染场景。）
* 模型文件名列表。
* 着色器程序文件名列表。
* HTML 输入控件元素 ID 名称的列表。

`Learn_webgl` 对象将从服务器下载所有文件，将每个 .obj 模型转换为 `ModelArrays` 对象，并创建场景渲染类的实例。请记住，网页是事件驱动的。除非用户事件或计时器事件“触发”，否则页面上不会发生任何事情。

你的 HTML 文件必须下载您的程序所需的 JavaScript 代码。使用一系列 <script> 元素，如下所示：

```javascript
<script src="../../lib/learn_webgl_02.js"></script>
<script src="../../lib/learn_webgl_console_messages.js"></script>
<script src="../../lib/learn_webgl_point4.js"></script>
<script src="../../lib/learn_webgl_vector3.js"></script>
<script src="../../lib/learn_webgl_matrix.js"></script>
<script src="../../lib/learn_webgl_obj_to_arrays.js"></script>
<script src="../../lib/learn_webgl_model_render_05.js"></script>
```

最后一件事。演示代码使用 jQuery 使 JavaScript 代码跨平台，使其适用于所有主要浏览器。你需要下载 jQuery.js 并使用 `<script>` 标签包含 jQuery 库，例如：

```javascript
<script src="../lib/jquery.js"></script>
```

将此元素放在 HTML 代码的 <head> 元素中。这保证了它会在你执行任何其他 JavaScript 代码之前被下载。

对于上面的所有 `<script>` 示例，请根据你存储 JavaScript 代码文件相对于 HTML 文件的位置来修改文件的路径。

## SceneRender JavaScript Class

你需要一个可以渲染场景的类。从这个类开始，`simple_transform_example_render4.js` 并根据需要对其进行修改。

## SceneEvents JavaScript Class

你需要一个处理事件的类。从这个类开始，`simple_transform_example_events4.js` 并根据需要对其进行修改。

## Shader programs

你至少需要一个顶点着色器和一个片段着色器程序来进行渲染。 `shader05.vert` 和 `shader05.frag` 是合理的起点。

## Getting Code from the learnwebgl.brown37.net server

你可以通过以下两种方式之一从课程教科书服务器下载任何代码：
* 使用任何演示上的“下载”按钮。
* 打开一个包含你要保存的演示代码的页面。打开“开发者工具”并选择“源”选项卡。展开文件夹列表以找到所需的文件。右键单击文件图标并选择“另存为...”。注意：如果你在单独的浏览器选项卡或窗口中打开演示程序，你将拥有更少（更清晰）的文件选择。