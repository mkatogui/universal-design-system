import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from '../../packages/react/src/components/LoginForm/LoginForm';

describe('LoginForm', () => {
  it('renders default title and fields', () => {
    render(<LoginForm />);
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders custom title and description', () => {
    render(<LoginForm title="Welcome back" description="Enter your credentials" />);
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when valid', () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret123',
      rememberMe: false,
    });
  });

  it('shows validation errors when fields are empty', () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows global error message', () => {
    render(<LoginForm error="Invalid email or password" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('renders social provider buttons', () => {
    const googleClick = vi.fn();
    render(<LoginForm socialProviders={[{ name: 'Google', onClick: googleClick }]} />);

    const googleBtn = screen.getByRole('button', { name: 'Google' });
    expect(googleBtn).toBeInTheDocument();
    fireEvent.click(googleBtn);
    expect(googleClick).toHaveBeenCalledOnce();
  });

  it('renders social divider when providers exist', () => {
    render(<LoginForm socialProviders={[{ name: 'GitHub', onClick: vi.fn() }]} />);
    expect(screen.getByText('or continue with')).toBeInTheDocument();
  });

  it('shows remember me checkbox by default', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
  });

  it('hides remember me when showRememberMe is false', () => {
    render(<LoginForm showRememberMe={false} />);
    expect(screen.queryByLabelText('Remember me')).not.toBeInTheDocument();
  });

  it('sends rememberMe=true when checkbox is checked', () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'pass' } });
    fireEvent.click(screen.getByLabelText('Remember me'));
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
      rememberMe: true,
    });
  });

  it('renders forgot password link and calls handler', () => {
    const onForgot = vi.fn();
    render(<LoginForm onForgotPassword={onForgot} />);

    const link = screen.getByRole('button', { name: 'Forgot password?' });
    fireEvent.click(link);
    expect(onForgot).toHaveBeenCalledOnce();
  });

  it('hides forgot password link when handler is not provided', () => {
    render(<LoginForm />);
    expect(screen.queryByRole('button', { name: 'Forgot password?' })).not.toBeInTheDocument();
  });

  it('renders sign-up link and calls handler', () => {
    const onSignUp = vi.fn();
    render(<LoginForm onSignUp={onSignUp} />);

    const link = screen.getByRole('button', { name: /Sign up/ });
    fireEvent.click(link);
    expect(onSignUp).toHaveBeenCalledOnce();
  });

  it('hides sign-up link when handler is not provided', () => {
    render(<LoginForm />);
    expect(screen.queryByRole('button', { name: /Sign up/ })).not.toBeInTheDocument();
  });

  it('disables all inputs and buttons when loading', () => {
    render(
      <LoginForm
        loading
        onForgotPassword={vi.fn()}
        socialProviders={[{ name: 'G', onClick: vi.fn() }]}
      />,
    );

    expect(screen.getByLabelText(/Email/)).toBeDisabled();
    expect(screen.getByLabelText(/Password/)).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Forgot password?' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'G' })).toBeDisabled();
  });

  it('sets aria-busy on submit button when loading', () => {
    render(<LoginForm loading />);
    expect(screen.getByRole('button', { name: 'Sign in' })).toHaveAttribute('aria-busy', 'true');
  });

  it('supports custom labels for i18n', () => {
    render(
      <LoginForm
        title="Iniciar sesion"
        emailLabel="Correo"
        passwordLabel="Contrasena"
        submitLabel="Entrar"
        rememberMeLabel="Recordarme"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Iniciar sesion' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contrasena/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByLabelText('Recordarme')).toBeInTheDocument();
  });

  it('renders children in the extra content slot', () => {
    render(
      <LoginForm>
        <p data-testid="extra">Terms of service</p>
      </LoginForm>,
    );
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<LoginForm className="my-login" />);
    const form = container.querySelector('form');
    expect(form).toHaveClass('uds-login-form');
    expect(form).toHaveClass('my-login');
  });

  it('sets aria-label on the form', () => {
    render(<LoginForm title="Log in" />);
    expect(screen.getByRole('form', { name: 'Log in' })).toBeInTheDocument();
  });
});
