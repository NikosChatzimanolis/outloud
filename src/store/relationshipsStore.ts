import { create } from 'zustand';
import { Relationship } from '../types';

interface RelationshipsState {
  relationships: Relationship[];
  setRelationships: (r: Relationship[]) => void;
  addOrUpdate: (r: Relationship) => void;
  setFavorite: (relationshipId: string, forUserA: boolean, value: boolean) => void;
}

export const useRelationshipsStore = create<RelationshipsState>((set) => ({
  relationships: [],
  setRelationships: (relationships) => set({ relationships }),
  addOrUpdate: (r) =>
    set((state) => {
      const idx = state.relationships.findIndex((x) => x.id === r.id);
      const next = [...state.relationships];
      if (idx >= 0) next[idx] = r;
      else next.push(r);
      return { relationships: next };
    }),
  setFavorite: (relationshipId, forUserA, value) =>
    set((state) => ({
      relationships: state.relationships.map((rel) =>
        rel.id === relationshipId
          ? {
              ...rel,
              favoriteForA: forUserA ? value : rel.favoriteForA,
              favoriteForB: !forUserA ? value : rel.favoriteForB,
            }
          : rel
      ),
    })),
}));
