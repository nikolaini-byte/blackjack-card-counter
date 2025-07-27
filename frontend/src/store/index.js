import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import gameReducer from './slices/gameSlice';
import settingsReducer from './slices/settingsSlice';

// Configuration for Redux Persist
const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: ['game', 'settings'], // Only persist these reducers
  blacklist: ['_persist'], // Don't persist these reducers
};

// Combine reducers
const rootReducer = combineReducers({
  game: gameReducer,
  settings: settingsReducer,
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with middleware
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create the persistor
const persistor = persistStore(store);

export { store, persistor };
