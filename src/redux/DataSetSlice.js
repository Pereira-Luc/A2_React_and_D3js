import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa from "papaparse"

// get the data in asyncThunk
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
    const response = await fetch('data/SeoulBikeData.csv');
    const responseText = await response.text();
    console.log("loaded file length:" + responseText.length);
    const responseJson = Papa.parse(responseText,{header:true, dynamicTyping:true});
    return responseJson.data.map((item,i)=>{return {...item,index:i}});
    // when a result is returned, extraReducer below is triggered with the case setSeoulBikeData.fulfilled
})

export const dataSetSlice = createSlice({
  name: 'dataSet',
  initialState: {
      data : [],
      selectedItem: [],
      lastSelector: null,
      reset : false
  },
  reducers: {
      updateSelectedItem: (state, action) => {
            state.selectedItem = action.payload;
      },
      updateLastSelector: (state, action) => {
            state.lastSelector = action.payload;
      },
      resetData: (state, action) => {
            state.reset = action.payload;
      }
  },
  extraReducers: builder => {
    builder.addCase(getSeoulBikeData.fulfilled, (state, action) => {
      // Add any fetched house to the array
        state.data = action.payload;
    })
  }
})

// Action creators are generated for each case reducer function
export const { updateSelectedItem } = dataSetSlice.actions
export const { updateLastSelector } = dataSetSlice.actions
export const { resetData } = dataSetSlice.actions

export default dataSetSlice.reducer