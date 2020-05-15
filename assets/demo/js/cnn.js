import { Grid, CreateSVGRect } from "/assets/demo/js/toolbox.js";

var svg_height = 250;
var svg_width = 400;

var input_height = 7;
var input_width = 7;
var kernel_height = 3;
var kernel_width = 3;
var stride = 1;
var padding = 0;
var output_height = (input_height + 2 * padding - kernel_height) / stride + 1;
var output_width = (input_width + 2 * padding - kernel_width) / stride + 1;
var rect_pixels = 30;

var I_grid = Grid(input_height, input_width, rect_pixels);
var S_grid = Grid(
  output_height,
  output_width,
  rect_pixels,
  input_width * 30 + 30
);

var svg = d3
  .select("#subdivision")
  .append("svg")
  .attr("width", svg_width)
  .attr("height", svg_height)
  .attr("fill", "#fff");

CreateSVGRect(svg, I_grid, "I");
CreateSVGRect(svg, S_grid, "S");

d3.selectAll("#S rect")
  .on("mouseover", function (d) {
    var row = Math.floor(d.index / output_width);
    var col = d.index - row * output_width;
    d3.select(this)
      .transition()
      .duration(0)
      .attr("fill", "blue")
      .attr("fill-opacity", ".25");

    for (var i = 0; i < kernel_height; i++) {
      for (var j = 0; j < kernel_width; j++) {
        var im_row = row + i;
        var im_col = col + j;
        var index = im_row * input_width + im_col;
        d3.select("#I" + index)
          .transition()
          .duration(0)
          .attr("fill", "#ff0000")
          .attr("fill-opacity", ".25");
      }
    }
  })
  .on("mouseout", function (d) {
    d3.selectAll("rect").attr("fill", "white");
  });
