var width = 300;
var height = 300;
var padding = 30;

var cube_scale = d3
  .scaleLinear()
  .domain([1, 500])
  .range([padding, 200 - padding])
  .nice();

var svg = d3
  .select("#subdivision")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

function load() {
  d3.xml("js/interface.svg").then((svgElement) => {
    var cubeSVG = d3.select(svgElement.documentElement).select("g").node();
    svg.node().appendChild(cubeSVG);
    svg.selectAll("#cube polygon").each(function (d, i) {
      var scaled_vertices = [];
      for (point of this.points) {
        scaled_vertices.push(
          [cube_scale(point.x), cube_scale(point.y)].join(",")
        );
      }
      d3.select(this).attr("points", scaled_vertices.join(" "));
    });
  });
}

load();

var temp = svg.select("g");
