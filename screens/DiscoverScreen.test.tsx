import { render, screen } from '@testing-library/react-native';
import { DiscoverScreen } from './DiscoverScreen';

describe('DiscoverScreen', () => {
  it('shows the recommendations placeholder', () => {
    render(<DiscoverScreen />);

    expect(screen.getByText('Discover')).toBeOnTheScreen();
    expect(screen.getByText('Recommend for me')).toBeOnTheScreen();
  });
});
