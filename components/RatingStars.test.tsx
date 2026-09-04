import { fireEvent, render, screen } from '@testing-library/react-native';
import { RatingStars } from './RatingStars';

describe('RatingStars', () => {
  it('shows filled stars up to the rating', () => {
    render(<RatingStars rating={3} />);

    expect(screen.getByLabelText('1 stars')).toHaveTextContent('★');
    expect(screen.getByLabelText('2 stars')).toHaveTextContent('★');
    expect(screen.getByLabelText('3 stars')).toHaveTextContent('★');
    expect(screen.getByLabelText('4 stars')).toHaveTextContent('☆');
    expect(screen.getByLabelText('5 stars')).toHaveTextContent('☆');
  });

  it('calls onChange with the tapped star', () => {
    const onChange = jest.fn();
    render(<RatingStars rating={3} onChange={onChange} />);

    fireEvent(screen.getByLabelText('4 stars'), 'pressIn');

    expect(onChange).toHaveBeenCalledWith(4);
  });
});
