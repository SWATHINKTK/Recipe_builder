import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/index';
import type { RootState } from '../store/index';
import { tick } from '../store/sessionSlice';

export default function SessionTicker() {
  const dispatch = useAppDispatch();
  const session = useAppSelector((s: RootState) => s.session);
  const recipe = useAppSelector((s: RootState) => {
    const id = s.session.activeSession?.recipeId;
    return s.recipes.items.find((r) => r.id === id) || null;
  });

  useEffect(() => {
    if (session.status !== 'running' || !recipe) return;
    const interval = setInterval(() => {
      dispatch(tick({ recipe }));
    }, 200);
    return () => clearInterval(interval);
  }, [dispatch, session.status, recipe?.id]);

    return null;
}


