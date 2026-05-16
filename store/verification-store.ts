import { create } from "zustand";
import type {
  VerificationSession,
  VerificationEvent,
} from "@/types/verification";

interface VerificationState {
  currentSession: VerificationSession | null;
  activeStep: number;
  stepStatuses: Record<string, "pending" | "success" | "failed">;
  setSession: (session: VerificationSession | null) => void;
  setActiveStep: (step: number) => void;
  setStepStatus: (step: string, status: "pending" | "success" | "failed") => void;
  reset: () => void;
}

const TOTAL_STEPS = 5;

export const useVerificationStore = create<VerificationState>((set) => ({
  currentSession: null,
  activeStep: 0,
  stepStatuses: {},
  setSession: (session) => set({ currentSession: session, activeStep: 0, stepStatuses: {} }),
  setActiveStep: (step) =>
    set({ activeStep: Math.min(step, TOTAL_STEPS - 1) }),
  setStepStatus: (step, status) =>
    set((state) => ({
      stepStatuses: { ...state.stepStatuses, [step]: status },
    })),
  reset: () => set({ currentSession: null, activeStep: 0, stepStatuses: {} }),
}));
