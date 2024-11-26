import './App.css';
import ScatterPlot from "./components/plots/ScatterPlot";

import ParallelCoordinatesPlot from "./components/plots/ParallelCoordinatesPlot";
import TaskBar from './components/taskBar/TaskBar';

// here import other dependencies

// a component is a piece of code which render a part of the user interface
function App() {

  return (
    <div className="App">
      {console.log("App rendering")}
      <TaskBar />
        <div id="view-container" className="row">
          <ScatterPlot />
          <ParallelCoordinatesPlot />
        </div>
    </div>
  );
}

export default App;
