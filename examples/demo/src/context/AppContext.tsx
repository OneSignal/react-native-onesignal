import React, { createContext, useContext } from 'react';
import OneSignalRepository from '../repositories/OneSignalRepository';
import PreferencesService from '../services/PreferencesService';
import OneSignalApiService from '../services/OneSignalApiService';

interface AppContextValue {
  repository: OneSignalRepository;
  preferences: PreferencesService;
}

const AppContext = createContext<AppContextValue | null>(null);

const apiService = OneSignalApiService.getInstance();
const repository = new OneSignalRepository(apiService);
const preferences = PreferencesService.getInstance();

export const defaultContextValue: AppContextValue = { repository, preferences };

interface Props {
  children: React.ReactNode;
  value?: AppContextValue;
}

export function AppContextProvider({ children, value }: Props) {
  return (
    <AppContext.Provider value={value ?? defaultContextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return ctx;
}
