/**
 * Example: Testing a Button Component
 * 
 * This demonstrates how to test a React Native Button component,
 * including rendering, user interactions, and different states.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Button component to test
interface ButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  title, 
  disabled = false, 
  loading = false,
  testID = 'button'
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      style={[styles.button, (disabled || loading) && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator testID="loading-indicator" color="white" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Tests
describe('Button component', () => {
  describe('rendering', () => {
    test('renders button with title', () => {
      const { getByText } = render(
        <Button onPress={jest.fn()} title="Click me" />
      );
      expect(getByText('Click me')).toBeTruthy();
    });

    test('renders with custom testID', () => {
      const { getByTestId } = render(
        <Button onPress={jest.fn()} title="Submit" testID="submit-button" />
      );
      expect(getByTestId('submit-button')).toBeTruthy();
    });

    test('renders loading indicator when loading', () => {
      const { getByTestId, queryByText } = render(
        <Button onPress={jest.fn()} title="Click me" loading />
      );
      expect(getByTestId('loading-indicator')).toBeTruthy();
      expect(queryByText('Click me')).toBeNull();
    });
  });

  describe('user interactions', () => {
    test('calls onPress when button is pressed', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <Button onPress={onPressMock} title="Click me" />
      );

      fireEvent.press(getByText('Click me'));

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    test('does not call onPress when disabled', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = render(
        <Button onPress={onPressMock} title="Click me" disabled />
      );

      fireEvent.press(getByTestId('button'));

      expect(onPressMock).not.toHaveBeenCalled();
    });

    test('does not call onPress when loading', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = render(
        <Button onPress={onPressMock} title="Click me" loading />
      );

      fireEvent.press(getByTestId('button'));

      expect(onPressMock).not.toHaveBeenCalled();
    });

    test('calls onPress multiple times when pressed multiple times', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <Button onPress={onPressMock} title="Click me" />
      );

      fireEvent.press(getByText('Click me'));
      fireEvent.press(getByText('Click me'));
      fireEvent.press(getByText('Click me'));

      expect(onPressMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('states', () => {
    test('applies disabled style when disabled', () => {
      const { getByTestId } = render(
        <Button onPress={jest.fn()} title="Click me" disabled />
      );
      const button = getByTestId('button');
      // Note: In real tests, you might check styles or accessibility props
      expect(button).toBeTruthy();
    });

    test('shows loading state correctly', () => {
      const { getByTestId, queryByText } = render(
        <Button onPress={jest.fn()} title="Submit" loading />
      );
      expect(getByTestId('loading-indicator')).toBeTruthy();
      expect(queryByText('Submit')).toBeNull();
    });
  });

  describe('edge cases', () => {
    test('handles empty title', () => {
      const { getByTestId } = render(
        <Button onPress={jest.fn()} title="" />
      );
      expect(getByTestId('button')).toBeTruthy();
    });

    test('handles very long title', () => {
      const longTitle = 'A'.repeat(100);
      const { getByText } = render(
        <Button onPress={jest.fn()} title={longTitle} />
      );
      expect(getByText(longTitle)).toBeTruthy();
    });
  });
});

