import '../../templates/d3react/Vis.css';
import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VisD3 from '../Vis3d/Vis-d3';
import {updateLastSelector, updateSelectedItem, resetData} from "../../redux/DataSetSlice";
import {plotTypes} from "../../utils/helper";

function ParallelCoordinatesPlot() {
    const visData = useSelector(state => state.dataSet.data);
    const selectedItem = useSelector(state => state.dataSet.selectedItem);
    const lastSelector = useSelector(state => state.dataSet.lastSelector);
    const resetDataFlag = useSelector((state) => state.dataSet.reset);

    const dispatch = useDispatch();

    //Default dimensions
    const dimensions = [ 'RentedBikeCount', 'Temperature'];

    const [reload, setReload] = useState(false);
    const [selectedDimension, setSelectedDimension] = useState(dimensions);
    
    const divContainerRef = useRef(null);
    const visD3Ref = useRef(null);
    const selectedDimensionRef = useRef(null);

    const handelDimensionChange = function () {
        setSelectedDimension([...selectedDimension ,selectedDimensionRef.current.value]);
        setReload(true);
    }


    const getChartSize = function () {
        let width = 1280;
        let height = 720;

        if (divContainerRef.current !== undefined) {
            width = divContainerRef.current.offsetWidth;
            height = divContainerRef.current.offsetHeight;
        }
        console.log("getChartSize", width, height);
        return { width: width, height: height };
    };

    useEffect(() => {
        console.log("ParallelCoordinatesPlot useEffect [] called once the component mounts.");
        const visD3 = new VisD3(divContainerRef.current);
        visD3.create({ size: getChartSize() });
        visD3Ref.current = visD3;

        return () => {
            console.log("ParallelCoordinatesPlot unmounting...");
            const visD3 = visD3Ref.current;
            visD3.clear();
        };
    }, []); // Empty dependency array ensures this runs only once on mount.

    useEffect(() => {
        console.log("ParallelCoordinatesPlot useEffect [resetData] called on resetData update.");
        if (resetDataFlag) {
            setSelectedDimension(dimensions);
            dispatch(resetData(false));
            setReload(true); 
        }
    
    }, [resetDataFlag]);

    useEffect(() => {
        console.log("ParallelCoordinatesPlot useEffect [visData] called on visData update.");
        const visD3 = visD3Ref.current;

        if (resetDataFlag) {
            console.log('Resetting selection');
            setSelectedDimension(dimensions);
        }

        if (lastSelector !== plotTypes.PARALLEL_COORDINATES) {
            const handleBrushSelection = function (selectedData) {
                //console.log("Selected Data from brushing:", selectedData);
                dispatch(updateSelectedItem(selectedData));
                dispatch(updateLastSelector(plotTypes.PARALLEL_COORDINATES));
            };
            const dim = resetDataFlag ? dimensions : selectedDimension;
            console.log("resetDataFlag", resetDataFlag);
            console.log("Selected Dimensions:", dim);
            
            visD3.renderParallelCoordinates(visData, handleBrushSelection, dim);
        };
        setReload(false);
    }, [visData, reload, selectedDimension]); 

    useEffect(() => {
        console.log("ParallelCoordinatesPlot useEffect [selectedItem] called on selectedItem update.");
        if (lastSelector !== plotTypes.PARALLEL_COORDINATES && selectedItem.length > 0) {
            const visD3 = visD3Ref.current;

            const handleBrushSelection = function (selectedData) {
                //console.log("Selected Data from brushing:", selectedData);
                dispatch(updateSelectedItem(selectedData));
                dispatch(updateLastSelector(plotTypes.PARALLEL_COORDINATES));
            };


            visD3.renderParallelCoordinates(selectedItem, handleBrushSelection, selectedDimension);
        }
        setReload(false);
    },[selectedItem, reload]);

    return (
        <div  className='box'>
            <h1 className="visTitle">Parallel Coordinates Plot</h1>
            <div className='ButtonContainer'>
                <select ref={selectedDimensionRef} className='btn'>
                    <option value="Hour">Hour</option>
                    <option value="Humidity">Humidity</option>
                    <option value="WindSpeed">WindSpeed</option>
                    <option value="Visibility">Visibility</option>
                    <option value="DewPointTemperature">DewPointTemperature</option>
                    <option value="SolarRadiation">SolarRadiation</option>
                    <option value="Rainfall">Rainfall</option>
                    <option value="Snowfall">Snowfall</option>
                </select>
                <button onClick={handelDimensionChange} className='btn'>Add to Graph</button>
            </div>
            <div ref={divContainerRef} className="visDivContainer">
            
            </div>
        </div>
    );
}

export default ParallelCoordinatesPlot;
