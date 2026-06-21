import { useReducer, useCallback } from "react";

export type CheckoutStep = 'CONFIG' | 'IDENTITY' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export interface CheckoutState {
  step: CheckoutStep;
  payload: Record<string, any>;
  idempotencyKey: string | null;
  isLocked: boolean; // Structural block against double-clicks
  errorMessage: string | null;
}

export type CheckoutAction =
  | { type: "UPDATE_PAYLOAD"; data: Record<string, any> }
  | { type: "TRANSITION"; to: CheckoutStep }
  | { type: "START_PROCESSING" }
  | { type: "FAIL"; message: string };

const initialState: CheckoutState = {
  step: 'CONFIG',
  payload: {},
  idempotencyKey: null,
  isLocked: false,
  errorMessage: null,
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case "UPDATE_PAYLOAD":
      return { ...state, payload: { ...state.payload, ...action.data } };
      
    case "TRANSITION":
      return { ...state, step: action.to, errorMessage: null };
      
    case "START_PROCESSING":
      // Generate explicit idempotency key right before network boundary to prevent duplicate billing
      return { 
        ...state, 
        step: 'PROCESSING', 
        isLocked: true, 
        idempotencyKey: state.idempotencyKey || crypto.randomUUID() 
      };
      
    case "FAIL":
      return { ...state, step: 'ERROR', isLocked: false, errorMessage: action.message };
      
    default:
      return state;
  }
}

export function useCheckoutMachine() {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  // Safe dispatcher that ignores inputs when locked
  const safeDispatch = useCallback((action: CheckoutAction) => {
    if (state.isLocked && action.type !== "FAIL") {
      // Shield against concurrent execution or double clicks
      return; 
    }
    dispatch(action);
  }, [state.isLocked]);

  return { state, dispatch: safeDispatch };
}
