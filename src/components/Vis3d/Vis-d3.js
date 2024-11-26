import * as d3 from 'd3'

class VisD3 {
    margin = { top: 100, right: 5, bottom: 100, left: 100 };
    size;
    height;
    width;
    matSvg;
    selection = [];
    originalScale = { xScale: null, yScale: null };

    constructor(el) {
        this.el = el;
    }

    create(config) {
        this.size = { width: config.size.width, height: config.size.height };

        this.originalScale.xScale = config.xScale || null;
        this.originalScale.yScale = config.yScale || null;

        this.margin = config.margin || this.margin;


        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        console.log("Creating SVG with size:", this.size);

        this.matSvg = d3.select(this.el)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class", "matSvgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        return this.matSvg; // Return the created SVG
    }

    renderScatterPlot(visData, updateSelection, xKey, yKey) {
        if (!visData || visData.length === 0) {
            console.warn("No data provided for scatter plot.");
            return;
        }

        console.log("xKey", xKey);
        console.log("yKey", yKey);

        // const xKey = 'Temperature';
        // const yKey = 'RentedBikeCount';

        let xScale;
        let yScale;

        if (this.originalScale.xScale && this.originalScale.yScale) {
            xScale = this.originalScale.xScale;
            yScale = this.originalScale.yScale;
        } else {
            xScale = d3.scaleLinear()
                .domain([d3.min(visData, (d) => d[xKey]), d3.max(visData, (d) => d[xKey])])
                .range([0, this.width]);

            yScale = d3.scaleLinear()
                .domain([d3.min(visData, (d) => d[yKey]), d3.max(visData, (d) => d[yKey])])
                .range([this.height, 0]);
        }

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
        
        const color = d3.scaleSequential(d3.interpolateRdYlBu).domain(d3.extent(visData, (d) => d.Temperature).reverse());

        // Plot circles for scatter plot
        const circles = this.matSvg.selectAll("circle")
            .data(visData)
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d[xKey]))
            .attr("cy", (d) => yScale(d[yKey]))
            .attr("r", 3)
            .style("fill", (d) => color(d.Temperature))

        // Define brush
        const brush = d3.brush()
            .extent([[0, 0], [this.width, this.height]]) // Brushable area
            .on("brush", (event) => {
                const selection = event.selection; // [[x0, y0], [x1, y1]]
                if (selection) {
                    const [[x0, y0], [x1, y1]] = selection;

                    // Highlight points within the selection
                    circles.style("fill", (d) =>
                        xScale(d[xKey]) >= x0 &&
                            xScale(d[xKey]) <= x1 &&
                            yScale(d[yKey]) >= y0 &&
                            yScale(d[yKey]) <= y1
                            ? "blue" // Highlighted color
                            : color(d.Temperature) // Original color
                    );

                    // Get the selected data points data
                    const selected = visData.filter((d) => {
                        const x = xScale(d[xKey]);
                        const y = yScale(d[yKey]);
                        return x >= x0 && x <= x1 && y >= y0 && y <= y1;
                    });

                    updateSelection(selected);
                }
            })
            .on("end", (event) => {
                const selection = event.selection;
                if (!selection) {
                    // Clear highlights if brush is cleared
                    circles.style("fill", "red");
                    console.log("Brush cleared.");
                }
            });

        // Append brush to the SVG
        this.matSvg.append("g")
            .attr("class", "brush")
            .call(brush);


    }

    renderParallelCoordinates(visData, updateSelection, dimensions = ['RentedBikeCount', 'Temperature']) {
        if (!visData || visData.length === 0) {
            console.warn("No data provided for parallel coordinates.");
            return;
        }

        // Extract dimensions for parallel coordinates
        const yScales = {};

        console.log("Dimensions:", dimensions);

        dimensions.forEach(dim => {
            yScales[dim] = d3.scaleLinear()
                .domain(d3.extent(visData, (d) => d[dim]))
                .range([this.height, 0]);
        });

        const xScale = d3.scalePoint()
            .domain(dimensions)
            .range([0, this.width]);

        // Clear existing elements
        this.matSvg.selectAll("*").remove();


        // Draw lines for each data point
        const line = d3.line();
        const path = (d) => line(dimensions.map(p => [xScale(p), yScales[p](d[p])]));

        const color = d3.scaleSequential(d3.interpolateRdYlBu).domain(d3.extent(visData, (d) => d.Temperature).reverse());

        const lines = this.matSvg.selectAll(".line")
            .data(visData) // Make sure this matches brushedData
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", (d) => color(d.Temperature))
            .style("opacity", 0.7);


        // Add axes
        const axes = this.matSvg
            .selectAll(".dimension")
            .data(dimensions)
            .join("g")
            .attr("class", "axis")
            .attr("transform", (d) => `translate(${xScale(d)})`)
            .each(function (d) {
                d3.select(this).call(d3.axisLeft().scale(yScales[d]));
            })

        const svg = this.matSvg;

        axes.append("g")
            .attr("class", "brush")
            .each(function (dim) {
                d3.select(this).call(
                    d3.brushY()
                        .extent([
                            [-10, yScales[dim].range()[1]], // Top of the scale
                            [10, yScales[dim].range()[0]], // Bottom of the scale
                        ])
                        .on("brush end", ({ selection }) => {
                            if (selection) {
                                const [y0, y1] = selection;
                                const brushedData = visData.filter(
                                    (d) =>
                                        yScales[dim](d[dim]) >= y0 &&
                                        yScales[dim](d[dim]) <= y1
                                );
                                //console.log(`Brushed data for ${dim}:`, brushedData);
                                updateSelection(brushedData);
                            } else {
                                console.log(`Brush cleared for ${dim}`);
                                updateSelection([]);
                            }
                        })
                );
            });

        // Add axis labels
        axes.append("text")
            .attr("class", "axis-label")
            .attr("y", this.height + 30) // Position the labels below the axes
            .attr("text-anchor", "middle") // Center-align the text
            .text((d) => d) // Use the dimension name as the label
            .style("font-size", "12px") 
            .style("fill", "black"); 


    }
    clear() {
        d3.select(this.el).selectAll("*").remove();
    }
}

export default VisD3;
