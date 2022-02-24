<!DOCTYPE html>
<meta charset="utf-8">
<head>
    <style>

path.line-0 {
    fill: none;
    stroke: #1F77B4;
}

path.line-1 {
    fill: none;
    stroke: #FF7F0E;
}

    </style>
</head>
<!-- Body tag is where we will append our SVG and SVG objects-->
<body>

<!-- Load in the d3 library -->
<!-- <script src="lib/d3.v5.min.js"></script> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.10.0/d3.min.js" integrity="sha512-uSgLCSyTbExnWJs1Zs28lEUCmODX2b9AE0z7RNBslF06E93RxL9ZBD/s4mClhSMjP7qQQuoltMNqG+16sHED0w==" crossorigin="anonymous"></script>
<div id="svgdiv"></div>
<script>
//------------------------1. PREPARATION------------------------//
//-----------------------------SVG------------------------------//

var columns=['A=count','B=count'];
var columnsB=['A=rank','B=rank'];

var width = 960;
var height = 500;
var margin = 5;
var padding = 5;
var adj = 75;
// we are appending SVG first
var svg = d3.select("body").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
          + adj + " -"
          + adj + " "
          + (width + adj *3) + " "
          + (height + adj*3))
    .style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);

//-----------------------------DATA-----------------------------//
var timeConv = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%b %y")
var dataset = d3.csv("./lib/toShare.csv");
dataset.then(function(data) {
    var slices = columns.map(function(id) {
        return {
            id: id,
            values: data.map(function(d){
                return {
                    date: timeConv(d.date),
                    measurement: +d[id]
                };
            })
        };
    })
//----------------------------SCALES----------------------------//
var xScale = d3.scaleTime().range([0,width]);
var yScale = d3.scaleLinear().rangeRound([height, 0]);
xScale.domain(d3.extent(data, function(d){
    return timeConv(d.date)}));
yScale.domain([(0), d3.max(slices, function(c) {
    return d3.max(c.values, function(d) {
        return d.measurement + 4; });
        })
    ]);

//-----------------------------AXES-----------------------------//
var yaxis = d3.axisLeft()
    .ticks(9)
    .scale(yScale);

var xaxis = d3.axisBottom()
    .ticks(7)
    .scale(xScale);

//----------------------------LINES-----------------------------//
var line = d3.line()
    .x(function(d) { 
      return xScale(d.date); })
    .y(function(d) { return yScale(d.measurement); });

let id = 0;
var ids = function () {
    return "line-"+id++;
}
//-------------------------2. DRAWING---------------------------//
//-----------------------------AXES-----------------------------//

svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis)
        .append("text")
          .attr("transform",
                "translate(" + (width/2) + " ," +
                               50 + ")")
          .style("text-anchor", "middle")
          .text("Month");

    svg.append("g")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - adj)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Running Total");
//----------------------------LINES-----------------------------//
function handleMouseOver(d, i) {       
    d3.select(this).transition()
        .duration(1)
        .attr("r", 20);
}

function handleMouseOut(d, i) {   
    d3.select(this).transition()
        .duration(1)
        .attr("r", 4);
}

var linesAndDots = svg.selectAll("lines")
    .data(slices)
    .enter()
    .append("g");

    linesAndDots.append("path")
    .attr("class", ids)
    .attr("d", function(d) { return line(d.values); });


    linesAndDots
    .selectAll(".data-circle")
    .data(d=>d.values)
    .enter()
    .append("circle")
    .attr("class", "data-circle")
    .attr("r", 5)
    .attr("cx", function(d) {
      return xScale(d.date);
        })
    .attr("cy", function(d) {
      return yScale(d.measurement)
     })
     .on("mouseover", handleMouseOver)
     .on("mouseout", handleMouseOut);;

    //Add the label on the right
    linesAndDots.append("text")
    .attr("class", ids)
    .datum(function(d) {
        return {
            id: d.id,
            value: d.values[d.values.length - 1]}; })
    .attr("transform", function(d) {
            return "translate(" + (xScale(d.value.date) + 10)
            + "," + (yScale(d.value.measurement) + 5 ) + ")"; })
    .attr("x", 5)
    .text(function(d) { return d.id.replace("=count", ""); });
});

</script>
</body>
</html>