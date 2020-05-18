---
title: Convolution Layer
published: true
tags:
  - Deep Learning
  - Computer Vision
---

<!--more-->

## Addressing in Tensor: BCHW

We could access a value of `at::Tensor` by using a pointer. Pytorch stores tensor in the format of BCHW like many other libraries.
So, for a `1 x 3 x 1080 x 1920` tensor. The entry index of `[row: 192, col:15, channel: 2]` would be:

```python
>>> channels, height, width = 3, 1080, 1920
>>> row, col, c = 192, 15, 2
>>> index = c * height * width + row * width + col
>>> index
4515855
```

And, the opposite question, what is the exact channel, row, col of index: `4482044`?

```python
>>> channels, height, width = 3, 1080, 1920
>>> index =
```

## Cross-correlation

Cross-correlation: $$ S(i,j)=(I*K)(i,j)=\sum_{m} \sum_{n} I(i+m,j+n)K(m,n) $$

Assume our input consists of observed data $$\boldsymbol{\mathsf{V}}$$ with element
$$ \mathit{V}_{i,j,k}$$ giving the value of the input unit within channel $$i \in \{1,2,3\}$$ at row $$j \in \{ 1,2,...,7 \}$$ and column $$ k \in \{ 1,2,...,7 \}$$

$$ Z_{i,j,k}=\sum_{l,m,n} V_{l,j+m-1,k+n-1} K_{i,l,m,n} $$

<div>
  <div id="image"></div>
</div>

<script type="module">
import { Grid, CreateSVGRect } from "/eugene-notes/assets/demo/js/toolbox.js";

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
