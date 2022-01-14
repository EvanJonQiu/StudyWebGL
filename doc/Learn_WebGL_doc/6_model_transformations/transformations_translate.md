# 6.3 - Translating

平移模型会改变模型的位置。平移不会改变模型的大小和方向。在数学上，平移是一个简单的加法。将以一个顶点 （x, y, z）平移到一个新位置（x', y', z'）是通过向每个分量加一个值完成的。让我们把这些值称为 tx, ty, tz。在方程式格式中，转换是这样执行的：

```javascript
x' = x + tx;
y' = y + ty;
z' = z + tz;
```

请注意，按 0 平移会使组件值保持不变。顶点通常以一个单位进行操作，如果你想沿着某一轴平移，而保持其他轴不变，对未改变的轴使用0。

## Special Cases and Effectss

平移没有“特殊情况”。尝试以下示例。

[请参考原文](http://learnwebgl.brown37.net/transformations2/transformations_translate.html)

要否定（或撤消）平移操作，只需使用负的（-tx、-ty、-tz）平移值进行平移。例如，你使用 (2, -3, 1)来平移模型，使用(-2, 3, -1)来恢复模型。