---
title: Spatial Transform Network
published: true
tags:
  - Computer Vision
  - Deep Learning
---

<div class="card mb-3">
    <img class="card-img-top" src="{{ site.baseurl }}/assets/img/2020-06-20-spatial-transform-network/stn.png"/>
    <div class="card-body bg-light">
        <div class="card-text">
            Spatial Transform Network
        </div>
    </div>
</div>

Spatial transformer networks are a generalization of differentiable attention to any spatial transformation. Spatial transformer networks (STN for short) allow a neural network to learn how to perform **spatial transformations** (such as rotation, scaling) on the input image in order to enhance the geometric invariance of the model. It can be a useful mechanism because CNNs are not invariant to rotation and scale and more general affine transformations.

<!--more-->

### Localisation Network

The architecture of a spatial transformer module. The input feature map $$ U \in \mathbb{R}^{H \times W \times C} $$ is passed to a localisation network $$ f_{\text{loc}} $$ which regresses the transformation parameters $$ \theta $$, the parameters of the transformation $$  \mathcal{T}_{\theta} $$ to be applied to the feature map: $$ \theta = f_{\text{loc}}(U) $$. The localisation network function $$ f_{\text{loc}}() $$ can take any form, such as a fully-connected network or a convolutional network, but should include a final regression layer to produce the transformation parameters $$ \theta $$.

### Parameterised Sampling Grid

To perform a warping of the input feature map, each output pixel (value) is computed by applying a sampling kernel centered at a particular location in the input feature map. In general, the output pixels are defined to lie on a regular grid $$ G = \{G_{i}\} $$ of pixels $$ G_{i} = (x^{t}_{i}, y^{t}_{i}) $$ -- $$ t $$ indicates as _target_, forming an output feature map $$ V \in \mathbb{R}^{H' \times W' \times C} $$.

$$
\begin{pmatrix}
x_{i}^{s} \\
y_{i}^{s}
\end{pmatrix} = \mathcal{T}_{\theta}(G_{i}) =

\begin{bmatrix}
\theta_{11} & \theta_{12} & \theta_{13} \\
\theta_{21} & \theta_{22} & \theta_{23}
\end{bmatrix} \begin{pmatrix}
x_{i}^{t} \\
y_{i}^{t} \\
1
\end{pmatrix}
$$

, where $$ (x^{t}_{i}, y^{t}_{i}) $$ are the target coordinates of the regular grid in the output feature map, $$ (x^{s}_{i}, y^{s}_{i}) $$ are the source coordinates in the input feature map. We use height and width normalised coordinates, such that $$ −1 \leq x_{i}^{t}, y_{i}^{t} \leq 1 $$ when within the spatial bounds of the output, and $$ −1 \leq x_{i}^{s}, y_{i}^{s} \leq 1 $$ when within the spatial bounds of the input.

Assume input images $$ U $$ and output images $$ V $$ have the same dimensions of $$ H \times W \times 1 $$. The regular grid $$ G $$ of $$ V $$ is normalized from $$ 0 \leq x_{i}^{t}, y_{i}^{t} \leq H $$ to $$ -1 \leq x_{i}^{t}, y_{i}^{t} \leq 1 $$

$$
\begin{bmatrix}
(0, 0) & \cdots & (W, 0) \\
  \vdots & (W/2, H/2)  &  \vdots \\
(0, H) & \cdots & (W, H)
\end{bmatrix} \rightarrow

\begin{bmatrix}
(-1, -1) & \cdots & (1, -1) \\
  \vdots & (0, 0)  &  \vdots \\
(-1, 1) & \cdots & (1, 1)
\end{bmatrix}
$$

The normalized regular grid can be generated with `np.linspace` and `np.meshgrip`

```python
x_t = np.linspace(-1, 1, width)
y_t = np.linspace(-1, 1, height)
x_t, y_t = np.meshgrid(x_t, y_t)
```

Since we've normalized the grid to $$ (-1, 1) $$, we need a linear interpolation function to map the normalized grid to the original grid $$ (0, H), (0, W) $$. Doing so, we could get any value from $$ (x_{i}^{t}, y_{i}^{t}) $$ or $$ (x_{i}^{s}, y_{i}^{s}) $$ by plugin it to the interpolation function.

<div class="d-flex justify-content-center m-5">
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   inkscape:version="1.0 (1.0+r73+1)"
   sodipodi:docname="draw.svg"
   id="svg315"
   width="453.59915pt"
   viewBox="0 0 453.59916 336.31497"
   version="1.1"
   height="336.31497pt">
  <metadata
     id="metadata319">
    <rdf:RDF>
      <cc:Work
         rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
        <dc:title></dc:title>
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <sodipodi:namedview
     inkscape:current-layer="svg315"
     inkscape:window-maximized="1"
     inkscape:window-y="27"
     inkscape:window-x="0"
     inkscape:cy="230.59191"
     inkscape:cx="107.01641"
     inkscape:zoom="1.3473085"
     fit-margin-bottom="20"
     fit-margin-right="20"
     fit-margin-left="20"
     fit-margin-top="20"
     showgrid="false"
     id="namedview317"
     inkscape:window-height="1025"
     inkscape:window-width="1920"
     inkscape:pageshadow="2"
     inkscape:pageopacity="0"
     guidetolerance="10"
     gridtolerance="10"
     objecttolerance="10"
     borderopacity="1"
     bordercolor="#666666"
     pagecolor="#ffffff"
     inkscape:document-rotation="0" />
  <defs
     id="defs4">
    <marker
       inkscape:stockid="ExperimentalArrow"
       orient="auto-start-reverse"
       refY="3"
       refX="5"
       id="ExperimentalArrow"
       inkscape:isstock="true">
      <path
         id="path1180"
         d="M 10,3 0,6 V 0 Z"
         style="fill:context-stroke;stroke:#000000;stroke-opacity:1" />
    </marker>
    <marker
       inkscape:isstock="true"
       style="overflow:visible"
       id="marker2171"
       refX="0"
       refY="0"
       orient="auto"
       inkscape:stockid="Arrow1Lend">
      <path
         transform="matrix(-0.8,0,0,-0.8,-10,0)"
         style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1pt;stroke-opacity:1"
         d="M 0,0 5,-5 -12.5,0 5,5 Z"
         id="path2169" />
    </marker>
    <marker
       inkscape:isstock="true"
       style="overflow:visible"
       id="Arrow1Lend"
       refX="0"
       refY="0"
       orient="auto"
       inkscape:stockid="Arrow1Lend">
      <path
         transform="matrix(-0.8,0,0,-0.8,-10,0)"
         style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1pt;stroke-opacity:1"
         d="M 0,0 5,-5 -12.5,0 5,5 Z"
         id="path1662" />
    </marker>
    <style
       id="style2"
       type="text/css">
*{stroke-linecap:butt;stroke-linejoin:round;}
  </style>
  </defs>
  <g
     transform="translate(-24.517242,-6.0096679)"
     id="xtick_1">
    <g
       id="line2d_1">
      <defs
         id="defs13">
        <path
           d="M 0,0 V 3.5"
           id="md365fd8d4a"
           style="stroke:#000000;stroke-width:0.8" />
      </defs>
      <g
         id="g17">
        <use
           style="stroke:#000000;stroke-width:0.8"
           x="73.832726"
           xlink:href="#md365fd8d4a"
           y="307.58401"
           id="use15"
           width="100%"
           height="100%" />
      </g>
    </g>
    <g
       id="text_1">
      <!-- −1.00 -->
      <defs
         id="defs24">
        <path
           d="M 10.59375,35.5 H 73.1875 V 27.203125 H 10.59375 Z"
           id="DejaVuSans-8722" />
        <path
           d="m 12.40625,8.296875 h 16.109375 v 55.625 L 10.984375,60.40625 v 8.984375 l 17.4375,3.515625 H 38.28125 V 8.296875 H 54.390625 V 0 H 12.40625 Z"
           id="DejaVuSans-49" />
        <path
           d="M 10.6875,12.40625 H 21 V 0 H 10.6875 Z"
           id="DejaVuSans-46" />
        <path
           d="m 31.78125,66.40625 q -7.609375,0 -11.453125,-7.5 Q 16.5,51.421875 16.5,36.375 q 0,-14.984375 3.828125,-22.484375 3.84375,-7.5 11.453125,-7.5 7.671875,0 11.5,7.5 3.84375,7.5 3.84375,22.484375 0,15.046875 -3.84375,22.53125 -3.828125,7.5 -11.5,7.5 z m 0,7.8125 q 12.265625,0 18.734375,-9.703125 6.46875,-9.6875 6.46875,-28.140625 0,-18.40625 -6.46875,-28.109375 -6.46875,-9.6875 -18.734375,-9.6875 -12.25,0 -18.71875,9.6875 Q 6.59375,17.96875 6.59375,36.375 q 0,18.453125 6.46875,28.140625 6.46875,9.703125 18.71875,9.703125 z"
           id="DejaVuSans-48" />
      </defs>
      <g
         transform="matrix(0.1,0,0,-0.1,58.510071,322.18244)"
         id="g36">
        <use
           xlink:href="#DejaVuSans-8722"
           id="use26"
           x="0"
           y="0"
           width="100%"
           height="100%" />
        <use
           x="83.789062"
           xlink:href="#DejaVuSans-49"
           id="use28"
           y="0"
           width="100%"
           height="100%" />
        <use
           x="147.41211"
           xlink:href="#DejaVuSans-46"
           id="use30"
           y="0"
           width="100%"
           height="100%" />
        <use
           x="179.19922"
           xlink:href="#DejaVuSans-48"
           id="use32"
           y="0"
           width="100%"
           height="100%" />
        <use
           x="242.82227"
           xlink:href="#DejaVuSans-48"
           id="use34"
           y="0"
           width="100%"
           height="100%" />
      </g>
    </g>
  </g>
  <g
     transform="translate(-23.017242,-6.0096679)"
     id="xtick_9">
    <g
       id="line2d_9">
      <g
         id="g174">
        <use
           style="stroke:#000000;stroke-width:0.8"
           x="398.48727"
           xlink:href="#md365fd8d4a"
           y="307.58401"
           id="use172"
           width="100%"
           height="100%" />
      </g>
    </g>
    <g
       id="text_9">
      <!-- 1.00 -->
      <g
         transform="matrix(0.1,0,0,-0.1,387.35446,322.18244)"
         id="g185">
        <use
           xlink:href="#DejaVuSans-49"
           id="use177"
           x="0"
           y="0"
           width="100%"
           height="100%" />
        <use
           x="63.623047"
           xlink:href="#DejaVuSans-46"
           id="use179"
           y="0"
           width="100%"
           height="100%" />
        <use
           x="95.410156"
           xlink:href="#DejaVuSans-48"
           id="use181"
           y="0"
           width="100%"
           height="100%" />
        <use
           x="159.0332"
           xlink:href="#DejaVuSans-48"
           id="use183"
           y="0"
           width="100%"
           height="100%" />
      </g>
    </g>
  </g>
  <g
     transform="translate(-24.517242,5.9903328)"
     id="line2d_16">
    <path
       id="path293"
       style="fill:none;stroke:#1f77b4;stroke-width:1.5;stroke-linecap:square"
       d="M 73.832727,295.488 398.48727,53.568 v 0"
       clip-path="url(#pce98a6c3a8)" />
  </g>
  <path
     style="fill:none;stroke:#000000;stroke-width:0.75;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;marker-end:url(#ExperimentalArrow)"
     d="M 20,300.00001 H 418.12708"
     id="path919" />
  <path
     id="path2167"
     d="M 209.88272,300.04343 V 37.855572"
     style="fill:none;stroke:#000000;stroke-width:0.731582px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;marker-end:url(#marker2171)" />
  <defs
     id="defs313">
    <clipPath
       id="pce98a6c3a8">
      <rect
         id="rect310"
         y="41.472"
         x="57.599998"
         width="357.12"
         height="266.112" />
    </clipPath>
  </defs>
  <circle
     r="3.75"
     cy="179.48244"
     cx="210.23274"
     id="path1967"
     style="fill:#ff0000;fill-opacity:1;stroke:none;stroke-width:0.99975;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
  <circle
     style="fill:#0000ff;fill-opacity:1;stroke:none;stroke-width:0.99975;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
     id="path1967-3"
     cx="49.232964"
     cy="300.69821"
     r="3.75" />
  <circle
     r="3.75"
     cy="58.567802"
     cx="376.28186"
     id="path1967-3-6"
     style="fill:#0000ff;fill-opacity:1;stroke:none;stroke-width:0.99975;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
  <text font-size="8" x="240" y="187.68913"> $ (x^{t}, x) $ </text>
  <text font-size="8" x="388.44168" y="50"> $ (1, W) $ </text>
  <text font-size="8" x="44.416748" y="272.34808"> $ (-1, 0) $ </text>
  <text font-size="8" x="410" y="280"> $ X^{t} \in (-1, 1) $ </text>
  <text font-size="8" x="205.23595" y="28.748047"> $ X \in (0, W) $ </text>
  <path
     style="fill:none;stroke:#000000;stroke-width:0.75;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:0, 0.75, 1.5, 2.25, 3, 3.75, 4.5, 5.25, 6, 6.75, 7.5, 8.25, 9, 9.75, 10.5;stroke-dashoffset:0;stroke-opacity:1"
     d="M 375.69477,59.558333 V 298.70382"
     id="path1227" />
</svg>
</div>

$$
\begin{align}
\frac{W-0}{1-(-1)} &= \frac{x-0}{x^{t}-(-1)} \\
\frac{H-0}{1-(-1)} &= \frac{y-0}{y^{t}-(-1)} \\
x &= \frac{W}{2} (x^{t} + 1) \\
y &= \frac{H}{2} (y^{t} + 1) \\
\end{align}
$$

Now, we can use the following function to get any value from feature map:

```python
x = 0.5 * (W - 1) * (x_norm + 1)
y = 0.5 * (H - 1) * (y_norm + 1)
```

$$\mathcal{T}_{\theta}(G_{i})$$ is a matrix multiplication of $$\theta$$ and $$(\mathbf{x}^{t}, \mathbf{y}^{t}, \mathbf{1})$$:

```python
x_t_flat = np.reshape(x_t, [-1])
y_t_flat = np.reshape(y_t, [-1])
ones = np.ones_like(x_t_flat)
sampling_grid = np.stack([x_t_flat, y_t_flat, ones])

# repeat grid num_batch times
sampling_grid = np.expand_dims(sampling_grid, axis=0)
sampling_grid = np.tile(sampling_grid, np.stack([batch_size, 1, 1]))

batch_grids = np.matmul(theta, sampling_grid)
batch_grids = np.reshape(batch_grids, [batch_size, 2, height, width])
```

After the multiplication, then sample values from feature map $$ U $$ with $$(\mathbf{x}^{s}, \mathbf{y}^{s})$$

```python
def bilinear_sampler(feature_map, x_norm, y_norm):
    H, W = np.shape(feature_map)[2:]
    max_y = H - 1
    max_x = W - 1

    x = 0.5 * (max_x - 1) * (x_norm + 1)
    y = 0.5 * (max_y - 1) * (y_norm + 1)

    # grab 4 nearest corner points for each (x_i, y_i)
    x0 = np.floor(x).astype(np.int32)
    x1 = x0 + 1
    y0 = np.floor(y).astype(np.int32)
    y1 = y0 + 1

    x0 = np.minimum(max_x, np.maximum(0, x0))
    x1 = np.minimum(max_x, np.maximum(0, x1))
    y0 = np.minimum(max_y, np.maximum(0, y0))
    y1 = np.minimum(max_y, np.maximum(0, y1))

    Ia = get_pixel_value(feature_map, x0, y0)
    Ib = get_pixel_value(feature_map, x0, y1)
    Ic = get_pixel_value(feature_map, x1, y0)
    Id = get_pixel_value(feature_map, x1, y1)

    # calculate deltas
    wa = (x1 - x) * (y1 - y)
    wb = (x1 - x) * (y - y0)
    wc = (x - x0) * (y1 - y)
    wd = (x - x0) * (y - y0)

    # add dimension for addition
    wa = np.expand_dims(wa, axis=1)
    wb = np.expand_dims(wb, axis=1)
    wc = np.expand_dims(wc, axis=1)
    wd = np.expand_dims(wd, axis=1)

    # add dimension for addition
    out = wa * Ia + wb * Ib + wc * Ic + wd * Id
    return out
```

Fortunately Pytorch provides a affine grid function `F.affine_grid` generating grid given $\theta$ and the size of feature map, and `F.grid_sample` performing bilinear interpolation on feature map given a grid. The full implementation of Spatial Transform Network:

```python
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.conv1 = nn.Conv2d(1, 10, kernel_size=5)
        self.conv2 = nn.Conv2d(10, 20, kernel_size=5)
        self.conv2_drop = nn.Dropout2d()
        self.fc1 = nn.Linear(320, 50)
        self.fc2 = nn.Linear(50, 10)

        # Spatial transformer localization-network
        self.localization = nn.Sequential(
            nn.Conv2d(1, 8, kernel_size=7),
            nn.MaxPool2d(2, stride=2),
            nn.ReLU(True),
            nn.Conv2d(8, 10, kernel_size=5),
            nn.MaxPool2d(2, stride=2),
            nn.ReLU(True)
        )

        # Regressor for the 3 * 2 affine matrix
        self.fc_loc = nn.Sequential(
            nn.Linear(10 * 3 * 3, 32),
            nn.ReLU(True),
            nn.Linear(32, 3 * 2)
        )

        # Initialize the weights/bias with identity transformation
        self.fc_loc[2].weight.data.zero_()
        self.fc_loc[2].bias.data.copy_(torch.tensor([1, 0, 0, 0, 1, 0], dtype=torch.float))

    # Spatial transformer network forward function
    def stn(self, x):
        xs = self.localization(x)
        xs = xs.view(-1, 10 * 3 * 3)
        theta = self.fc_loc(xs)
        theta = theta.view(-1, 2, 3)

        grid = F.affine_grid(theta, x.size())
        x = F.grid_sample(x, grid)

        return x

    def forward(self, x):
        # transform the input
        x = self.stn(x)

        # Perform the usual forward pass
        x = F.relu(F.max_pool2d(self.conv1(x), 2))
        x = F.relu(F.max_pool2d(self.conv2_drop(self.conv2(x)), 2))
        x = x.view(-1, 320)
        x = F.relu(self.fc1(x))
        x = F.dropout(x, training=self.training)
        x = self.fc2(x)
        return F.log_softmax(x, dim=1)
```

I've implemented in [numpy](https://github.com/eugene123tw/stn_numpy) based on [Kevin Zakka's tensorflow implementation](https://github.com/kevinzakka/spatial-transformer-network)
