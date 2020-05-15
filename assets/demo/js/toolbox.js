export function Grid(
  height,
  width,
  rect_pixels = 10,
  xshift = 0,
  yshift = 0,
  margin = 5
) {
  var grid = [];
  for (var row = 0; row < height; row++) {
    grid.push(new Array());
    for (var col = 0; col < width; col++) {
      grid[row].push({
        index: row * width + col,
        x: col * rect_pixels,
        y: row * rect_pixels,
        w: rect_pixels - margin,
        h: rect_pixels - margin,
        col_shift: xshift,
        row_shift: yshift,
      });
    }
  }
  return grid;
}

export function CreateSVGRect(svg, data, id = "") {
  var square = svg.append("g");

  if (id) {
    square.attr("id", id);
  }

  var row = square
    .selectAll(".row")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "row");

  var column = row
    .selectAll(".square")
    .data(function (d) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("class", "square")
    .attr("x", function (d) {
      return d.x;
    })
    .attr("y", function (d) {
      return d.y;
    })
    .attr("width", function (d) {
      return d.w;
    })
    .attr("height", function (d) {
      return d.h;
    })
    .attr("id", (d) => id + d.index)
    .attr("transform", function (d) {
      return "translate(" + [d.col_shift, d.row_shift].join(" ") + ")";
    })
    .attr("fill", "#DDF")
    .attr("stroke", "none");
}
