/**
 * Example: Testing a Form Component
 * 
 * This demonstrates how to test a form component with multiple inputs,
 * validation, and submission.
 */

import React, { useState } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

// Form component to test
interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({ email, password });
    }
  };

  return (
    <View testID="login-form">
      <TextInput
        testID="email-input"
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && (
        <Text testID="email-error" style={styles.error}>
          {errors.email}
        </Text>
      )}

      <TextInput
        testID="password-input"
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      {errors.password && (
        <Text testID="password-error" style={styles.error}>
          {errors.password}
        </Text>
      )}

      <TouchableOpacity testID="submit-button" onPress={handleSubmit}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});

// Tests
describe('LoginForm', () => {
  describe('rendering', () => {
    test('renders form with email and password inputs', () => {
      const { getByTestId } = render(<LoginForm onSubmit={jest.fn()} />);
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('submit-button')).toBeTruthy();
    });

    test('does not show errors initially', () => {
      const { queryByTestId } = render(<LoginForm onSubmit={jest.fn()} />);
      expect(queryByTestId('email-error')).toBeNull();
      expect(queryByTestId('password-error')).toBeNull();
    });
  });

  describe('user input', () => {
    test('updates email when user types', () => {
      const { getByTestId } = render(<LoginForm onSubmit={jest.fn()} />);
      const emailInput = getByTestId('email-input');

      fireEvent.changeText(emailInput, 'user@example.com');

      expect(emailInput.props.value).toBe('user@example.com');
    });

    test('updates password when user types', () => {
      const { getByTestId } = render(<LoginForm onSubmit={jest.fn()} />);
      const passwordInput = getByTestId('password-input');

      fireEvent.changeText(passwordInput, 'password123');

      expect(passwordInput.props.value).toBe('password123');
    });
  });

  describe('validation', () => {
    test('shows error when email is empty', () => {
      const { getByTestId, queryByTestId } = render(
        <LoginForm onSubmit={jest.fn()} />
      );

      fireEvent.press(getByTestId('submit-button'));

      expect(queryByTestId('email-error')).toBeTruthy();
      expect(queryByTestId('email-error')?.props.children).toBe('Email is required');
    });

    test('shows error when email format is invalid', () => {
      const { getByTestId, queryByTestId } = render(
        <LoginForm onSubmit={jest.fn()} />
      );

      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      fireEvent.press(getByTestId('submit-button'));

      expect(queryByTestId('email-error')?.props.children).toBe('Invalid email format');
    });

    test('shows error when password is empty', () => {
      const { getByTestId, queryByTestId } = render(
        <LoginForm onSubmit={jest.fn()} />
      );

      fireEvent.press(getByTestId('submit-button'));

      expect(queryByTestId('password-error')).toBeTruthy();
      expect(queryByTestId('password-error')?.props.children).toBe('Password is required');
    });

    test('shows error when password is too short', () => {
      const { getByTestId, queryByTestId } = render(
        <LoginForm onSubmit={jest.fn()} />
      );

      fireEvent.changeText(getByTestId('password-input'), '12345');
      fireEvent.press(getByTestId('submit-button'));

      expect(queryByTestId('password-error')?.props.children).toBe(
        'Password must be at least 6 characters'
      );
    });

    test('does not show errors when form is valid', () => {
      const { getByTestId, queryByTestId } = render(
        <LoginForm onSubmit={jest.fn()} />
      );

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByTestId('submit-button'));

      expect(queryByTestId('email-error')).toBeNull();
      expect(queryByTestId('password-error')).toBeNull();
    });
  });

  describe('form submission', () => {
    test('calls onSubmit with form data when valid', () => {
      const onSubmitMock = jest.fn();
      const { getByTestId } = render(<LoginForm onSubmit={onSubmitMock} />);

      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByTestId('submit-button'));

      expect(onSubmitMock).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    test('does not call onSubmit when form is invalid', () => {
      const onSubmitMock = jest.fn();
      const { getByTestId } = render(<LoginForm onSubmit={onSubmitMock} />);

      fireEvent.press(getByTestId('submit-button'));

      expect(onSubmitMock).not.toHaveBeenCalled();
    });

    test('does not call onSubmit when email is invalid', () => {
      const onSubmitMock = jest.fn();
      const { getByTestId } = render(<LoginForm onSubmit={onSubmitMock} />);

      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByTestId('submit-button'));

      expect(onSubmitMock).not.toHaveBeenCalled();
    });
  });

  describe('user flow', () => {
    test('completes full login flow', () => {
      const onSubmitMock = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <LoginForm onSubmit={onSubmitMock} />
      );

      // User types email
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      expect(getByTestId('email-input').props.value).toBe('user@example.com');

      // User types password
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      expect(getByTestId('password-input').props.value).toBe('password123');

      // User submits
      fireEvent.press(getByTestId('submit-button'));

      // Form is submitted with correct data
      expect(onSubmitMock).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });

      // No errors shown
      expect(queryByTestId('email-error')).toBeNull();
      expect(queryByTestId('password-error')).toBeNull();
    });
  });
});

