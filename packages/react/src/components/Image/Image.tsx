import React from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  alt: string;
}

export const Image: React.FC<ImageProps> = ({ src, alt, fallback, className, onError, ...props }) => {
  const [errored, setErrored] = React.useState(false);
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setErrored(true);
    onError?.(e);
  };
  const classes = ['uds-image', className].filter(Boolean).join(' ');
  if (errored && fallback) return <div className={classes}>{fallback}</div>;
  return (
    <img
      src={src}
      alt={alt}
      className={classes}
      loading="lazy"
      onError={handleError}
      {...props}
    />
  );
};

Image.displayName = 'Image';
