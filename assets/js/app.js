function ScatterPlot() {
  this.rootElement = d3.select("#scatter");
  this.width = this.rootElement.style('width').replace('px', '');
  this.height = this.width - this.width / 3.9;
  this.margin = 20;
  this.labelArea = 110;
  this.tPadBot = 40;
  this.tPadLeft = 40;
  this.circRadius = 5;
  this.leftTextX = this.margin + this.tPadLeft;
  this.leftTextY = (this.height + this.labelArea) / 2 - this.labelArea;
  this.svg = this.rootElement.append("svg").attr("width", this.width).attr("height", this.height).attr("class", "chart");
  this.svg.append("g").attr("class", "xText");
  this.svg.append("g").attr("class", "yText");
  this.xText = d3.select(".xText");
  this.yText = d3.select(".yText");

  this.getRadious = function crGet() {
    if (this.width <= 530) {
      this.circRadius = 5;
    } else {
      this.circRadius = 10;
    }

    return this.circRadius;
  }

  this.setXAxis = function xTextRefresh() {
    this.xText.attr(
      "transform",
      `translate(${((this.width - this.labelArea) / 2 + this.labelArea)} , ${(this.height - this.margin - this.tPadBot)})`
    );

    /// Set Poverty axis.
    this.xText
      .append("text")
      .attr("y", -26)
      .attr("data-name", "poverty")
      .attr("data-axis", "x")
      .attr("class", "aText active x")
      .text("In Poverty (%)");
    /// Set Age Axis.
    this.xText
      .append("text")
      .attr("y", 0)
      .attr("data-name", "age")
      .attr("data-axis", "x")
      .attr("class", "aText inactive x")
      .text("Age (Median)");
    /// Set Income Axis.
    this.xText
      .append("text")
      .attr("y", 26)
      .attr("data-name", "income")
      .attr("data-axis", "x")
      .attr("class", "aText inactive x")
      .text("Household Income (Median)");
  }

  this.setYAxis = function yTextRefresh() {
    this.yText.attr(
      "transform",
      `translate(${this.leftTextX} , ${this.leftTextY})rotate(-90)`
    );

    /// Set Obesity Axis.
    this.yText
      .append("text")
      .attr("y", -26)
      .attr("data-name", "obesity")
      .attr("data-axis", "y")
      .attr("class", "aText active y")
      .text("Obese (%)");

    /// Set Smokes Axis.
    this.yText
      .append("text")
      .attr("x", 0)
      .attr("data-name", "smokes")
      .attr("data-axis", "y")
      .attr("class", "aText inactive y")
      .text("Smokes (%)");

    /// Set Healthcare Axis.
    this.yText
      .append("text")
      .attr("y", 26)
      .attr("data-name", "healthcare")
      .attr("data-axis", "y")
      .attr("class", "aText inactive y")
      .text("Lacks Healthcare (%)");
  }

  this.visualize = function visualize(theData) {
    var curX = "poverty";
    var curY = "obesity";
    var xMin;
    var xMax;
    var yMin;
    var yMax;
    var circRadius = this.getRadious();
    this.setXAxis();
    this.setYAxis();

    /// Following function will allow to set up tooltip rules
    var toolTip = d3
      .tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function (d) {
        console.log(d)

        var theX;
        var theState = "<div>" + d.state + "</div>";
        var theY = "<div>" + curY + ": " + d[curY] + "%</div>";
        if (curX === "poverty") {
          theX = "<div>" + curX + ": " + d[curX] + "%</div>";
        } else {
          theX = "<div>" +
            curX +
            ": " +
            parseFloat(d[curX]).toLocaleString("en") +
            "</div>";
        }
        return theState + theX + theY;
      });

    /// Calling the toolTip function.
    this.svg.call(toolTip);

    function xMinMax() {
      xMin = d3.min(theData, function (d) {
        return parseFloat(d[curX]) * 0.90;
      });

      xMax = d3.max(theData, function (d) {
        return parseFloat(d[curX]) * 1.10;
      });
    }

    function yMinMax() {
      yMin = d3.min(theData, function (d) {
        return parseFloat(d[curY]) * 0.90;
      });

      yMax = d3.max(theData, function (d) {
        return parseFloat(d[curY]) * 1.10;
      });
    }

    function labelChange(axis, clickedText) {
      d3
        .selectAll(".aText")
        .filter("." + axis)
        .filter(".active")
        .classed("active", false)
        .classed("inactive", true);

      clickedText.classed("inactive", false).classed("active", true);
    }

    /// Getting the Scatter Plot
    xMinMax();
    yMinMax();

    var xScale = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([this.margin + this.labelArea, this.width - this.margin]);
    var yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([this.height - this.margin - this.labelArea, this.margin]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    function tickCount() {
      if (this.width <= 500) {
        xAxis.ticks(5);
        yAxis.ticks(5);
      } else {
        xAxis.ticks(10);
        yAxis.ticks(10);
      }
    }
    tickCount();

    this.svg
      .append("g")
      .call(xAxis)
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + (this.height - this.margin - this.labelArea) + ")");
    this.svg
      .append("g")
      .call(yAxis)
      .attr("class", "yAxis")
      .attr("transform", "translate(" + (this.margin + this.labelArea) + ", 0)");

    var theCircles = this.svg.selectAll("g theCircles").data(theData).enter();

    theCircles
      .append("circle")
      .attr("cx", function (d) {
        return xScale(d[curX]);
      })
      .attr("cy", function (d) {
        return yScale(d[curY]);
      })
      .attr("r", circRadius)
      .attr("class", function (d) {
        return "stateCircle " + d.abbr;
      })
      .on("mouseover", function (d) {
        toolTip.show(d, this);
        d3.select(this).style("stroke", "#323232");
      })
      .on("mouseout", function (d) {
        toolTip.hide(d);
        d3.select(this).style("stroke", "#e3e3e3");
      });

    theCircles
      .append("text")
      .text(function (d) {
      return d.abbr;
      })
      .attr("dx", function (d) {
      return xScale(d[curX]);
      })
      .attr("dy", function (d) {
      return yScale(d[curY]) + circRadius / 2.5;
      })
      .attr("font-size", circRadius)
      .attr("class", "stateText")
      .on("mouseover", function (d) {
      toolTip.show(d);
        d3.select("." + d.abbr).style("stroke", "#323232");
      })
      .on("mouseout", function (d) {
      toolTip.hide(d);
        d3.select("." + d.abbr).style("stroke", "#e3e3e3");
      });

    /// Making the Graph Dynamic
    d3.selectAll(".aText").on("click", function () {

      var self = d3.select(this);
      if (self.classed("inactive")) {
        var axis = self.attr("data-axis");
        var name = self.attr("data-name");

        if (axis === "x") {
          curX = name;

          xMinMax();

          xScale.domain([xMin, xMax]);


          d3.selectAll("circle").each(function () {

            d3
              .select(this)
              .transition()
              .attr("cx", function (d) {
                return xScale(d[curX]);
              })
              .duration(300);
          });

          d3.selectAll(".stateText").each(function () {
            d3
              .select(this)
              .transition()
              .attr("dx", function (d) {
                return xScale(d[curX]);
              })
              .duration(300);
          });

          labelChange(axis, self);
        } else {
          curY = name;

          yMinMax();

          yScale.domain([yMin, yMax]);

          d3.selectAll("circle").each(function () {
            d3
              .select(this)
              .transition()
              .attr("cy", function (d) {
                return yScale(d[curY]);
              })
              .duration(300);
          });

          d3.selectAll(".stateText").each(function () {
            d3
              .select(this)
              .transition()
              .attr("dy", function (d) {
                return yScale(d[curY]) + circRadius / 3;
              })
              .duration(300);
          });

          labelChange(axis, self);
        }
      }
    });

    /// Responsive Chart.
    d3.select(window).on("resize", resize);

    function resize() {
      width = parseInt(d3.select("#scatter").style("width")).replace('px', '');
      height = width - width / 3.9;
      leftTextY = (height + this.labelArea) / 2 - this.labelArea;

      this.svg.attr("width", width).attr("height", height);

      xScale.range([margin + this.labelArea, width - margin]);
      yScale.range([height - margin - this.labelArea, margin]);

      this.svg
        .select(".xAxis")
        .call(xAxis)
        .attr("transform", "translate(0," + (height - this.margin - this.labelArea) + ")");

      this.svg.select(".yAxis").call(yAxis);

      tickCount();

      xTextRefresh();
      yTextRefresh();

      crGet();

      d3
        .selectAll("circle")
        .attr("cy", function (d) {
          return yScale(d[curY]);
        })
        .attr("cx", function (d) {
          return xScale(d[curX]);
        })
        .attr("r", function () {
          return circRadius;
        });

      d3
        .selectAll(".stateText")
        .attr("dy", function (d) {
          return yScale(d[curY]) + circRadius / 3;
        })
        .attr("dx", function (d) {
          return xScale(d[curX]);
        })
        .attr("r", circRadius / 3);
    }
  }
}

/// Getting the data and vizualize it after loaded.
d3.csv("/data/data.csv").then(function (data) {
  new ScatterPlot().visualize(data);
});