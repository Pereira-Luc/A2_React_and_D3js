import '../../templates/d3react/Vis.css';
import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import VisD3 from '../Vis3d/Vis-d3';
import { getSeoulBikeData, updateLastSelector, updateSelectedItem } from "../../redux/DataSetSlice";
import { plotTypes } from "../../utils/helper";
import * as d3 from "d3";


function ScatterPlot() {
    const visData = useSelector(state => state.dataSet.data);
    const selectedItem = useSelector(state => state.dataSet.selectedItem);
    const lastSelector = useSelector(state => state.dataSet.lastSelector);

    let xKey = 'Temperature';
    let yKey = 'RentedBikeCount';

    const [reload, setReload] = useState(false);
    const [selectedX, setSelectedX] = useState(xKey);
    const [selectedY, setSelectedY] = useState(yKey);

    const dispatch = useDispatch();

    const divContainerRef = useRef(null);
    const visD3Ref = useRef(null)
    const xKeyRef = useRef(null);
    const yKeyRef = useRef(null);

    // Handel x and y axis change
    const handleXChange = function () {
        setSelectedX(xKeyRef.current.value);
    }

    const handleYChange = function () {
        setSelectedY(yKeyRef.current.value);
    }

    const handleReload = function () {
        console.log("Reload button clicked");
        handleXChange();
        handleYChange();

        xKey = selectedX;
        yKey = selectedY;

        console.log("xKey", xKey);
        console.log("yKey", yKey);

        setReload(true);
    }

    const getCharSize = function () {
        let width = 1280;
        let height = 720;

        if (divContainerRef.current !== undefined) {
            width = divContainerRef.current.offsetWidth;
            height = divContainerRef.current.offsetHeight;
        }
        console.log("getCharSize", width, height);
        return { width: width, height: height };
    }

    // did mount called once the component did mount
    useEffect(() => {
        console.log("VisContainer useEffect [] called once the component did mount");
        const visD3 = new VisD3(divContainerRef.current);
        const margin = { top: 100, right: 5, bottom: 100, left: 100 };
        // Not setting the size here, as it will be set in the create method with the data that is give
        // will scale the data to fit the size of the container so subset would result in a smaller chart

        const actualWidth = getCharSize().width - margin.left - margin.right;
        const actualHeight = getCharSize().height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear()
            .domain([d3.min(visData, (d) => d[selectedX]), d3.max(visData, (d) => d[selectedX])])
            .range([0, actualWidth]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(visData, (d) => d[selectedY]), d3.max(visData, (d) => d[selectedY])])
            .range([actualHeight, 0]);


        visD3.create({ size: getCharSize(), xScale: xScale, yScale: yScale, margin: margin });
        visD3Ref.current = visD3;
        return () => {
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("VisContainer useEffect [] return function, called when the component did unmount...");
            const visD3 = visD3Ref.current;
            visD3.clear()
        }
    }, [visData, reload]);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(() => {
        console.log("VisContainer useEffect with dependency [visData,dispatch], called each time visData changes...");
        const visD3 = visD3Ref.current;
        if (lastSelector !== plotTypes.PARALLEL_COORDINATES) {
            console.log("load og");
            const handleOnEvent1 = function (payload) {
                dispatch(updateSelectedItem(payload));
                dispatch(updateLastSelector(plotTypes.SCATTER_PLOT));
                console.log("handleOnEvent1", payload);
            }
            const controllerMethods = {
                handleOnEvent1: handleOnEvent1,
            }
            visD3.renderScatterPlot(visData, controllerMethods.handleOnEvent1, selectedX, selectedY);
        }
        setReload(false);
    }, [visData, dispatch, lastSelector, reload]);// if dependencies, useEffect is called after each data update, in our case only visData changes.

    useEffect(() => {
        if (lastSelector !== plotTypes.SCATTER_PLOT && selectedItem.length > 0) {
            const visD3 = visD3Ref.current;
            const handleOnEvent1 = function (payload) {
                dispatch(updateSelectedItem(payload));
                dispatch(updateLastSelector(plotTypes.SCATTER_PLOT));
            };
            const controllerMethods = {
                handleOnEvent1: handleOnEvent1,
            };
            visD3.renderScatterPlot(selectedItem, controllerMethods.handleOnEvent1, selectedX, selectedY);
        }

    }, [selectedItem, reload]);


    return (
        <div className='box'>
            <h1 className="visTitle">ScatterPlot</h1>
            <div className='ButtonContainer'>
                <select ref={yKeyRef} className='btn'>
                    <option value="RentedBikeCount">RentedBikeCount</option>
                    <option value="Temperature">Temperature</option>
                    <option value="Hour">Hour</option>
                    <option value="Humidity">Humidity</option>
                    <option value="WindSpeed">WindSpeed</option>
                    <option value="Visibility">Visibility</option>
                    <option value="DewPointTemperature">DewPointTemperature</option>
                    <option value="SolarRadiation">SolarRadiation</option>
                    <option value="Rainfall">Rainfall</option>
                    <option value="Snowfall">Snowfall</option>
                </select>
                <select ref={xKeyRef} className='btn'>
                    <option value="Temperature">Temperature</option>
                    <option value="RentedBikeCount">RentedBikeCount</option>
                    <option value="Hour">Hour</option>
                    <option value="Humidity">Humidity</option>
                    <option value="WindSpeed">WindSpeed</option>
                    <option value="Visibility">Visibility</option>
                    <option value="DewPointTemperature">DewPointTemperature</option>
                    <option value="SolarRadiation">SolarRadiation</option>
                    <option value="Rainfall">Rainfall</option>
                    <option value="Snowfall">Snowfall</option>
                </select>
                <button onClick={handleReload} className='btn'>Reload</button>
            </div>
            <div ref={divContainerRef} className="visDivContainer">

            </div>
        </div>
    )
}

export default ScatterPlot;