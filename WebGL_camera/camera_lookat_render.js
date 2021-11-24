var SceneLookatRender = function (gl, program, models) {

  var self = this;

  var render_models = {};

  var matrix = new Learn_webgl_matrix();
  var transform = matrix.create();
  var base = matrix.create();

  // Camera transform and parameters
  var camera_transform = matrix.create();
  var camera_distance = 30;
  var ex = 0;
  var ey = 0;
  var ez = 10;
  self.angle_x = 0.0;
  self.angle_y = 0.0;

  // The scene camera is the camera we are using to get a specific view of
  // the scene. It is used to render the right canvas window.
  var virtual_camera = matrix.create();
  matrix.lookAt(virtual_camera, 0, 0, 5, 0, 0, 0, 0, 1, 0);
  var center_point_translate = matrix.create();
  var center_point_scale = matrix.create();
  matrix.scale(center_point_scale, 0.1, 0.1, 0.1);

  var axes_scale = matrix.create();
  matrix.scale(axes_scale, 2, 2, 2);

  // The demo_camera is the camera we are using in the left window to
  // view everything -- including the scene_camera.
  var camera = matrix.create();

  var projection = matrix.createPerspective(30.0, 1.0, 0.5, 100.0);

  var cube_model_names = ["textz", "texty", "textx", "cubey", "cubex", "cubez", "cube_center"];
  var camera_model_names = ["Camera_lens", "Camera", "Camera_body", "u_axis", "v_axis", "n_axis"];
  var axes_model_names = ["xaxis", "yaxis", "zaxis"];

  self.eyex = 0;
  self.eyey = 0;
  self.eyez = 5;

  self.centerx = 0;
  self.centery = 0;
  self.centerz = 0;

  self.upx = 0;
  self.upy = 1;
  self.upz = 0;

  self.render = function() {
    var j, dist;

    // 计算三坐标轴的位置和方向
    // Calculate and set the camera for the entire rendering
    ex = Math.sin(self.angle_x) * camera_distance;
    ez = Math.cos(self.angle_x) * camera_distance;
    ey = Math.sin(self.angle_y) * camera_distance;
    dist = Math.sqrt( ex*ex + ey*ey + ez*ez);
    ex = (ex / dist) * camera_distance;
    ey = (ey / dist) * camera_distance;
    ez = (ez / dist) * camera_distance;
    matrix.lookAt(camera, ex, ey, ez, 0, 0, 0, 0, 1, 0);

    // Create the base transform which is built upon for all other transforms
    matrix.multiplySeries(base, projection, camera);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render axes
    matrix.multiplySeries(transform, base, axes_scale);

    // Draw each global axes
    for (j = 0; j < axes_model_names.length; j += 1) {
      render_models[axes_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render model
    matrix.copy(transform, base);

    // Draw each model
    for (j = 0; j < cube_model_names.length; j += 1) {
      render_models[cube_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the "center point" of the virtual camera as a small sphere
    // 中心点
    matrix.translate(center_point_translate, self.centerx, self.centery, self.centerz);
    matrix.multiplySeries(transform, base, center_point_translate, center_point_scale);
    render_models.Sphere.render(transform);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render virtual camera
    // Calculate the virtual camera transform
    matrix.lookAt(virtual_camera, self.eyex, self.eyey, self.eyez,
      self.centerx, self.centery, self.centerz,
      self.upx, self.upy, self.upz);
    matrix.copy(camera_transform, virtual_camera);
    matrix.transpose(camera_transform);
    //matrix.print("transposed", camera_transform);
    camera_transform[3] = 0;
    camera_transform[7] = 0;
    camera_transform[11] = 0;
    camera_transform[12] = self.eyex;
    camera_transform[13] = self.eyey;
    camera_transform[14] = self.eyez;
    matrix.print("camera_transform", camera_transform);

    matrix.multiplySeries(transform, base, camera_transform);

    // Draw the camera
    for (j = 0; j < camera_model_names.length; j += 1) {
      render_models[camera_model_names[j]].render(transform);
    }
  };

  // Create Vertex Object Buffers for the models
  var j, name;
  for (j = 0; j < models.number_models; j += 1) {
    name = models[j].name;
    render_models[name] = new Learn_webgl_model_render_05(gl, program, models[name]);
  }

};