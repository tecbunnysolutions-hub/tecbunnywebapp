import { useReducer } from "react";

export type CheckoutStep = 1 | 2 | 3 | 4; // 4 is success state

export interface CheckoutState {
  step: CheckoutStep;
  data: {
    serviceId?: string;
    plan?: string;
    date?: string;
    email?: string;
    address?: string;
  };
  isLocking: boolean; // Prevents double submission
  error: string | null;
}

type CheckoutAction =
  | { type: "SET_DATA"; payload: Partial<CheckoutState["data"]> }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; payload: string }
  | { type: "RESET_ERROR" };

const initialState: CheckoutState = {
  step: 1,
  data: {},
  isLocking: false,
  error: null,
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, data: { ...state.data, ...action.payload }, error: null };
    
    case "NEXT_STEP":
      // Validations can be placed here to prevent navigating without data
      if (state.step === 1 && !state.data.plan) {
         return { ...state, error: "Please select a plan before continuing." };
      }
      return { ...state, step: Math.min(state.step + 1, 4) as CheckoutStep, error: null };
      
    case "PREV_STEP":
      return { ...state, step: Math.max(state.step - 1, 1) as CheckoutStep, error: null };
      
    case "SUBMIT_START":
      return { ...state, isLocking: true, error: null };
      
    case "SUBMIT_SUCCESS":
      return { ...state, isLocking: false, step: 4 };
      
    case "SUBMIT_ERROR":
      return { ...state, isLocking: false, error: action.payload };
      
    case "RESET_ERROR":
      return { ...state, error: null };
      
    default:
      return state;
  }
}

export function useCheckoutMachine() {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  return { state, dispatch };
}
