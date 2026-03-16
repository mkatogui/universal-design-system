import React, { useCallback, useState } from 'react';

/** Data emitted on successful form submission. */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/** A social/OAuth provider button rendered above the credential fields. */
export interface SocialProvider {
  /** Display name shown on the button (e.g. "Google"). */
  name: string;
  /** Optional icon rendered before the name. */
  icon?: React.ReactNode;
  /** Callback when the social button is clicked. */
  onClick: () => void;
}

export interface LoginFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /** Form heading. @default 'Sign in' */
  title?: string;
  /** Optional description below the heading. */
  description?: string;

  /** Called with `{ email, password, rememberMe }` on valid submission. */
  onSubmit?: (data: LoginFormData) => void;
  /** Called when "Forgot password?" is clicked. Omit to hide the link. */
  onForgotPassword?: () => void;
  /** Called when the sign-up link is clicked. Omit to hide it. */
  onSignUp?: () => void;

  /** Social/OAuth provider buttons rendered above the form fields. */
  socialProviders?: SocialProvider[];
  /** Divider text between social buttons and credentials. @default 'or continue with' */
  socialDividerLabel?: string;

  /** Show the form in a loading/submitting state. @default false */
  loading?: boolean;
  /** Global form error (e.g. "Invalid credentials"). Rendered as an alert above fields. */
  error?: string;

  /** Show "Remember me" checkbox. @default true */
  showRememberMe?: boolean;

  /* ---- Label overrides (useful for i18n) ---- */
  /** @default 'Email' */
  emailLabel?: string;
  /** @default 'Password' */
  passwordLabel?: string;
  /** @default 'Remember me' */
  rememberMeLabel?: string;
  /** @default 'Forgot password?' */
  forgotPasswordLabel?: string;
  /** @default 'Sign in' */
  submitLabel?: string;
  /** @default "Don't have an account? Sign up" */
  signUpLabel?: string;
}

/**
 * Ready-to-use login form with email + password fields, optional social login,
 * "Remember me", "Forgot password?", and "Sign up" links.
 *
 * Composes UDS primitives (Input, Button, Checkbox, Alert, Divider) so the form
 * inherits the active palette and dark-mode automatically.
 *
 * ```tsx
 * <LoginForm
 *   onSubmit={({ email, password }) => signIn(email, password)}
 *   onForgotPassword={() => navigate('/forgot')}
 *   onSignUp={() => navigate('/register')}
 *   socialProviders={[
 *     { name: 'Google', icon: <GoogleIcon />, onClick: googleSSO },
 *   ]}
 * />
 * ```
 */
export const LoginForm = React.forwardRef<HTMLFormElement, LoginFormProps>(
  (
    {
      title = 'Sign in',
      description,
      onSubmit,
      onForgotPassword,
      onSignUp,
      socialProviders,
      socialDividerLabel = 'or continue with',
      loading = false,
      error,
      showRememberMe = true,
      emailLabel = 'Email',
      passwordLabel = 'Password',
      rememberMeLabel = 'Remember me',
      forgotPasswordLabel = 'Forgot password?',
      submitLabel = 'Sign in',
      signUpLabel = "Don't have an account? Sign up",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    const validate = useCallback((): boolean => {
      const errors: { email?: string; password?: string } = {};
      if (!email.trim()) errors.email = `${emailLabel} is required`;
      if (!password) errors.password = `${passwordLabel} is required`;
      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    }, [email, password, emailLabel, passwordLabel]);

    const handleSubmit = useCallback(
      (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit?.({ email: email.trim(), password, rememberMe });
      },
      [email, password, rememberMe, validate, onSubmit],
    );

    const classes = ['uds-login-form', className].filter(Boolean).join(' ');
    const hasSocial = socialProviders && socialProviders.length > 0;

    return (
      <form
        ref={ref}
        className={classes}
        onSubmit={handleSubmit}
        aria-label={title}
        noValidate
        {...props}
      >
        {/* ---- Header ---- */}
        <div className="uds-login-form__header">
          <h2 className="uds-login-form__title">{title}</h2>
          {description && <p className="uds-login-form__description">{description}</p>}
        </div>

        {/* ---- Social providers ---- */}
        {hasSocial && (
          <div className="uds-login-form__social">
            {socialProviders.map((provider) => (
              <button
                key={provider.name}
                type="button"
                className="uds-login-form__social-btn"
                onClick={provider.onClick}
                disabled={loading}
              >
                {provider.icon && (
                  <span className="uds-login-form__social-icon" aria-hidden="true">
                    {provider.icon}
                  </span>
                )}
                {provider.name}
              </button>
            ))}
          </div>
        )}

        {/* ---- Divider ---- */}
        {hasSocial && (
          <div className="uds-login-form__divider">
            <span className="uds-login-form__divider-text">{socialDividerLabel}</span>
          </div>
        )}

        {/* ---- Global error ---- */}
        {error && (
          <div className="uds-login-form__error" role="alert">
            {error}
          </div>
        )}

        {/* ---- Fields ---- */}
        <div className="uds-login-form__fields">
          <div className="uds-login-form__field">
            <label className="uds-login-form__label" htmlFor="uds-login-email">
              {emailLabel}
              <span className="uds-login-form__required" aria-hidden="true">
                {' '}
                *
              </span>
            </label>
            <input
              id="uds-login-email"
              type="email"
              className={`uds-login-form__input${fieldErrors.email ? ' uds-login-form__input--error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'uds-login-email-error' : undefined}
              required
              autoComplete="email"
              disabled={loading}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="uds-login-form__field-error" id="uds-login-email-error" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="uds-login-form__field">
            <label className="uds-login-form__label" htmlFor="uds-login-password">
              {passwordLabel}
              <span className="uds-login-form__required" aria-hidden="true">
                {' '}
                *
              </span>
            </label>
            <input
              id="uds-login-password"
              type="password"
              className={`uds-login-form__input${fieldErrors.password ? ' uds-login-form__input--error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'uds-login-password-error' : undefined}
              required
              autoComplete="current-password"
              disabled={loading}
            />
            {fieldErrors.password && (
              <p className="uds-login-form__field-error" id="uds-login-password-error" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>
        </div>

        {/* ---- Remember me + Forgot password row ---- */}
        {(showRememberMe || onForgotPassword) && (
          <div className="uds-login-form__options">
            {showRememberMe && (
              <label className="uds-login-form__remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>{rememberMeLabel}</span>
              </label>
            )}
            {onForgotPassword && (
              <button
                type="button"
                className="uds-login-form__link"
                onClick={onForgotPassword}
                disabled={loading}
              >
                {forgotPasswordLabel}
              </button>
            )}
          </div>
        )}

        {/* ---- Submit ---- */}
        <button
          type="submit"
          className={`uds-login-form__submit${loading ? ' uds-login-form__submit--loading' : ''}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading && <span className="uds-login-form__spinner" aria-hidden="true" />}
          {submitLabel}
        </button>

        {/* ---- Extra content slot ---- */}
        {children}

        {/* ---- Sign-up link ---- */}
        {onSignUp && (
          <p className="uds-login-form__signup">
            <button type="button" className="uds-login-form__link" onClick={onSignUp}>
              {signUpLabel}
            </button>
          </p>
        )}
      </form>
    );
  },
);

LoginForm.displayName = 'LoginForm';
