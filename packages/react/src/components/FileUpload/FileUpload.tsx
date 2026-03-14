import React, { useCallback, useRef, useState } from 'react';

/**
 * Props for the {@link FileUpload} component.
 *
 * Extends native `<div>` attributes (with `onDrop` replaced).
 */
export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop'> {
  /** Upload interaction style. @default 'dropzone' */
  variant?: 'dropzone' | 'button' | 'avatar-upload';
  /** Controls the zone dimensions. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Accepted file types (MIME types or extensions, e.g. ".png,.jpg"). */
  accept?: string;
  /** Maximum file size in bytes. */
  maxSize?: number;
  /** Maximum number of files that can be uploaded. */
  maxFiles?: number;
  /** Allow selecting multiple files at once. */
  multiple?: boolean;
  /** Called with the validated files when new files are added. */
  onUpload?: (files: File[]) => void;
  /** Called when a file is removed from the list. */
  onRemove?: (file: File) => void;
  /** Disables the upload zone. */
  disabled?: boolean;
  /** Accessible label for the upload zone. @default 'Upload files' */
  label?: string;
}

/**
 * A file upload zone supporting drag-and-drop and click-to-browse,
 * with built-in file-size and file-count validation.
 *
 * Displays an uploaded file list with remove buttons.
 * Uses `role="button"` on the drop zone for keyboard accessibility,
 * and `role="alert"` / `aria-live` for error and file-list updates.
 *
 * Uses BEM class `uds-file-upload` with variant, size, drag-over,
 * and disabled modifiers.
 * Forwards its ref to the root `<div>` element.
 *
 * @example
 * ```tsx
 * <FileUpload
 *   accept=".png,.jpg"
 *   maxSize={5 * 1024 * 1024}
 *   onUpload={(files) => upload(files)}
 * />
 * ```
 */
export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      variant = 'dropzone',
      size = 'md',
      accept,
      maxSize,
      maxFiles,
      multiple,
      onUpload,
      onRemove,
      disabled,
      label,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [dragOver, setDragOver] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFiles = useCallback(
      (incoming: File[]): File[] => {
        setError(null);
        let valid = incoming;
        if (maxSize) {
          const oversized = valid.filter((f) => f.size > maxSize);
          if (oversized.length > 0) {
            setError(`File too large: ${oversized[0].name}`);
            valid = valid.filter((f) => f.size <= maxSize);
          }
        }
        if (maxFiles) {
          valid = valid.slice(0, maxFiles - files.length);
        }
        return valid;
      },
      [maxSize, maxFiles, files.length],
    );

    const handleFiles = useCallback(
      (incoming: File[]) => {
        const valid = validateFiles(incoming);
        if (valid.length > 0) {
          setFiles((prev) => [...prev, ...valid]);
          onUpload?.(valid);
        }
      },
      [validateFiles, onUpload],
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        const dropped = Array.from(e.dataTransfer.files);
        handleFiles(dropped);
      },
      [disabled, handleFiles],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          handleFiles(Array.from(e.target.files));
        }
      },
      [handleFiles],
    );

    const handleRemove = useCallback(
      (file: File) => {
        setFiles((prev) => prev.filter((f) => f !== file));
        onRemove?.(file);
      },
      [onRemove],
    );

    const classes = [
      'uds-file-upload',
      `uds-file-upload--${variant}`,
      `uds-file-upload--${size}`,
      dragOver && 'uds-file-upload--drag-over',
      disabled && 'uds-file-upload--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {/* NOSONAR typescript:S6819 — intentional role=button on div; drag-and-drop zone requires div semantics */}
        <div
          className="uds-file-upload__zone"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={label || 'Upload files'}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            className="uds-file-upload__input"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            aria-label={label || 'Upload files'}
            hidden
          />
          {children || (
            <div className="uds-file-upload__placeholder">
              <p className="uds-file-upload__text">
                {variant === 'button'
                  ? 'Choose file'
                  : 'Drag and drop files here, or click to browse'}
              </p>
            </div>
          )}
        </div>
        {error && (
          <p className="uds-file-upload__error" role="alert" aria-live="polite">
            {error}
          </p>
        )}
        {files.length > 0 && (
          <ul className="uds-file-upload__list" aria-live="polite">
            {files.map((file, i) => (
              <li key={`${file.name}-${i}`} className="uds-file-upload__file">
                <span className="uds-file-upload__file-name">{file.name}</span>
                <button
                  className="uds-file-upload__file-remove"
                  onClick={() => handleRemove(file)}
                  aria-label={`Remove ${file.name}`}
                  type="button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

FileUpload.displayName = 'FileUpload';
