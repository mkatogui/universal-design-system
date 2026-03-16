<template>
  <form
    ref="formRef"
    :class="classes"
    :aria-label="title"
    novalidate
    v-bind="$attrs"
    @submit.prevent="handleSubmit"
  >
    <!-- Header -->
    <div class="uds-login-form__header">
      <h2 class="uds-login-form__title">{{ title }}</h2>
      <p v-if="description" class="uds-login-form__description">{{ description }}</p>
    </div>

    <!-- Social providers -->
    <div v-if="hasSocial" class="uds-login-form__social">
      <button
        v-for="provider in socialProviders"
        :key="provider.name"
        type="button"
        class="uds-login-form__social-btn"
        :disabled="loading"
        @click="provider.onClick"
      >
        <span
          v-if="provider.icon"
          class="uds-login-form__social-icon"
          aria-hidden="true"
        >
          <component :is="() => provider.icon" />
        </span>
        {{ provider.name }}
      </button>
    </div>

    <!-- Divider -->
    <div v-if="hasSocial" class="uds-login-form__divider">
      <span class="uds-login-form__divider-text">{{ socialDividerLabel }}</span>
    </div>

    <!-- Global error -->
    <div v-if="error" class="uds-login-form__error" role="alert">
      {{ error }}
    </div>

    <!-- Fields -->
    <div class="uds-login-form__fields">
      <!-- Email -->
      <div class="uds-login-form__field">
        <label class="uds-login-form__label" for="uds-login-email">
          {{ emailLabel }}
          <span class="uds-login-form__required" aria-hidden="true"> *</span>
        </label>
        <input
          id="uds-login-email"
          v-model="email"
          type="email"
          :class="['uds-login-form__input', fieldErrors.email && 'uds-login-form__input--error'].filter(Boolean).join(' ')"
          :aria-invalid="!!fieldErrors.email"
          :aria-describedby="fieldErrors.email ? 'uds-login-email-error' : undefined"
          required
          autocomplete="email"
          :disabled="loading"
          placeholder="you@example.com"
        />
        <p
          v-if="fieldErrors.email"
          id="uds-login-email-error"
          class="uds-login-form__field-error"
          role="alert"
        >
          {{ fieldErrors.email }}
        </p>
      </div>

      <!-- Password -->
      <div class="uds-login-form__field">
        <label class="uds-login-form__label" for="uds-login-password">
          {{ passwordLabel }}
          <span class="uds-login-form__required" aria-hidden="true"> *</span>
        </label>
        <input
          id="uds-login-password"
          v-model="password"
          type="password"
          :class="['uds-login-form__input', fieldErrors.password && 'uds-login-form__input--error'].filter(Boolean).join(' ')"
          :aria-invalid="!!fieldErrors.password"
          :aria-describedby="fieldErrors.password ? 'uds-login-password-error' : undefined"
          required
          autocomplete="current-password"
          :disabled="loading"
        />
        <p
          v-if="fieldErrors.password"
          id="uds-login-password-error"
          class="uds-login-form__field-error"
          role="alert"
        >
          {{ fieldErrors.password }}
        </p>
      </div>
    </div>

    <!-- Remember me + Forgot password row -->
    <div v-if="showRememberMe || onForgotPassword" class="uds-login-form__options">
      <label v-if="showRememberMe" class="uds-login-form__remember">
        <input
          v-model="rememberMe"
          type="checkbox"
          :disabled="loading"
        />
        <span>{{ rememberMeLabel }}</span>
      </label>
      <button
        v-if="onForgotPassword"
        type="button"
        class="uds-login-form__link"
        :disabled="loading"
        @click="onForgotPassword"
      >
        {{ forgotPasswordLabel }}
      </button>
    </div>

    <!-- Submit -->
    <button
      type="submit"
      :class="['uds-login-form__submit', loading && 'uds-login-form__submit--loading'].filter(Boolean).join(' ')"
      :disabled="loading"
      :aria-busy="loading"
    >
      <span v-if="loading" class="uds-login-form__spinner" aria-hidden="true" />
      {{ submitLabel }}
    </button>

    <!-- Extra content slot -->
    <slot />

    <!-- Sign-up link -->
    <p v-if="onSignUp" class="uds-login-form__signup">
      <button type="button" class="uds-login-form__link" @click="onSignUp">
        {{ signUpLabel }}
      </button>
    </p>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, type VNode } from 'vue';

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
  icon?: VNode;
  /** Callback when the social button is clicked. */
  onClick: () => void;
}

export interface LoginFormProps {
  /** Form heading. @default 'Sign in' */
  title?: string;
  /** Optional description below the heading. */
  description?: string;

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

const props = withDefaults(defineProps<LoginFormProps>(), {
  title: 'Sign in',
  socialDividerLabel: 'or continue with',
  loading: false,
  showRememberMe: true,
  emailLabel: 'Email',
  passwordLabel: 'Password',
  rememberMeLabel: 'Remember me',
  forgotPasswordLabel: 'Forgot password?',
  submitLabel: 'Sign in',
  signUpLabel: "Don't have an account? Sign up",
});

const emit = defineEmits<{
  submit: [data: LoginFormData];
}>();

const formRef = ref<HTMLFormElement | null>(null);

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const fieldErrors = reactive<{ email?: string; password?: string }>({});

const classes = computed(() => 'uds-login-form');

const hasSocial = computed(
  () => props.socialProviders && props.socialProviders.length > 0,
);

function validate(): boolean {
  fieldErrors.email = undefined;
  fieldErrors.password = undefined;

  if (!email.value.trim()) {
    fieldErrors.email = `${props.emailLabel} is required`;
  }
  if (!password.value) {
    fieldErrors.password = `${props.passwordLabel} is required`;
  }

  return !fieldErrors.email && !fieldErrors.password;
}

function handleSubmit() {
  if (!validate()) return;
  emit('submit', {
    email: email.value.trim(),
    password: password.value,
    rememberMe: rememberMe.value,
  });
}

defineExpose({ el: formRef });
</script>
