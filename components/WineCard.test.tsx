import { fireEvent, render, screen } from '@testing-library/react-native';
import type { Wine } from '../types';
import { WineCard } from './WineCard';

const baseWine: Wine = {
  id: 'wine-123',
  user_id: 'user-1',
  name: 'Château Example',
  producer: 'Example Estate',
  vintage: 2019,
  region: 'Bordeaux',
  wine_type: 'red',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('WineCard', () => {
  it('shows the wine name, meta, and type', () => {
    render(<WineCard wine={baseWine} />);

    expect(screen.getByText('Château Example')).toBeOnTheScreen();
    expect(screen.getByText('Example Estate · 2019 · Bordeaux')).toBeOnTheScreen();
    expect(screen.getByText('red')).toBeOnTheScreen();
  });

  it('shows stars when a rating is provided', () => {
    render(<WineCard wine={baseWine} rating={4} />);

    expect(screen.getByText('★★★★')).toBeOnTheScreen();
  });

  it('hides stars when the rating is missing or zero', () => {
    const { rerender } = render(<WineCard wine={baseWine} />);
    expect(screen.queryByText(/★/)).toBeNull();

    rerender(<WineCard wine={baseWine} rating={0} />);
    expect(screen.queryByText(/★/)).toBeNull();
  });

  it('omits empty meta parts', () => {
    render(
      <WineCard
        wine={{
          ...baseWine,
          producer: undefined,
          vintage: undefined,
          region: 'Rioja',
          wine_type: undefined,
        }}
      />,
    );

    expect(screen.getByText('Rioja')).toBeOnTheScreen();
    expect(screen.queryByText(/Example Estate/)).toBeNull();
    expect(screen.queryByText('red')).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<WineCard wine={baseWine} onPress={onPress} />);

    fireEvent.press(screen.getByText('Château Example'));

    expect(onPress).toHaveBeenCalled();
  });

  it('calls onRemove from the remove control', () => {
    const onRemove = jest.fn();
    const onPress = jest.fn();
    render(<WineCard wine={baseWine} onPress={onPress} onRemove={onRemove} />);

    fireEvent.press(screen.getByLabelText('Remove Château Example'));

    expect(onRemove).toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows the wine label photo', () => {
    render(<WineCard wine={baseWine} photoUrl="https://cdn.example/label.jpg" />);

    expect(screen.getByLabelText('Wine label')).toBeOnTheScreen();
  });
});
