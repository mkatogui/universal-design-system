import type { Component, Snippet } from 'svelte';

// Button
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'destructive' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  class?: string;
  iconLeft?: Snippet;
  iconRight?: Snippet;
  children?: Snippet;
  [key: string]: any;
}
export declare const Button: Component<ButtonProps>;

// NavigationBar
export interface NavigationBarProps {
  variant?: 'standard' | 'minimal' | 'dark' | 'transparent';
  sticky?: boolean;
  blurOnScroll?: boolean;
  megaMenu?: boolean;
  darkModeToggle?: boolean;
  mobileOpen?: boolean;
  class?: string;
  children?: Snippet;
  ctaButton?: Snippet;
  [key: string]: any;
}
export declare const NavigationBar: Component<NavigationBarProps>;

// HeroSection
export interface HeroSectionProps {
  variant?: 'centered' | 'product-screenshot' | 'video-bg' | 'gradient-mesh' | 'search-forward' | 'split';
  size?: 'full' | 'compact';
  headline?: string;
  subheadline?: string;
  class?: string;
  children?: Snippet;
  cta?: Snippet;
  socialProof?: Snippet;
  visual?: Snippet;
  [key: string]: any;
}
export declare const HeroSection: Component<HeroSectionProps>;

// FeatureCard
export interface FeatureCardProps {
  variant?: 'icon-top' | 'image-top' | 'horizontal' | 'stat-card' | 'dashboard-preview';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  description?: string;
  link?: string;
  image?: string;
  imageAlt?: string;
  class?: string;
  icon?: Snippet;
  children?: Snippet;
  [key: string]: any;
}
export declare const FeatureCard: Component<FeatureCardProps>;

// PricingTable
export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta?: string;
  highlighted?: boolean;
}
export interface PricingTableProps {
  variant?: '2-column' | '3-column' | '4-column' | 'toggle';
  size?: 'standard' | 'compact';
  plans?: PricingPlan[];
  highlightedPlan?: string;
  billingPeriod?: 'monthly' | 'annual';
  onToggle?: (period: string) => void;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const PricingTable: Component<PricingTableProps>;

// SocialProofBar
export interface SocialProofLogo {
  src: string;
  alt: string;
  href?: string;
}
export interface SocialProofStat {
  value: string;
  label: string;
}
export interface SocialProofTestimonial {
  quote: string;
  author: string;
}
export interface SocialProofBarProps {
  variant?: 'logo-strip' | 'stats-counter' | 'testimonial-mini' | 'combined';
  size?: 'standard' | 'compact';
  logos?: SocialProofLogo[];
  stats?: SocialProofStat[];
  testimonials?: SocialProofTestimonial[];
  animated?: boolean;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const SocialProofBar: Component<SocialProofBarProps>;

// TestimonialCard
export interface TestimonialCardProps {
  variant?: 'quote-card' | 'video' | 'metric' | 'carousel';
  size?: 'sm' | 'md' | 'lg';
  quote?: string;
  avatar?: string;
  name?: string;
  title?: string;
  company?: string;
  rating?: number;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const TestimonialCard: Component<TestimonialCardProps>;

// Footer
export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}
export interface FooterProps {
  variant?: 'simple' | 'multi-column' | 'newsletter' | 'mega-footer';
  size?: 'standard' | 'compact';
  columns?: FooterColumn[];
  copyright?: string;
  class?: string;
  children?: Snippet;
  newsletter?: Snippet;
  legal?: Snippet;
  [key: string]: any;
}
export declare const Footer: Component<FooterProps>;

// CodeBlock
export interface CodeBlockTab {
  label: string;
  language: string;
  code: string;
}
export interface CodeBlockProps {
  variant?: 'syntax-highlighted' | 'terminal' | 'multi-tab';
  size?: 'sm' | 'md' | 'lg';
  language?: string;
  code?: string;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  tabs?: CodeBlockTab[];
  class?: string;
  [key: string]: any;
}
export declare const CodeBlock: Component<CodeBlockProps>;

// Modal
export interface ModalProps {
  variant?: 'confirmation' | 'task' | 'alert';
  size?: 'sm' | 'md' | 'lg';
  open?: boolean;
  title?: string;
  onClose?: () => void;
  class?: string;
  children?: Snippet;
  actions?: Snippet;
  [key: string]: any;
}
export declare const Modal: Component<ModalProps>;

// FormInput
export interface FormInputProps {
  variant?: 'text' | 'email' | 'password' | 'number' | 'search' | 'textarea';
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'focus' | 'error' | 'disabled' | 'readonly';
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: string;
  placeholder?: string;
  id?: string;
  class?: string;
  [key: string]: any;
}
export declare const FormInput: Component<FormInputProps>;

// Select
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectProps {
  variant?: 'native' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  options?: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  errorText?: string;
  value?: string;
  id?: string;
  class?: string;
  [key: string]: any;
}
export declare const Select: Component<SelectProps>;

// Checkbox
export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
  name?: string;
  value?: string;
  id?: string;
  class?: string;
  [key: string]: any;
}
export declare const Checkbox: Component<CheckboxProps>;

// Radio
export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface RadioProps {
  variant?: 'standard' | 'card';
  options?: RadioOption[];
  name?: string;
  value?: string;
  legend?: string;
  disabled?: boolean;
  class?: string;
  [key: string]: any;
}
export declare const Radio: Component<RadioProps>;

// ToggleSwitch
export interface ToggleSwitchProps {
  variant?: 'standard' | 'with-label';
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  id?: string;
  class?: string;
  onChange?: (checked: boolean) => void;
  [key: string]: any;
}
export declare const ToggleSwitch: Component<ToggleSwitchProps>;

// Alert
export interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const Alert: Component<AlertProps>;

// Badge
export interface BadgeProps {
  variant?: 'status' | 'count' | 'tag';
  size?: 'sm' | 'md';
  label?: string;
  color?: string;
  removable?: boolean;
  onRemove?: () => void;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const Badge: Component<BadgeProps>;

// Tabs
export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}
export interface TabsProps {
  variant?: 'line' | 'pill' | 'segmented';
  size?: 'sm' | 'md' | 'lg';
  tabs?: TabItem[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const Tabs: Component<TabsProps>;

// Accordion
export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}
export interface AccordionProps {
  variant?: 'single' | 'multi' | 'flush';
  items?: AccordionItem[];
  defaultExpanded?: string[];
  allowMultiple?: boolean;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const Accordion: Component<AccordionProps>;

// Breadcrumb
export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export interface BreadcrumbProps {
  variant?: 'standard' | 'truncated';
  items?: BreadcrumbItem[];
  separator?: string;
  maxItems?: number;
  class?: string;
  [key: string]: any;
}
export declare const Breadcrumb: Component<BreadcrumbProps>;

// Tooltip
export interface TooltipProps {
  variant?: 'simple' | 'rich';
  size?: 'sm' | 'md';
  content?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  class?: string;
  trigger?: Snippet;
  children?: Snippet;
  [key: string]: any;
}
export declare const Tooltip: Component<TooltipProps>;

// DropdownMenu
export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
}
export interface DropdownMenuProps {
  variant?: 'action' | 'context' | 'nav-sub';
  size?: 'sm' | 'md' | 'lg';
  items?: DropdownItem[];
  position?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  onSelect?: (itemId: string) => void;
  class?: string;
  trigger?: Snippet;
  [key: string]: any;
}
export declare const DropdownMenu: Component<DropdownMenuProps>;

// Avatar
export interface AvatarProps {
  variant?: 'image' | 'initials' | 'icon' | 'group';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  alt?: string;
  initials?: string;
  status?: 'online' | 'offline' | 'busy';
  fallback?: string;
  class?: string;
  icon?: Snippet;
  children?: Snippet;
  [key: string]: any;
}
export declare const Avatar: Component<AvatarProps>;

// Skeleton
export interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'table';
  size?: 'sm' | 'md' | 'lg';
  lines?: number;
  animated?: boolean;
  class?: string;
  [key: string]: any;
}
export declare const Skeleton: Component<SkeletonProps>;

// Toast
export interface ToastProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  duration?: number;
  action?: string;
  onDismiss?: () => void;
  onAction?: () => void;
  visible?: boolean;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const Toast: Component<ToastProps>;

// Pagination
export interface PaginationProps {
  variant?: 'numbered' | 'simple' | 'load-more' | 'infinite-scroll';
  size?: 'sm' | 'md';
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  class?: string;
  [key: string]: any;
}
export declare const Pagination: Component<PaginationProps>;

// DataTable
export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}
export interface DataTableProps {
  variant?: 'basic' | 'sortable' | 'selectable' | 'expandable';
  density?: 'compact' | 'default' | 'comfortable';
  columns?: DataTableColumn[];
  data?: Record<string, any>[];
  sortable?: boolean;
  selectable?: boolean;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  selectedRows?: Set<number>;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onSelect?: (selected: Set<number>) => void;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const DataTable: Component<DataTableProps>;

// DatePicker
export interface DatePickerProps {
  variant?: 'single' | 'range' | 'with-time';
  size?: 'md' | 'lg';
  value?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  locale?: string;
  placeholder?: string;
  label?: string;
  id?: string;
  onChange?: (value: string) => void;
  class?: string;
  [key: string]: any;
}
export declare const DatePicker: Component<DatePickerProps>;

// CommandPalette
export interface CommandAction {
  id: string;
  label: string;
  group?: string;
  shortcut?: string;
  icon?: string;
}
export interface CommandPaletteProps {
  open?: boolean;
  actions?: CommandAction[];
  groups?: string[];
  placeholder?: string;
  recentLimit?: number;
  onSelect?: (actionId: string) => void;
  onClose?: () => void;
  class?: string;
  [key: string]: any;
}
export declare const CommandPalette: Component<CommandPaletteProps>;

// ProgressIndicator
export interface ProgressIndicatorProps {
  variant?: 'bar' | 'circular' | 'stepper';
  size?: 'sm' | 'md' | 'lg';
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  indeterminate?: boolean;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const ProgressIndicator: Component<ProgressIndicatorProps>;

// SideNavigation
export interface SideNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: SideNavItem[];
}
export interface SideNavSection {
  title: string;
  items: SideNavItem[];
}
export interface SideNavigationProps {
  variant?: 'default' | 'collapsed' | 'with-sections';
  collapsed?: boolean;
  items?: SideNavItem[];
  sections?: SideNavSection[];
  activeItem?: string;
  onNavigate?: (itemId: string) => void;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const SideNavigation: Component<SideNavigationProps>;

// FileUpload
export interface FileUploadProps {
  variant?: 'dropzone' | 'button' | 'avatar-upload';
  size?: 'sm' | 'md' | 'lg';
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  state?: 'idle' | 'drag-over' | 'uploading' | 'success' | 'error';
  label?: string;
  onUpload?: (files: FileList) => void;
  onRemove?: (index: number) => void;
  class?: string;
  children?: Snippet;
  [key: string]: any;
}
export declare const FileUpload: Component<FileUploadProps>;
