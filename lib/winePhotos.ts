import { supabase } from './supabase';
import type { WinePhoto, WineWithNote } from '../types';

export const WINE_PHOTOS_BUCKET = 'wine-photos';
const SIGNED_URL_SECONDS = 60 * 60 * 24;

function contentTypeFromUri(uri: string): string {
  const path = uri.split('?')[0].toLowerCase();
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.heic') || path.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

function extensionFromContentType(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/heic' || contentType === 'image/heif') return 'heic';
  return 'jpg';
}

async function readLocalFile(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Could not read the photo.');
  }
  return response.arrayBuffer();
}

export function pickPrimaryPhoto(
  photos: WinePhoto[] | WinePhoto | null | undefined,
): WinePhoto | null {
  const list = Array.isArray(photos) ? photos : photos ? [photos] : [];
  return list.find((photo) => photo.is_primary) ?? list[0] ?? null;
}

export async function uploadWinePhoto(
  userId: string,
  wineId: string,
  localUri: string,
): Promise<WinePhoto> {
  const contentType = contentTypeFromUri(localUri);
  const storagePath = `${userId}/${wineId}/label.${extensionFromContentType(contentType)}`;
  const body = await readLocalFile(localUri);

  const { error: uploadError } = await supabase.storage
    .from(WINE_PHOTOS_BUCKET)
    .upload(storagePath, body, { contentType, upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error } = await supabase
    .from('wine_photos')
    .insert({
      wine_id: wineId,
      storage_path: storagePath,
      is_primary: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WinePhoto;
}

export async function attachPhotoUrls(wines: WineWithNote[]): Promise<WineWithNote[]> {
  const paths = [...new Set(
    wines
      .map((wine) => wine.primary_photo?.storage_path)
      .filter((path): path is string => Boolean(path)),
  )];

  if (paths.length === 0) {
    return wines.map((wine) => ({ ...wine, photoUrl: null }));
  }

  const { data, error } = await supabase.storage
    .from(WINE_PHOTOS_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_SECONDS);

  if (error || !data) {
    return wines.map((wine) => ({ ...wine, photoUrl: null }));
  }

  const urlByPath = new Map<string, string>();
  for (const item of data) {
    if (item.path && item.signedUrl) {
      urlByPath.set(item.path, item.signedUrl);
    }
  }

  return wines.map((wine) => ({
    ...wine,
    photoUrl: wine.primary_photo
      ? urlByPath.get(wine.primary_photo.storage_path) ?? null
      : null,
  }));
}
