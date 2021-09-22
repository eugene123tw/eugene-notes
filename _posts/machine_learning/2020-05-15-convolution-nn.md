---
title: Convolution Layer
published: true
tags:
  - Deep Learning
  - Computer Vision
---

<!--more-->

## Addressing in Tensor: CHW

We could access a value of `at::Tensor` by using a pointer. Pytorch stores tensor in the format of CHW like many other libraries.
So, for a `3` layers, each with `1080` height and `1920` width tensor. The entry index of `[row: 192, col:15, channel: 2]` would be:

```python
>>> channels, height, width = 3, 1080, 1920
>>> row, col, layer = 192, 15, 2
>>> index = layer * height * width + row * width + col
>>> index
4515855
```

And, the opposite question, what is the exact channel, row, col of index: `4482044`?

```python
>>> index = 4482044
>>> channels, height, width = 3, 1080, 1920
>>> layer = index // width // height
>>> row = (index // width) % height
>>> col = index % width
>>> layer, row, col
(2, 174, 764)
```

Joseph Redmon explains very well in his [Lecture 3](https://www.youtube.com/watch?v=hpqrDUuk7HY&list=PLjMXczUzEYcHvw5YYSU92WrY8IwhTuq7p&index=3) of The Ancient Secrets of Computer Vision.

The sequence of storing values of a tensor goes from width, than height, and step to the next layer and repeat above steps. For an RGB image, CHW format stores the first row than on to the next row till all values in red channel were traversed, than onto the green channel, finally the blue channel.

<div class="card mb-3">
    <img class="card-img-top" src="{{site.baseurl}}/assets/img/2020-05-15-convolution-nn/chw_format.png"/>
    <div class="card-body bg-light">
        <div class="card-text">
            Redmon, J., 2020. 03 - Computer Vision: Image Basics.
        </div>
    </div>
</div>

<div class="card mb-3">
    <img class="card-img-top" src="{{site.baseurl}}/assets/img/2020-05-15-convolution-nn/chw-2.png"/>
    <div class="card-body bg-light">
        <div class="card-text">
            Redmon, J., 2020. 03 - Computer Vision: Image Basics.
        </div>
    </div>
</div>
## Cross-correlation

Cross-correlation: $$ S(i,j)=(I*K)(i,j)=\sum_{m} \sum_{n} I(i+m,j+n)K(m,n) $$

Assume our input consists of observed data $$\boldsymbol{\mathsf{V}}$$ with element
$$ \mathit{V}_{i,j,k}$$ giving the value of the input unit within channel $$i \in \{1,2,3\}$$ at row $$j \in \{ 1,2,...,7 \}$$ and column $$ k \in \{ 1,2,...,7 \}$$

$$ Z_{i,j,k}=\sum_{l,m,n} V_{l,j+m-1,k+n-1} K_{i,l,m,n} $$

<div>
  <div id="image"></div>
</div>

<script type="module">
import { Grid, CreateSVGRect } from "/eugene-notes/assets/demo/js/svg_toolbox.js";

var svg_height = 250;
var svg_width = 900;

var input_height = 7;
var input_width = 7;
var kernel_height = 3;
var kernel_width = 3;
var stride = 1;
var padding = 0;
var output_height = (input_height + 2 * padding - kernel_height) / stride + 1;
var output_width = (input_width + 2 * padding - kernel_width) / stride + 1;
var rect_pixels = 30;

var V_L1_grid = Grid(input_height, input_width, rect_pixels, 0, 30);
var V_L2_grid = Grid(input_height, input_width, rect_pixels, 1 * input_width * rect_pixels + 30, 30);

var V_L3_grid = Grid(input_height, input_width, rect_pixels, 2 * input_width * rect_pixels + 60, 30);

var v_svg = d3
  .select("#image")
  .append("svg")
  .attr("width", svg_width)
  .attr("height", svg_height)
  .attr("fill", "#fff");

CreateSVGRect(v_svg, V_L1_grid, "L1");
CreateSVGRect(v_svg, V_L2_grid, "L2");
CreateSVGRect(v_svg, V_L3_grid, "L3");


v_svg
  .append("g")
    .attr("transform", "translate(90, 5)")
  .attr("class", "tex")
  .append("text")
  .text("$\\boldsymbol{V_{l=1}}$");

v_svg
  .append("g")
    .attr("transform", "translate(320, 5)")
  .attr("class", "tex")
  .append("text")
  .text("$\\boldsymbol{V_{l=2}}$");

v_svg
  .append("g")
    .attr("transform", "translate(570, 5)")
  .attr("class", "tex")
  .append("text")
  .text("$\\boldsymbol{V_{l=3}}$");


setTimeout(() => {
  
  MathJax.Hub.Config({
    tex2jax: {
      inlineMath: [ ['$','$'], ["\\(","\\)"] ],
      processEscapes: true
    }
  });
  
  MathJax.Hub.Register.StartupHook("End", function() {
    setTimeout(() => {
          v_svg.selectAll('.tex').each(function(){
          var self = d3.select(this),
              g = self.select('text>span>svg');
          g.remove();
          self.append(function(){
            return g.node();
          });
        });
      }, 1);
    });
  
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, svg.node()]);
  
}, 1);

</script>

## Convolutional Matrix Multiplication Op from CS231n 
From [course CS231n](https://cs231n.github.io/convolutional-networks/#conv), Andrej wrote a great explanation how matrix multiplication works in Convolution layer implementation. Here I referenced the context from the course material.

The convolution operation essentially performs dot products between the filters and local regions of the input. A common implementation pattern of the CONV layer is to take advantage of this fact and formulate the forward pass of a convolutional layer as one big matrix multiply as follows:

1. The local regions in the input image are stretched out into columns in an operation commonly called **im2col**. For example, if the input is [227x227x3] and it is to be convolved with 11x11x3 filters at stride 4, then we would take [11x11x3] blocks of pixels in the input and stretch each block into a column vector of size 11*11*3 = 363. Iterating this process in the input at stride of 4 gives (227-11)/4+1 = 55 locations along both width and height, leading to an output matrix `X_col` of **im2col** of size [363 x 3025], where every column is a stretched out receptive field and there are 55*55 = 3025 of them in total. Note that since the receptive fields overlap, every number in the input volume may be duplicated in multiple distinct columns.
2. The weights of the CONV layer are similarly stretched out into rows. For example, if there are 96 filters of size [11x11x3] this would give a matrix `W_row` of size [96 x 363].
3. The result of a convolution is now equivalent to performing one large matrix multiply `np.dot(W_row, X_col)`, which evaluates the dot product between every filter and every receptive field location. In our example, the output of this operation would be [96 x 3025], giving the output of the dot product of each filter at each location.
4. The result must finally be reshaped back to its proper output dimension [55x55x96].

This approach has the downside that it can use a lot of memory, since some values in the input volume are replicated multiple times in `X_col`. However, the benefit is that there are many very efficient implementations of Matrix Multiplication that we can take advantage of (for example, in the commonly used BLAS API). Moreover, the same **im2col idea** can be reused to perform the pooling operation, which we discuss next.

