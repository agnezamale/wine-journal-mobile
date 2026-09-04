import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useWines } from './useWines';

const mockFrom = jest.fn();
const mockGetUser = jest.fn();

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
  },
}));

function createQuery(result: { data: unknown; error: { message: string } | null }) {
  const query: Record<string, jest.Mock> = {};
  const chain = () => query;

  query.select = jest.fn(chain);
  query.insert = jest.fn(chain);
  query.update = jest.fn(chain);
  query.delete = jest.fn(chain);
  query.eq = jest.fn(chain);
  query.order = jest.fn(chain);
  query.single = jest.fn(async () => result);

  Object.defineProperty(query, 'then', {
    value: (
      onFulfilled?: (value: typeof result) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  });

  return query;
}

describe('useWines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches wines and maps tasting notes', async () => {
    const listQuery = createQuery({
      data: [
        {
          id: 'w1',
          user_id: 'u1',
          name: 'Test Wine',
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
          tasting_notes: [{ id: 'n1', wine_id: 'w1', rating: 5, tasted_at: '2026-01-01' }],
        },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(listQuery);

    const { result } = renderHook(() => useWines());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFrom).toHaveBeenCalledWith('wines');
    expect(result.current.error).toBeNull();
    expect(result.current.wines).toHaveLength(1);
    expect(result.current.wines[0].name).toBe('Test Wine');
    expect(result.current.wines[0].tasting_note?.rating).toBe(5);
  });

  it('sets an error when fetch fails', async () => {
    const listQuery = createQuery({
      data: null,
      error: { message: 'permission denied' },
    });
    mockFrom.mockReturnValue(listQuery);

    const { result } = renderHook(() => useWines());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('permission denied');
    expect(result.current.wines).toEqual([]);
  });

  it('creates a wine for the signed-in user', async () => {
    const listQuery = createQuery({ data: [], error: null });
    const insertQuery = createQuery({
      data: {
        id: 'w2',
        user_id: 'u1',
        name: 'New Wine',
        created_at: '2026-01-02',
        updated_at: '2026-01-02',
      },
      error: null,
    });

    mockFrom
      .mockReturnValueOnce(listQuery)
      .mockReturnValueOnce(insertQuery)
      .mockReturnValueOnce(listQuery);

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });

    const { result } = renderHook(() => useWines());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let created;
    await act(async () => {
      created = await result.current.createWine({ name: 'New Wine' });
    });

    expect(mockGetUser).toHaveBeenCalled();
    expect(insertQuery.insert).toHaveBeenCalledWith({ name: 'New Wine', user_id: 'u1' });
    expect(created).toMatchObject({ id: 'w2', name: 'New Wine' });
  });

  it('deletes a wine and removes it from local state', async () => {
    const listQuery = createQuery({
      data: [
        {
          id: 'w1',
          user_id: 'u1',
          name: 'Test Wine',
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
          tasting_notes: [],
        },
      ],
      error: null,
    });
    const deleteQuery = createQuery({ data: null, error: null });

    mockFrom
      .mockReturnValueOnce(listQuery)
      .mockReturnValueOnce(deleteQuery);

    const { result } = renderHook(() => useWines());
    await waitFor(() => expect(result.current.wines).toHaveLength(1));

    await act(async () => {
      await result.current.deleteWine('w1');
    });

    expect(deleteQuery.delete).toHaveBeenCalled();
    expect(deleteQuery.eq).toHaveBeenCalledWith('id', 'w1');
    expect(result.current.wines).toEqual([]);
  });
});
