# 三维世界中的相机

现实世界中，物体一般都是固定的，人们通过移动相机来变换场景，但是在虚拟的三维世界中，将相机位置固定，通过移动相机前的三维场景来变换场景（这样做更有效）。<br>
我们将虚拟相机放置到坐标原点，面向-z轴，y轴指向相机的上方，x轴指向相机的右侧。

移动相机而保持物体不动，与移动物体而保持相机不动是两个相反的移动。

当移动场景中的物体，你需要考虑的是物体坐标系统；如果是移动相机，则你需要考虑的是相机的坐标系统。

## [相机定义](http://learnwebgl.brown37.net/07_cameras/camera_introduction.html)
To define a camera we need a position and an orientation. We typically call the position of the camera the “eye” position and we define its location using a global point (eye_x, eye_y, eye_z). The orientation of a camera is best defined by three orthogonal axes that define a local, right-handed coordinate system. To keep these axes separate from the global x, y and z coordinate axes, let’s use the names u, v, and n. (The names are arbitrary and you will find different notations for the camera axes as you search the web.) If a camera is located at the origin looking down the -Z axis, then u would align with the x axis, v would align with the y axis, and n would align with the z axis. This is summarized in the following notation, where the symbol - -> means “maps to”.

```
u --> x
v --> y
n --> z
```

We can specify a camera using the 12 values shown below, which define one global point and three vectors.

```
eye = (eye_x, eye_y, eye_z)  // the location of the camera
u = <ux, uy, uz>             // points to the right of the camera
v = <vx, vy, vz>             // points up from the camera
n = <nx, ny, nz>             // points backwards; -n is the center of view
```

The values must define each camera axis such that it has a 90-degree angle to the other two axes and the axes form a right-handed coordinate system. Mathematically, the following must be true for a valid, right-handed camera coordinate system. To simplify the math, we always store the axes as unit vectors. Remember that the order of vectors in a cross product matters. If you were to switch the order of the vectors below, you would not get the correct results.

```
dot_product(u,v) === 0    // cos(90) == 0
dot_product(v,n) === 0    // cos(90) == 0
dot_product(n,u) === 0    // cos(90) == 0
cross_product(u,v) === n
cross_product(v,n) === u
cross_product(n,u) === v
```

## 指定虚拟相机

程序员很难使用三个指定右手坐标系的归一化向量来定义相机方向。通常以更自然的方式定义相机，并让计算机计算相机坐标系。

两个点和一个向量：
1. 相机位置
  * 相机的位置和参考点来构成相机的参考系统
2. 相机朝向
  * 沿相机视线在相机前任意的一个点，该点定义了-n轴的方向。
  * 程序员要确保这个点与相机坐标能构成一个向量。如果两个点位置相同，则-n轴就不是一个有效值并且lookAt()函数将产生一个无效的相机坐标系统。
3. 相机向上的方向
  * This vector does not have to be precise. The typical value is <0,1,0>, which is pointing in the Y axis direction.
  * The cross product of this vector and the negation of the line-of-sight vector will produce the u axis of the camera’s coordinate system.
  * If the “up” vector is exactly along the camera’s line of sight, the cross product calculation will fail and the camera coordinate system will not be valid. It is your responsibility as the programmer to make sure the line-of-sight vector and the “up vector” do not point in the same direction.
  * The last axis of the camera’s coordinate system, v, which points directly “up” from the camera is calculated by taking the cross product of the u and n vectors.

```
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
  // Local coordinate system for the camera:
  //   u maps to the x-axis
  //   v maps to the y-axis
  //   n maps to the z-axis

  V.set(center, center_x, center_y, center_z);
  V.set(eye, eye_x, eye_y, eye_z);
  V.set(up, up_dx, up_dy, up_dz);

  V.subtract(n, eye, center);  // n = eye - center
  V.normalize(n);

  V.crossProduct(u, up, n);
  V.normalize(u);

  V.crossProduct(v, n, u);
  V.normalize(v);

  var tx = - V.dotProduct(u,eye);
  var ty = - V.dotProduct(v,eye);
  var tz = - V.dotProduct(n,eye);

  // Set the camera matrix
  M[0] = u[0];  M[4] = u[1];  M[8]  = u[2];  M[12] = tx;
  M[1] = v[0];  M[5] = v[1];  M[9]  = v[2];  M[13] = ty;
  M[2] = n[0];  M[6] = n[1];  M[10] = n[2];  M[14] = tz;
  M[3] = 0;     M[7] = 0;     M[11] = 0;     M[15] = 1;
}
```

### 相机向量的计算

函数输入的参数为：相机的位置(eye)，相机的朝向(center)，相机向上的方向(up)。

* z轴向量(n)<br>
相机的n向量 = 相机的位置(eye) - 相机的朝向(center)

* x轴向量(u)<br>
相机的u向量 = 相机向上的方向(up) x 相机的n向量(n)

* y轴向量(v)<br>
相机的v向量 = 相机向上的方向(n) x 相机的u向量(u)

### 移动相机到默认的位置和方向

分为两步:<br>
1. 将相机移动到原点
2. rotate the camera to align the camera’s local coordinate system axes with the global axes

```
[rotateToAlign] * [translateToOrigin] * | x |
                                        | y |
                                        | z |
                                        | w |

translateToOrigin = | 1 0 0 -eye_x |
                    | 0 1 0 -eye_y |
                    | 0 0 1 -eye_z |
                    | 0 0 0    1   |

rotateToAlign = | ux uy uz 0 |
                | vx vy vz 0 |
                | nx ny nz 0 |
                | 0  0  0  1 |
```

### 推导旋转变换(rotateToAlign)

```
| f1 f2 f3 0 |   | ux |    | 1 |
| f4 f5 f6 0 | * | uy | =  | 0 |
| f7 f8 f9 0 |   | uz |    | 0 |
| 0  0  0  1 |   | 0  |    | 0 |

| f1 f2 f3 0 |   | vx |    | 0 |
| f4 f5 f6 0 | * | vy | =  | 1 |
| f7 f8 f9 0 |   | vz |    | 0 |
| 0  0  0  1 |   | 0  |    | 0 |

| f1 f2 f3 0 |   | nx |    | 0 |
| f4 f5 f6 0 | * | ny | =  | 0 |
| f7 f8 f9 0 |   | nz |    | 1 |
| 0  0  0  1 |   | 0  |    | 0 |
```

整合后

```
| f1 f2 f3 0 |   | ux vx nx 0 |    | 1 0 0 0 |
| f4 f5 f6 0 | * | uy vy ny 0 | =  | 0 1 0 0 |
| f7 f8 f9 0 |   | uz vz nz 0 |    | 0 0 1 0 |
| 0  0  0  1 |   | 0  0  0  1 |    | 0 0 0 1 |

```

两边同时乘以逆矩阵(正交矩阵的逆矩阵就是它的转置矩阵)

```
| f1 f2 f3 0 |   | ux vx nx 0 |                               | 1 0 0 0 |
| f4 f5 f6 0 | * | uy vy ny 0 | * | the inverse of u v n | =  | 0 1 0 0 | * | the inverse of u v n |
| f7 f8 f9 0 |   | uz vz nz 0 |                               | 0 0 1 0 |
| 0  0  0  1 |   | 0  0  0  1 |                               | 0 0 0 1 |

| f1 f2 f3 0 |   | ux uy uz 0 |
| f4 f5 f6 0 | = | vx vy vz 0 |
| f7 f8 f9 0 |   | nx ny nz 0 |
| 0  0  0  1 |   | 0  0  0  1 |
```