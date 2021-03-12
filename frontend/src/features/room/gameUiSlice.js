import { createSlice } from "@reduxjs/toolkit";
//const isEqual = require("react-fast-compare");

const isObject = (item) => {
  return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

const arraysEqual = (a, b) => {
  /* WARNING: only works for arrays of primitives */
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const deepUpdate = (obj1, obj2) => {
  // If obj is undefined, don't update
  //if (!obj2) return;
  // If they are already equal, we are done
  if (obj1 === obj2) return;
  // First we delete properties from obj1 that no longer exist
  for (var p in obj1) {
    //// Ignore prototypes
    //if (!obj1.hasOwnProperty(p)) continue;
    // If property no longer exists in obj2, delete it from obj1
    if (!obj2.hasOwnProperty(p)) {
      delete obj1[p]
      continue;
    }
  }
  // If obj1 does not exist, set it to obj2
  if (!obj1) {
    obj1 = obj2;
    return;
  }
  // The we loop through obj2 properties and update obj1
  for (var p in obj2) {
    // Ignore prototypes
    //if (!obj2.hasOwnProperty(p)) continue;
    // If property does not exists in obj1, add it to obj1
    if (!obj1.hasOwnProperty(p)) {
      obj1[p] = obj2[p];
      continue;
    }
    // Both objects have the property
    // If they have the same strict value or identity then no need to update
    if (obj1[p] === obj2[p]) continue;
    // Objects are not equal. We need to examine their data type to decide what to do
    if (Array.isArray(obj1[p]) && Array.isArray(obj2[p])) {
      // Both values are arrays
      if (!arraysEqual(obj1[p],obj2[p])) {
        // Arrays are not equal, so update
        console.log("updating property "+p);
        obj1[p] = obj2[p];
      }
    } else if (isObject(obj1[p]) && isObject(obj2[p])) {
      // Both values are objects
      deepUpdate(obj1[p], obj2[p]);
    } else {
      // One of the values is not an object/array, so it's a basic type and should be updated
      console.log("updating property "+p);
      obj1[p] = obj2[p];
    }
  }
} 

const updateValue = (obj, path, value) => {
  const pathLength = path.length;
  console.log("updating", path, value)
  switch(pathLength) {
    case 0:
      break;
    case 1:
      obj[path[0]] = value;
      break;
    case 2:
      obj[path[0]][path[1]] = value;
      break;
    case 3:
      obj[path[0]][path[1]][path[2]] = value;
      break;
    case 4:
      obj[path[0]][path[1]][path[2]][path[3]] = value;
      break;
    case 5:
      obj[path[0]][path[1]][path[2]][path[3]][path[4]] = value;
      break;
    case 6:
      obj[path[0]][path[1]][path[2]][path[3]][path[4]][path[5]] = value;
      break;
  }
}

const updateValues = (obj, paths, values) => {
  const numValues = values.length;
  console.log("updating values", paths, values);
  for (var i = 0; i < numValues; i++) {
    updateValue(obj, paths[i], values[i])
  }
}

const initialState = {"count": 1};

const gameUiSlice = createSlice({
  name: "gameUi",
  initialState,
  reducers: {
    setGame: (state, { payload }) => {
      console.log("setting game");
      if (!state.game) {
        state.game = payload;
      } else {
        deepUpdate(state.game, payload);
      }
    },
    setGroupById: (state, { payload }) => {
      console.log("setting groupById")
      state.game.groupById = payload;
    },
    setGroup: (state, { payload }) => {
      console.log("setting group")
      state.game.groupById[payload.id] = payload;
    },
    setStackIds: (state, { payload }) => {
      console.log("setting stackIds")
      state.game.groupById[payload.id].stackIds = payload.stackIds;
    },
    setStack: (state, { payload }) => {
      console.log("setting stack")
      state.game.stackById[payload.id] = payload;
    },
    setCardIds: (state, { payload }) => {
      console.log("setting cardId")
      state.game.stackById[payload.id].cardIds = payload.cardIds;
    },
    setPlayerIds: (state, { payload }) => {
      console.log("setting playerIds")
      if (!state.playerIds) {
        state.playerIds = payload;
      } else {
        deepUpdate(state.playerIds, payload);
      }
    },
    setThreat: (state, { payload }) => {
      state.game.playerData[payload.playerN].threat = payload.value;
    },
    setValues: (state, { payload }) => {
      console.log("setting values")
      updateValues(state, payload.paths, payload.values);
    },
  },
});

export const { setGame, setGroupById, setGroup, setStackIds, setStack, setCardIds, setPlayerIds, setThreat, setValues } = gameUiSlice.actions;
export default gameUiSlice.reducer;
