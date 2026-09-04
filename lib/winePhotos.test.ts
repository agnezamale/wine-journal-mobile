import { attachPhotoUrls, pickPrimaryPhoto, uploadWinePhoto } from './winePhotos';
import type { WinePhoto, WineWithNote } from '../types';

const mockUpload = jest.fn();
const mockCreateSignedUrls = jest.fn();
const mockFrom = jest.fn();

jest.mock('./supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    storage: {
      from: () => ({
        upload: (...args: unknown[]) => mockUpload(...args),
        createSignedUrls: (...args: unknown[]) => mockCreateSignedUrls(...args),
      }),
    },
  },
}));

const photo: WinePhoto = {
  id: 'p1',
  wine_id: 'w1',
  storage_path: 'u1/w1/label.jpg',
  is_primary: true,
};

const wine: WineWithNote = {
  id: 'w1',
  user_id: 'u1',
  name: 'Test Wine',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  primary_photo: photo,
};

describe('winePhotos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('picks the primary photo when several exist', () => {
    expect(pickPrimaryPhoto([
      { ...photo, id: 'p0', is_primary: false },
      photo,
    ])).toEqual(photo);
  });

  it('uploads a local photo and inserts a wine_photos row', async () => {
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as Response);
    mockUpload.mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: async () => ({ data: photo, error: null }),
        }),
      }),
    });

    const result = await uploadWinePhoto('u1', 'w1', 'file:///label.jpg');

    expect(mockUpload).toHaveBeenCalledWith(
      'u1/w1/label.jpg',
      expect.any(ArrayBuffer),
      { contentType: 'image/jpeg', upsert: true },
    );
    expect(result).toEqual(photo);
  });

  it('attaches signed photo URLs', async () => {
    mockCreateSignedUrls.mockResolvedValue({
      data: [{ path: photo.storage_path, signedUrl: 'https://cdn.example/label.jpg' }],
      error: null,
    });

    const [withUrl] = await attachPhotoUrls([wine]);

    expect(withUrl.photoUrl).toBe('https://cdn.example/label.jpg');
  });
});
