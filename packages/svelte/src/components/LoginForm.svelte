<script lang="ts">
  interface SocialProvider {
    /** Display name shown on the button (e.g. "Google"). */
    name: string;
    /** Optional icon snippet rendered before the name. */
    icon?: import('svelte').Snippet;
    /** Callback when the social button is clicked. */
    onClick: () => void;
  }

  interface Props {
    /** Form heading. @default 'Sign in' */
    title?: string;
    /** Optional description below the heading. */
    description?: string;

    /** Called with { email, password, rememberMe } on valid submission. */
    onSubmit?: (data: { email: string; password: string; rememberMe: boolean }) => void;
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

    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
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
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let email = $state('');
  let password = $state('');
  let rememberMe = $state(false);
  let fieldErrors = $state<{ email?: string; password?: string }>({});

  let classes = $derived(
    ['uds-login-form', className].filter(Boolean).join(' ')
  );

  let hasSocial = $derived(
    socialProviders != null && socialProviders.length > 0
  );

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = `${emailLabel} is required`;
    if (!password) errors.password = `${passwordLabel} is required`;
    fieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.({ email: email.trim(), password, rememberMe });
  }
</script>

<form
  class={classes}
  onsubmit={handleSubmit}
  aria-label={title}
  novalidate
  {...rest}
>
  <!-- Header -->
  <div class="uds-login-form__header">
    <h2 class="uds-login-form__title">{title}</h2>
    {#if description}
      <p class="uds-login-form__description">{description}</p>
    {/if}
  </div>

  <!-- Social providers -->
  {#if hasSocial && socialProviders}
    <div class="uds-login-form__social">
      {#each socialProviders as provider}
        <button
          type="button"
          class="uds-login-form__social-btn"
          onclick={provider.onClick}
          disabled={loading}
        >
          {#if provider.icon}
            <span class="uds-login-form__social-icon" aria-hidden="true">
              {@render provider.icon()}
            </span>
          {/if}
          {provider.name}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Divider -->
  {#if hasSocial}
    <div class="uds-login-form__divider">
      <span class="uds-login-form__divider-text">{socialDividerLabel}</span>
    </div>
  {/if}

  <!-- Global error -->
  {#if error}
    <div class="uds-login-form__error" role="alert">
      {error}
    </div>
  {/if}

  <!-- Fields -->
  <div class="uds-login-form__fields">
    <div class="uds-login-form__field">
      <label class="uds-login-form__label" for="uds-login-email">
        {emailLabel}
        <span class="uds-login-form__required" aria-hidden="true"> *</span>
      </label>
      <input
        id="uds-login-email"
        type="email"
        class="uds-login-form__input{fieldErrors.email ? ' uds-login-form__input--error' : ''}"
        bind:value={email}
        aria-invalid={!!fieldErrors.email}
        aria-describedby={fieldErrors.email ? 'uds-login-email-error' : undefined}
        required
        autocomplete="email"
        disabled={loading}
        placeholder="you@example.com"
      />
      {#if fieldErrors.email}
        <p class="uds-login-form__field-error" id="uds-login-email-error" role="alert">
          {fieldErrors.email}
        </p>
      {/if}
    </div>

    <div class="uds-login-form__field">
      <label class="uds-login-form__label" for="uds-login-password">
        {passwordLabel}
        <span class="uds-login-form__required" aria-hidden="true"> *</span>
      </label>
      <input
        id="uds-login-password"
        type="password"
        class="uds-login-form__input{fieldErrors.password ? ' uds-login-form__input--error' : ''}"
        bind:value={password}
        aria-invalid={!!fieldErrors.password}
        aria-describedby={fieldErrors.password ? 'uds-login-password-error' : undefined}
        required
        autocomplete="current-password"
        disabled={loading}
      />
      {#if fieldErrors.password}
        <p class="uds-login-form__field-error" id="uds-login-password-error" role="alert">
          {fieldErrors.password}
        </p>
      {/if}
    </div>
  </div>

  <!-- Remember me + Forgot password row -->
  {#if showRememberMe || onForgotPassword}
    <div class="uds-login-form__options">
      {#if showRememberMe}
        <label class="uds-login-form__remember">
          <input
            type="checkbox"
            bind:checked={rememberMe}
            disabled={loading}
          />
          <span>{rememberMeLabel}</span>
        </label>
      {/if}
      {#if onForgotPassword}
        <button
          type="button"
          class="uds-login-form__link"
          onclick={onForgotPassword}
          disabled={loading}
        >
          {forgotPasswordLabel}
        </button>
      {/if}
    </div>
  {/if}

  <!-- Submit -->
  <button
    type="submit"
    class="uds-login-form__submit{loading ? ' uds-login-form__submit--loading' : ''}"
    disabled={loading}
    aria-busy={loading}
  >
    {#if loading}
      <span class="uds-login-form__spinner" aria-hidden="true"></span>
    {/if}
    {submitLabel}
  </button>

  <!-- Extra content slot -->
  {@render children?.()}

  <!-- Sign-up link -->
  {#if onSignUp}
    <p class="uds-login-form__signup">
      <button type="button" class="uds-login-form__link" onclick={onSignUp}>
        {signUpLabel}
      </button>
    </p>
  {/if}
</form>
