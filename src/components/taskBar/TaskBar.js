import './TaskBar.css';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSeoulBikeData, updateSelectedItem, updateLastSelector, resetData } from '../../redux/DataSetSlice';

export default function TaskBar() {
    const resetDataFlag = useSelector((state) => state.dataSet.reset);

    const [reset, setReset] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        console.log("TaskBar useEffect [] called once the component did mount");
        dispatch(getSeoulBikeData());
    }, [dispatch]);

    useEffect(() => {
        if (reset) {
            console.log('Resetting selection');
            dispatch(updateSelectedItem([]));
            dispatch(updateLastSelector(null));
            dispatch(resetData(true));
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        console.log("TaskBar useEffect [resetData] called on resetData update.")
        //dispatch(resetData(false));
    }, [resetDataFlag]);


    const resetSelection = () => {
        setReset(true);
    }

    const toggleTable = () => {
        console.log('Table toggled');
    }


    return (
        <div className="task-bar">
            <h1>Synchronized Graphs</h1>

            <div className="task-bar-buttons">
                <button className='btn' onClick={resetSelection}>Reset Selection</button>
                <button className='btn' onClick={toggleTable}>Toggle Table</button>
            </div>
        </div>
    );
}