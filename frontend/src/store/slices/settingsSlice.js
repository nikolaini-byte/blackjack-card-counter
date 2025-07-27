import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showHelp: false,
  showSystemInfo: false,
  theme: 'dark',
  autoSave: true,
  animationSpeed: 'normal',
  soundEnabled: true
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleHelp: (state) => {
      state.showHelp = !state.showHelp;
    },
    toggleSystemInfo: (state) => {
      state.showSystemInfo = !state.showSystemInfo;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleAutoSave: (state) => {
      state.autoSave = !state.autoSave;
    },
    setAnimationSpeed: (state, action) => {
      state.animationSpeed = action.payload;
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    }
  }
});

export const {
  toggleHelp,
  toggleSystemInfo,
  setTheme,
  toggleAutoSave,
  setAnimationSpeed,
  toggleSound
} = settingsSlice.actions;

export default settingsSlice.reducer;
