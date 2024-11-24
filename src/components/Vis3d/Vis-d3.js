import * as d3 from 'd3'

class VisD3 {
    margin = { top: 100, right: 5, bottom: 100, left: 100 };
    size;
    height;
    width;
    matSvg;

    constructor(el) {
        this.el = el;
    }

    create(config) {
        this.size = { width: config.size.width, height: config.size.height };

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.matSvg = d3.select(this.el)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class", "matSvgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        return this.matSvg; // Return the created SVG
    }

    renderScatterPlot(visData) {
        if (!visData || visData.length === 0) {
            console.warn("No data provided for scatter plot.");
            return;
        }

        const xKey = 'Temperature';
        const yKey = 'RentedBikeCount';

        const xScale = d3.scaleLinear()
            .domain([d3.min(visData, (d) => d[xKey]), d3.max(visData, (d) => d[xKey])])
            .range([0, this.width]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(visData, (d) => d[yKey]), d3.max(visData, (d) => d[yKey])])
            .range([this.height, 0]);

        // Define axes
        const xAxis = d3.axisBottom(xScale).ticks(10);
        const yAxis = d3.axisLeft(yScale);

        // Clear existing elements
        this.matSvg.selectAll("*").remove();

        // Append X-axis
        this.matSvg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${this.height})`)
            .call(xAxis)
            .selectAll("text")
            .attr("dy", "1.5em")
            .style("font-size", "12px");

        // Append Y-axis
        this.matSvg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        // Append X-axis label
        this.matSvg.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", this.width / 2)
            .attr("y", this.height + 50)
            .text(xKey);

        // Append Y-axis label
        this.matSvg.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -50)
            .text(yKey);

        // Plot circles for scatter plot
        this.matSvg.selectAll("circle")
            .data(visData)
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d[xKey]))
            .attr("cy", (d) => yScale(d[yKey]))
            .attr("r", 3)
            .style("fill", "red");
    }



    renderVis(visData, controllerMethods) {
        console.log("renderVis", visData);
        //this.clear();
        this.renderScatterPlot(visData); // Return scatter plot rendering result
    }

    clear() {
        d3.select(this.el).selectAll("*").remove();
    }
}

export default VisD3;
