//Create a SVG element with d3
const pieces = [{
    name: "rook",
    w: "\u2656",
    b: "\u265C"
  }, {
    name: "knight",
    w: "\u2658",
    b: "\u265E"
  }, {
    name: "bishop",
    w: "\u2657",
    b: "\u265D"
  }, {
    name: "king",
    w: "\u2654",
    b: "\u265A"
  }, {
    name: "queen",
    w: "\u2655",
    b: "\u265B"
  }, {
    name: "bishop",
    w: "\u2657",
    b: "\u265D"
  }, {
    name: "knight",
    w: "\u2658",
    b: "\u265E"
  }, {
    name: "rook",
    w: "\u2656",
    b: "\u265C"
  }, {
    name: "pawn",
    w: "\u2659",
    b: "\u265F"
  }];
  // Draw
  const boxSize = 50,
  boardDimension = 8,
  boardSize = boardDimension * boxSize,
  margin = 100;
  
  // set <body>
  const div = d3.select("#subdivision");
  
  // create <svg>
  const svg = div.append("svg")
    .attr("width", boardSize + "px")
    .attr("height", boardSize + "px");
  
  // loop through 8 rows and 8 columns to draw the chess board
  let coordinates = [[0, 0], [1, 4], [2, 1], [3, 5], [4, 2], [5, 6], [6, 3], [7, 7]];

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      // draw each chess field
      const box = svg.append("rect")
        .attr("x", i * boxSize)
        .attr("y", j * boxSize)
        .attr("width", boxSize + "px")
        .attr("height", boxSize + "px");
      if ((i + j) % 2 === 0) {
        box.attr("fill", "beige");
      } else {
        box.attr("fill", "gray");
      }
    }
  }

  for (const coord of coordinates){
    let j = coord[0];
    let i = coord[1];

    // draw chess pieces 
    const chess = svg.append("text")
      .classed('draggable', true)
      .style("font-size", "50")
      .attr("text-anchor", "middle")
      .attr("x", i * boxSize)
      .attr("y", j * boxSize)
      .attr("dx", boxSize / 2)
      .attr("dy", boxSize * 0.85);
    
    chess.attr("X", chess.attr("x")).attr("Y", chess.attr("y"));
    
    // // Draw pieces
    chess.attr("id", "b" + i + "1").classed('team1', true).text(pieces.find(ele => ele.name === "queen").b);
  }

  
  d3.selectAll("rect")
    .on("mouseover", function(d, i) {
      d3.select(this).classed("rect-over", true);
    })
    .on("mouseout", function(d, i) {
      d3.select(this).classed("rect-over", false);
    });
  
  // Move chess pieces
  const drag = d3.drag()
    .subject(function() {
      var t = d3.select(this);
      return {
        x: t.attr("x"),
        y: t.attr("y")
      };
    }) // prevent distance between mouse and the piece when selecting it
    .on("start", startDrag)
    .on("drag", dragging)
    .on("end", endDrag);
  //
  function startDrag () {
    d3.select(this).raise().classed("active", true);
    //change attr X, Y to capture initial position before dragging    
    d3.select(this)
      .attr("X", d3.event.x)
      .attr("Y", d3.event.y);
    
  }
  
  function dragging() {
    d3.select(this)
      .attr("x", d3.event.x)
      .attr("y", d3.event.y);
  }
  
  function endDrag() {
    //get the coordinates of the closest  box
    let endX = Math.round(d3.event.x / 100) * 100;
    let endY = Math.round(d3.event.y / 100) * 100;
    //remove the old piece when dropping a new piece in the box
    let oldPiece = document.querySelector('text:not(.active)[x="' + endX + '"][y="' + endY + '"]');
    //drop the element to the closest box
    //check if the selected piece is in the same team as the piece at the box
  
    if (oldPiece !== null) {
      if (d3.select(this).classed(oldPiece.classList.item(1)) === false) { // different teams -> remove
        oldPiece.remove();
        d3.select(this)
          .attr("x", endX)
          .attr("y", endY);
      } else { //same teams -> put back the initial position
        d3.select(this)
          .attr("x", d3.select(this).attr("X"))
          .attr("y", d3.select(this).attr("Y"));
      }
    } else { //oldPiece === null after moving the piece
      d3.select(this)
        .attr("x", endX)
        .attr("y", endY);
    }
  
    d3.select(this).classed("active", false);
  };
  //attach drag event to all chess pieces
  d3.selectAll(".draggable").call(drag);