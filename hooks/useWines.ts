import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { attachPhotoUrls, pickPrimaryPhoto, uploadWinePhoto } from '../lib/winePhotos';
import type { TastingNote, Wine, WineInput, WinePhoto, WineWithNote } from '../types';

type WineRow = Wine & {
  tasting_notes?: TastingNote[] | TastingNote | null;
  wine_photos?: WinePhoto[] | WinePhoto | null;
};

export type TastingNoteInput = {
  rating?: number | null;
  aroma?: string | null;
  taste?: string | null;
  notes?: string | null;
};

function mapWineRow(row: WineRow): WineWithNote {
  const notes = row.tasting_notes;
  const tasting_note = Array.isArray(notes) ? notes[0] ?? null : notes ?? null;
  const primary_photo = pickPrimaryPhoto(row.wine_photos);
  const { tasting_notes: _ignored, wine_photos: _photos, ...wine } = row;
  return { ...wine, tasting_note, primary_photo };
}

function hasTastingContent(note: TastingNoteInput): boolean {
  return Boolean(
    (note.rating != null && note.rating > 0)
    || note.aroma
    || note.taste
    || note.notes,
  );
}

async function requireUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }
  if (!user) {
    throw new Error('You must be signed in.');
  }
  return user.id;
}

async function upsertTastingNote(
  wineId: string,
  note: TastingNoteInput,
  existingNoteId?: string | null,
): Promise<void> {
  if (!hasTastingContent(note)) {
    if (existingNoteId) {
      const { error } = await supabase.from('tasting_notes').delete().eq('id', existingNoteId);
      if (error) throw new Error(error.message);
    }
    return;
  }

  if (existingNoteId) {
    const { error } = await supabase
      .from('tasting_notes')
      .update(note)
      .eq('id', existingNoteId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase
    .from('tasting_notes')
    .insert({ ...note, wine_id: wineId });
  if (error) throw new Error(error.message);
}

export function useWines() {
  const [wines, setWines] = useState<WineWithNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);

  const fetchWines = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('wines')
      .select('*, tasting_notes(*), wine_photos(*)')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setWines([]);
    } else {
      setWines(await attachPhotoUrls(((data as WineRow[]) ?? []).map(mapWineRow)));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWines();
  }, [fetchWines]);

  const getWine = useCallback(async (id: string): Promise<WineWithNote> => {
    const { data, error: fetchError } = await supabase
      .from('wines')
      .select('*, tasting_notes(*), wine_photos(*)')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    const [wine] = await attachPhotoUrls([mapWineRow(data as WineRow)]);
    return wine;
  }, []);

  const createWine = useCallback(async (
    input: WineInput,
    photoUri?: string | null,
  ): Promise<Wine> => {
    setMutating(true);
    setError(null);

    try {
      const userId = await requireUserId();
      const { data, error: insertError } = await supabase
        .from('wines')
        .insert({ ...input, user_id: userId })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      const wine = data as Wine;
      if (photoUri) {
        await uploadWinePhoto(userId, wine.id, photoUri);
      }

      await fetchWines();
      return wine;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create wine';
      setError(message);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [fetchWines]);

  const updateWine = useCallback(async (id: string, input: Partial<WineInput>): Promise<Wine> => {
    setMutating(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('wines')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      await fetchWines();
      return data as Wine;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update wine';
      setError(message);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [fetchWines]);

  const createWineWithNote = useCallback(async (
    input: WineInput,
    note: TastingNoteInput,
  ): Promise<WineWithNote> => {
    setMutating(true);
    setError(null);

    try {
      const userId = await requireUserId();
      const { data, error: insertError } = await supabase
        .from('wines')
        .insert({ ...input, user_id: userId })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      const wine = data as Wine;
      await upsertTastingNote(wine.id, note);
      await fetchWines();
      return getWine(wine.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create wine';
      setError(message);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [fetchWines, getWine]);

  const updateWineWithNote = useCallback(async (
    id: string,
    input: Partial<WineInput>,
    note: TastingNoteInput,
    existingNoteId?: string | null,
  ): Promise<WineWithNote> => {
    setMutating(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('wines')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      await upsertTastingNote(id, note, existingNoteId);
      await fetchWines();
      return getWine(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update wine';
      setError(message);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [fetchWines, getWine]);

  const deleteWine = useCallback(async (id: string): Promise<void> => {
    setMutating(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('wines')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      setWines((current) => current.filter((wine) => wine.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete wine';
      setError(message);
      throw err;
    } finally {
      setMutating(false);
    }
  }, []);

  return {
    wines,
    loading,
    error,
    mutating,
    fetchWines,
    getWine,
    createWine,
    updateWine,
    createWineWithNote,
    updateWineWithNote,
    deleteWine,
  };
}
