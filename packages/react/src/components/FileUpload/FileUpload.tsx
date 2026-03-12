import React, { useState, useCallback, useRef } from 'react';

export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop'> {
  variant?: 'dropzone' | 'button' | 'avatar-upload';
  size?: 'sm' | 'md' | 'lg';
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  onUpload?: (files: File[]) => void;
  onRemove?: (file: File) => void;
  disabled?: boolean;
  label?: string;
}

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({ variant = 'dropzone', size = 'md', accept, maxSize, maxFiles, multiple, onUpload, onRemove, disabled, label, className, children, ...props }, ref) => {
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
      [maxSize, maxFiles, files.length]
    );

    const handleFiles = useCallback(
      (incoming: File[]) => {
        const valid = validateFiles(incoming);
        if (valid.length > 0) {
          setFiles((prev) => [...prev, ...valid]);
          onUpload?.(valid);
        }
      },
      [validateFiles, onUpload]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        const dropped = Array.from(e.dataTransfer.files);
        handleFiles(dropped);
      },
      [disabled, handleFiles]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          handleFiles(Array.from(e.target.files));
        }
      },
      [handleFiles]
    );

    const handleRemove = useCallback(
      (file: File) => {
        setFiles((prev) => prev.filter((f) => f !== file));
        onRemove?.(file);
      },
      [onRemove]
    );

    const classes = [
      'uds-file-upload',
      `uds-file-upload--${variant}`,
      `uds-file-upload--${size}`,
      dragOver && 'uds-file-upload--drag-over',
      disabled && 'uds-file-upload--disabled',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        <div
          className="uds-file-upload__zone"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={label || 'Upload files'}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) { e.preventDefault(); inputRef.current?.click(); } }}
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
                {variant === 'button' ? 'Choose file' : 'Drag and drop files here, or click to browse'}
              </p>
            </div>
          )}
        </div>
        {error && <p className="uds-file-upload__error" role="alert" aria-live="polite">{error}</p>}
        {files.length > 0 && (
          <ul className="uds-file-upload__list" aria-live="polite">
            {files.map((file, i) => (
              <li key={i} className="uds-file-upload__file">
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
  }
);

FileUpload.displayName = 'FileUpload';
