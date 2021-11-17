/**
 * reference: http://learnwebgl.brown37.net/lib/learn_webgl_matrix.js
 */

var webgl_matrix = function () {
  var self = this;

  self.create = function () {
    return new Float32Array(16);
  };

  /**
   * 三维需要使用4 * 4矩阵来表示
   * @returns Float32Array
   */
  self.create = function() {
    return new Float32Array(16);
  };

  self.toRadians = function (angleInDegrees) {
    return angleInDegrees * Math.PI / 180;
  };

  self.toDegrees = function (angleInRadians) {
    return angleInRadians * 180 / Math.PI;
  };

  // x轴旋转
  self.xRotation = function (M, angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    M[0] = 1; M[4] = 0; M[8] =  0; M[12] = 0;
    M[1] = 0; M[5] = c; M[9] = -s; M[13] = 0;
    M[2] = 0; M[6] = s; M[10] = c; M[14] = 0;
    M[3] = 0; M[7] = 0; M[11] = 0; M[15] = 1;
  };

  // y轴旋转
  self.yRotation = function (M, angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    M[0] =  c; M[4] = 0; M[8] =  s; M[12] = 0;
    M[1] =  0; M[5] = 1; M[9] =  0; M[13] = 0;
    M[2] = -s; M[6] = 0; M[10] = c; M[14] = 0;
    M[3] =  0; M[7] = 0; M[11] = 0; M[15] = 1;
  };

  // z轴旋转
  self.zRotation = function (M, angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    M[0] =  c; M[4] = -s; M[8] =  0; M[12] = 0;
    M[1] =  s; M[5] =  c; M[9] =  0; M[13] = 0;
    M[2] =  0; M[6] =  0; M[10] = 1; M[14] = 0;
    M[3] =  0; M[7] =  0; M[11] = 0; M[15] = 1;
  };

  // 叉乘
  self.multiply = function (r, a, b) {

    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    r[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
    r[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    r[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
    r[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
    r[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
    r[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    r[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
    r[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
    r[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
    r[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    r[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
    r[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
    r[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
    r[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    r[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
    r[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
  };

  self.multiplySeries = function () {
    if (arguments.length >= 3) {
      self.multiply(arguments[0], arguments[1], arguments[2]);
      var j;
      for (j = 3; j < arguments.length; j += 1) {
        self.multiply(arguments[0], arguments[0], arguments[j]);
      }
    }
  };

  // 单位矩阵
  self.setIdentity = function (M) {
    M[0] =  1; M[4] =  0; M[8] =  0; M[12] = 0;
    M[1] =  0; M[5] =  1; M[9] =  0; M[13] = 0;
    M[2] =  0; M[6] =  0; M[10] = 1; M[14] = 0;
    M[3] =  0; M[7] =  0; M[11] = 0; M[15] = 1;
  };

  // 创建投影矩阵
  self.createOrthographic = function (left, right, bottom, top, near, far) {
    var M = this.create();

    var widthRatio  = 1.0 / (right - left);
    var heightRatio = 1.0 / (top - bottom);
    var depthRatio  = 1.0 / (far - near);

    var sx = 2 * widthRatio;
    var sy = 2 * heightRatio;
    var sz = -2 * depthRatio;

    var tx = -(right + left) * widthRatio;
    var ty = -(top + bottom) * heightRatio;
    var tz = -(far + near) * depthRatio;

    M[0] = sx;  M[4] = 0;   M[8] = 0;   M[12] = tx;
    M[1] = 0;   M[5] = sy;  M[9] = 0;   M[13] = ty;
    M[2] = 0;   M[6] = 0;   M[10] = sz; M[14] = tz;
    M[3] = 0;   M[7] = 0;   M[11] = 0;  M[15] = 1;

    return M;
  };
};