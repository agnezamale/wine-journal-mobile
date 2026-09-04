import { render, screen } from '@testing-library/react-native';
import { AddWineScreen } from './AddWineScreen';

describe('AddWineScreen', () => {
  it('shows scan and manual add actions', () => {
    render(<AddWineScreen />);

    expect(screen.getByText('Add wine')).toBeOnTheScreen();
    expect(screen.getByText('Scan label')).toBeOnTheScreen();
    expect(screen.getByText('Add manually')).toBeOnTheScreen();
  });
});
