import { fireEvent, render, screen } from '@testing-library/react-native';
import { TabBar } from './TabBar';

describe('TabBar', () => {
  it('notifies the parent when a tab is pressed', () => {
    const onChangeTab = jest.fn();
    render(<TabBar activeTab="journal" onChangeTab={onChangeTab} />);

    fireEvent.press(screen.getByText('Scan'));
    expect(onChangeTab).toHaveBeenCalledWith('add');

    fireEvent.press(screen.getByText('Discover'));
    expect(onChangeTab).toHaveBeenCalledWith('discover');

    fireEvent.press(screen.getByText('journal'));
    expect(onChangeTab).toHaveBeenCalledWith('journal');
  });
});
