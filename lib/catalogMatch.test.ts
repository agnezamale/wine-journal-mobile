import type { CatalogWine } from '../types';
import { catalogToWineInput, isStrongCatalogMatch, visibleCatalogResults } from './catalogMatch';

const nauMai: CatalogWine = {
  external_id: '1',
  external_source: 'wineapi.io',
  name: 'Sauvignon Blanc',
  producer: 'Nau Mai',
  region: 'Marlborough',
};

const maipo: CatalogWine = {
  external_id: '2',
  external_source: 'wineapi.io',
  name: 'Syrah',
  producer: 'Viña Maipo',
  region: 'Maipo Valley',
};

describe('catalogMatch', () => {
  it('treats whole producer words as a strong match', () => {
    expect(isStrongCatalogMatch(nauMai, 'nau mai')).toBe(true);
  });

  it('does not treat mai inside Maipo as a strong match', () => {
    expect(isStrongCatalogMatch(maipo, 'nau mai')).toBe(false);
  });

  it('hides weak results when a strong match exists', () => {
    const { visible, hiddenCount } = visibleCatalogResults(
      [nauMai, maipo],
      'nau mai',
      false,
    );

    expect(visible).toEqual([nauMai]);
    expect(hiddenCount).toBe(1);
  });

  it('shows the full list when showAll is true', () => {
    const { visible, hiddenCount } = visibleCatalogResults(
      [nauMai, maipo],
      'nau mai',
      true,
    );

    expect(visible).toEqual([nauMai, maipo]);
    expect(hiddenCount).toBe(0);
  });

  it('maps a catalog wine to a journal input', () => {
    expect(catalogToWineInput(nauMai)).toEqual({
      name: 'Sauvignon Blanc',
      producer: 'Nau Mai',
      vintage: null,
      region: 'Marlborough',
      country: null,
      grape_variety: null,
      wine_type: null,
      price: null,
      external_id: '1',
      external_source: 'wineapi.io',
      description: null,
      alcohol_content: null,
      average_rating: null,
      body: null,
      acidity: null,
      appellation: null,
      image_url: null,
    });
  });
});
