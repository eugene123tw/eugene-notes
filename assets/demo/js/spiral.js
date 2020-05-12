var N = 4;
var M = 5;

function create_matrix(N, M) {
  var color_matrix = [];
  var color = d3.interpolateSpectral;
  var color_scale = d3
    .scaleLinear()
    .domain([0, N * M])
    .range([0.1, 1]);

  count = 0;
  for (var i = 0; i < N; i++) {
    row = [];
    for (var j = 0; j < M; j++) {
      row.push(color(color_scale(count)));
      count++;
    }
    color_matrix.push(row);
  }
  return color_matrix;
}

function matrix_in_spiral_order(N, M) {
  var matrix = new Array(N);
  for (i = 0; i < N; i++) matrix[i] = new Array(M);

  for (var i = 0; i < N; i++) {
    for (var j = 0; j < M; j++) {
      matrix[i][j] = 1;
    }
  }

  var matrix_size = N * M;
  var width = M;
  var height = N;
  var row = 0;
  var col = 0;
  var direction = 0;
  var shifts = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];
  var spiral_coords = [];

  for (var i = 0; i < matrix_size; i++) {
    spiral_coords.push([row + 1, col + 1]);
    matrix[row][col] = 0;
    var next_row = row + shifts[direction][0];
    var next_col = col + shifts[direction][1];
    if (
      !(next_row in d3.range(height)) ||
      !(next_col in d3.range(width)) ||
      matrix[next_row][next_col] == 0
    ) {
      direction = (direction + 1) % 4;
      next_row = row + shifts[direction][0];
      next_col = col + shifts[direction][1];
    }
    row = next_row;
    col = next_col;
  }
  return spiral_coords;
}

var color_matrix = create_matrix(N, M);

var spiral_coords = matrix_in_spiral_order(N, M);

var coords = [];
for (var i = 1; i <= N; i++) {
  for (var j = 1; j <= M; j++) {
    coords.push([i, j]);
  }
}

// Create Event Handlers for mouse
function handleMouseOut() {
  return tooltip.style("visibility", "hidden");
}

function handleMouseMove() {
  return tooltip
    .style("top", d3.event.pageY - 10 + "px")
    .style("left", d3.event.pageX + 10 + "px");
}

var tooltip = d3
  .select("#subdivision")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("font-family", "Optima, Futura, sans-serif")
  .style("font-weight", "bold")
  .style("color", "green")
  .text("");

var width = 300;
var height = 300;
var padding = 30;

var _scale = d3
  .scaleLinear()
  .domain([1, d3.max([N, M]) + 1])
  .range([padding, d3.max([width, height]) - padding])
  .nice();

var svg = d3
  .select("#subdivision")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//Create rectangles
svg
  .selectAll("rect")
  .data(coords)
  .enter()
  .append("rect")
  .attr("x", function (d, i) {
    return _scale(coords[i][1]);
  })
  .attr("y", function (d, i) {
    return _scale(coords[i][0]);
  })
  .attr("width", _scale(1.5))
  .attr("height", _scale(1.5))
  .attr("fill", function (d, i) {
    return color_matrix[coords[i][0] - 1][coords[i][1] - 1];
  });

// create circles
svg
  .selectAll("circle")
  .data(coords)
  .enter()
  .append("circle")
  .attr("cx", function (d, i) {
    return _scale(coords[i][1] + 0.5);
  })
  .attr("cy", function (d, i) {
    return _scale(coords[i][0] + 0.5);
  })
  .attr("r", 3)
  .attr("fill", "black");

//Create line
var line = d3
  .line()
  .x(function (coord) {
    return _scale(coord[1] + 0.5);
  })
  .y(function (coord) {
    return _scale(coord[0] + 0.5);
  });

var path = svg
  .append("path")
  .datum(spiral_coords)
  .attr("class", "line")
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2.5)
  .attr("d", line);

var totalLength = path.node().getTotalLength();

var repeat = () => {
  path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(4000)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)
    .on("end", repeat);
};

repeat();
