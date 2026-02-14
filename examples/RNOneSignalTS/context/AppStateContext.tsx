import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction } from '../types';

const initialState: AppState = {
  aliases: [],
  tags: [],
  triggers: [],
  emails: [],
  smsNumbers: [],
  pushSubscriptionId: '',
  pushEnabled: false,
  iamPaused: false,
  locationShared: false,
  consentRequired: false,
  consentGiven: false,
  externalUserId: null,
  isLoading: false,
  permissionGranted: false,
};

function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_ALIAS':
      return {
        ...state,
        aliases: [...state.aliases, action.payload],
      };
    case 'REMOVE_ALIAS':
      return {
        ...state,
        aliases: state.aliases.filter((a) => a.key !== action.payload),
      };
    case 'CLEAR_ALL_ALIASES':
      return {
        ...state,
        aliases: [],
      };
    case 'SET_ALL_ALIASES':
      return {
        ...state,
        aliases: action.payload,
      };
    case 'ADD_TAG':
      return {
        ...state,
        tags: [...state.tags, action.payload],
      };
    case 'REMOVE_TAG':
      return {
        ...state,
        tags: state.tags.filter((t) => t.key !== action.payload),
      };
    case 'SET_ALL_TAGS':
      return {
        ...state,
        tags: action.payload,
      };
    case 'ADD_TRIGGER':
      return {
        ...state,
        triggers: [...state.triggers, action.payload],
      };
    case 'REMOVE_TRIGGER':
      return {
        ...state,
        triggers: state.triggers.filter((t) => t.key !== action.payload),
      };
    case 'CLEAR_ALL_TRIGGERS':
      return {
        ...state,
        triggers: [],
      };
    case 'ADD_EMAIL':
      return {
        ...state,
        emails: [...state.emails, action.payload],
      };
    case 'REMOVE_EMAIL':
      return {
        ...state,
        emails: state.emails.filter((e) => e !== action.payload),
      };
    case 'SET_ALL_EMAILS':
      return {
        ...state,
        emails: action.payload,
      };
    case 'ADD_SMS':
      return {
        ...state,
        smsNumbers: [...state.smsNumbers, action.payload],
      };
    case 'REMOVE_SMS':
      return {
        ...state,
        smsNumbers: state.smsNumbers.filter((s) => s !== action.payload),
      };
    case 'SET_ALL_SMS':
      return {
        ...state,
        smsNumbers: action.payload,
      };
    case 'SET_PUSH_SUBSCRIPTION_ID':
      return {
        ...state,
        pushSubscriptionId: action.payload,
      };
    case 'SET_PUSH_ENABLED':
      return {
        ...state,
        pushEnabled: action.payload,
      };
    case 'SET_IAM_PAUSED':
      return {
        ...state,
        iamPaused: action.payload,
      };
    case 'SET_LOCATION_SHARED':
      return {
        ...state,
        locationShared: action.payload,
      };
    case 'SET_CONSENT_REQUIRED':
      return {
        ...state,
        consentRequired: action.payload,
      };
    case 'SET_CONSENT_GIVEN':
      return {
        ...state,
        consentGiven: action.payload,
      };
    case 'SET_EXTERNAL_USER_ID':
      return {
        ...state,
        externalUserId: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_PERMISSION_GRANTED':
      return {
        ...state,
        permissionGranted: action.payload,
      };
    default:
      return state;
  }
}

interface AppStateContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined,
);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
