import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Recipe } from '@/types/recipe';

type SessionStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface ActiveSessionState {
  recipeId: string;
  stepIndex: number;
  startedAtMs: number;
  elapsedMsInStep: number;
  totalElapsedMs: number;
}

export interface SessionState {
  status: SessionStatus;
  activeSession: ActiveSessionState | null;
}

const initialState: SessionState = {
  status: 'idle',
  activeSession: null
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<{ recipeId: string }>) => {
      // Only one active session at a time; starting a new one replaces the old
      state.status = 'running';
      state.activeSession = {
        recipeId: action.payload.recipeId,
        stepIndex: 0,
        startedAtMs: Date.now(),
        elapsedMsInStep: 0,
        totalElapsedMs: 0
      };
    },
    pause: (state) => {
      if (state.status === 'running' && state.activeSession) {
        const now = Date.now();
        state.activeSession.elapsedMsInStep += now - state.activeSession.startedAtMs;
        state.activeSession.totalElapsedMs += now - state.activeSession.startedAtMs;
        state.activeSession.startedAtMs = now;
        state.status = 'paused';
      }
    },
    resume: (state) => {
      if (state.status === 'paused' && state.activeSession) {
        state.activeSession.startedAtMs = Date.now();
        state.status = 'running';
      }
    },
    stop: (state, action: PayloadAction<{ recipe: Recipe }>) => {
      // STOP ends current step immediately and advances if not final step
      if (!state.activeSession) return;
      const sess = state.activeSession;
      const steps = action.payload.recipe.steps;
      const isLast = sess.stepIndex >= steps.length - 1;
      if (isLast) {
        state.status = 'completed';
      } else {
        // Move to next step, reset timers
        sess.stepIndex += 1;
        sess.elapsedMsInStep = 0;
        sess.startedAtMs = Date.now();
        state.status = 'running';
      }
    },
    tick: (state, action: PayloadAction<{ recipe: Recipe }>) => {
      if (state.status !== 'running' || !state.activeSession) return;
      const now = Date.now();
      const sess = state.activeSession;
      const delta = now - sess.startedAtMs;
      if (delta <= 0) return;
      sess.startedAtMs = now;
      sess.elapsedMsInStep += delta;
      sess.totalElapsedMs += delta;

      const steps = action.payload.recipe.steps;
      const current = steps[sess.stepIndex];
      if (!current) return;
      const stepDurationMs = current.durationSeconds * 1000;
      if (sess.elapsedMsInStep >= stepDurationMs) {
        const isLast = sess.stepIndex >= steps.length - 1;
        if (isLast) {
          state.status = 'completed';
        } else {
          // Auto-advance
          sess.stepIndex += 1;
          sess.elapsedMsInStep = 0;
          sess.startedAtMs = now;
          // status stays running
        }
      }
    },
    resetSession: (state) => {
      state.status = 'idle';
      state.activeSession = null;
    }
  }
});

export const { startSession, pause, resume, stop, tick, resetSession } = sessionSlice.actions;
export default sessionSlice.reducer;


