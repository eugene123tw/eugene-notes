import { Queue } from "./queue.js";

export {
  BinaryTreeNode,
  build_binary_tree,
  tree_traversal,
  tree_to_d3stratify,
  CreateBinaryTreeGraph,
};

class BinaryTreeNode {
  constructor(data = null, left = null, right = null, parent = null) {
    this.data = data;
    this.left = left;
    this.right = right;
    this.parent = parent;
  }

  toString() {
    // TODO: BUGGY
    var result = "";
    var visited = new Set();
    var first = true;
    var nodes = new Queue();
    var null_nodes_pending = 0;

    result += "[";
    nodes.enqueue(this);

    while (nodes) {
      var node = nodes.dequeue();
      if (node) {
        if (first) {
          first = false;
        } else {
          result += ", ";
        }
        while (null_nodes_pending) {
          result += "null, ";
          null_nodes_pending -= 1;
        }
        result += '"{${node.data}}"';
        nodes.enqueue(node.left);
        nodes.enqueue(node.right);
      } else {
        null_nodes_pending += 1;
      }
    }
    result += "]";
    return result;
  }
}

function build_binary_tree(list) {
  var nodes = [];
  for (var i = 0; i < list.length; i++) {
    if (list[i]) {
      nodes.push(new BinaryTreeNode(list[i]));
    } else {
      nodes.push(null);
    }
  }

  // copy array and reverse it
  var candidate_children = Array.from(nodes).reverse();
  var root = candidate_children.pop();
  for (var node of nodes) {
    if (node) {
      if (candidate_children) {
        node.left = candidate_children.pop();
        if (node.left) {
          node.left.parent = node;
        }
      }
      if (candidate_children) {
        node.right = candidate_children.pop();
        if (node.right) {
          node.right.parent = node;
        }
      }
    }
  }
  return root;
}

function tree_traversal(root) {
  if (root) {
    //console.log("Preorder %d", root.data);
    tree_traversal(root.left);

    //console.log("Inorder %d", root.data);
    tree_traversal(root.right);

    // console.log("Postorder %d", root.data);
  }
}

function tree_to_d3stratify(root) {
  function wrapper(root, list) {
    if (root != null) {
      var node = {
        id: root.data.toString(),
      };
      if (root.parent) {
        node.parentId = root.parent.data.toString();
      }
      list.push(node);
      wrapper(root.left, list);
      wrapper(root.right, list);
    }
  }

  var temp_list = new Array();
  wrapper(root, temp_list);
  return temp_list;
}

function CreateBinaryTreeGraph(
  root,
  width,
  div_dom,
  dx = 50,
  dy = 60,
  {
    label = (d) => (d.data.id != "null" ? d.data.id : ""),
    highlight = () => false,
    marginLeft = 40,
  } = {}
) {
  var tree = d3.tree().nodeSize([dx, dy]);
  var treeLink = d3
    .linkVertical()
    .x((d) => d.x)
    .y((d) => d.y);
  root = tree(root);

  let y0 = Infinity;
  let y1 = -y0;
  root.each((d) => {
    if (d.y > y1) y1 = d.y;
    if (d.y < y0) y0 = d.y;
  });

  const svg = d3
    .select("#" + div_dom.id)
    .append("svg")
    .attr("viewBox", [0, 0, width, y1 - y0 + dy / 2])
    .style("overflow", "visible");

  const g = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("transform", `translate(${width / 2}, ${10})`);

  const link = g
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr("stroke", function (d) {
      return highlight(d.source) && highlight(d.target) ? "red" : null;
    })
    .attr("stroke-opacity", function (d) {
      if (d.target.data.id == "null") {
        return 0;
      }
      return highlight(d.source) && highlight(d.target) ? 1 : null;
    })
    .attr("d", treeLink);

  const node = g
    .append("g")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

  node
    .append("circle")
    .attr("fill", function (d) {
      if (d.data.id == "null") {
        return "white";
      }
      return highlight(d) ? "red" : d.children ? "#555" : "#19692c";
    })
    .attr("r", 5);

  node
    .append("text")
    .attr("fill", (d) => (highlight(d) ? "red" : null))
    .attr("dy", "0.31em")
    .attr("x", (d) => (d.children ? -6 : 6))
    .attr("text-anchor", (d) => (d.children ? "end" : "start"))
    .text(label)
    .clone(true)
    .lower()
    .attr("stroke", "white");

  return svg.node();
}
