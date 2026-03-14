import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from '../../packages/react/src/components/FileUpload/FileUpload';

const makeFile = (name: string, size: number, type = 'image/png') =>
  new File(['x'.repeat(size)], name, { type });

describe('FileUpload', () => {
  it('renders the drop zone with default label', () => {
    render(<FileUpload />);
    expect(screen.getByRole('button', { name: 'Upload files' })).toBeInTheDocument();
  });

  it('renders a custom label', () => {
    render(<FileUpload label="Drop images here" />);
    expect(screen.getByRole('button', { name: 'Drop images here' })).toBeInTheDocument();
  });

  it('applies BEM class modifiers for variant and size', () => {
    const { container } = render(<FileUpload variant="button" size="lg" />);
    const root = container.querySelector('.uds-file-upload');
    expect(root).toHaveClass('uds-file-upload--button');
    expect(root).toHaveClass('uds-file-upload--lg');
  });

  it('applies the disabled modifier class when disabled', () => {
    const { container } = render(<FileUpload disabled />);
    const root = container.querySelector('.uds-file-upload');
    expect(root).toHaveClass('uds-file-upload--disabled');
  });

  it('applies additional className to the root element', () => {
    const { container } = render(<FileUpload className="my-upload" />);
    expect(container.querySelector('.uds-file-upload')).toHaveClass('my-upload');
  });

  it('calls onUpload with the dropped files', () => {
    const handleUpload = vi.fn();
    render(<FileUpload onUpload={handleUpload} />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    const file = makeFile('photo.png', 100);
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(handleUpload).toHaveBeenCalledWith([file]);
  });

  it('shows the dropped file name in the file list', () => {
    render(<FileUpload />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    const file = makeFile('document.pdf', 200);
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });

  it('shows a remove button for each uploaded file', () => {
    render(<FileUpload />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    fireEvent.drop(zone, { dataTransfer: { files: [makeFile('a.png', 100)] } });
    expect(screen.getByRole('button', { name: 'Remove a.png' })).toBeInTheDocument();
  });

  it('removes a file when its remove button is clicked', () => {
    const handleRemove = vi.fn();
    render(<FileUpload onRemove={handleRemove} />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    const file = makeFile('removeme.png', 100);
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Remove removeme.png' }));
    expect(screen.queryByText('removeme.png')).not.toBeInTheDocument();
    expect(handleRemove).toHaveBeenCalledWith(file);
  });

  it('shows an error when a file exceeds maxSize', () => {
    render(<FileUpload maxSize={50} />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    const bigFile = makeFile('big.png', 100);
    fireEvent.drop(zone, { dataTransfer: { files: [bigFile] } });
    expect(screen.getByRole('alert')).toHaveTextContent('File too large: big.png');
  });

  it('does not add oversized files to the file list', () => {
    render(<FileUpload maxSize={50} />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    fireEvent.drop(zone, { dataTransfer: { files: [makeFile('big.png', 100)] } });
    expect(screen.queryByText('big.png')).not.toBeInTheDocument();
  });

  it('respects maxFiles limit', () => {
    const handleUpload = vi.fn();
    render(<FileUpload maxFiles={2} onUpload={handleUpload} />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    const files = [makeFile('a.png', 10), makeFile('b.png', 10), makeFile('c.png', 10)];
    fireEvent.drop(zone, { dataTransfer: { files } });
    // onUpload is called with valid files (up to maxFiles)
    const uploaded: File[] = handleUpload.mock.calls[0][0];
    expect(uploaded.length).toBeLessThanOrEqual(2);
  });

  it('sets drag-over class on dragOver and removes it on dragLeave', () => {
    const { container } = render(<FileUpload />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    fireEvent.dragOver(zone);
    expect(container.querySelector('.uds-file-upload')).toHaveClass('uds-file-upload--drag-over');
    fireEvent.dragLeave(zone);
    expect(container.querySelector('.uds-file-upload')).not.toHaveClass(
      'uds-file-upload--drag-over',
    );
  });

  it('does not trigger upload when disabled', () => {
    const handleUpload = vi.fn();
    render(<FileUpload disabled onUpload={handleUpload} />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    fireEvent.drop(zone, { dataTransfer: { files: [makeFile('file.png', 100)] } });
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it('forwards a ref object to the root div element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<FileUpload ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('uds-file-upload');
  });

  it('forwards a callback ref to the root div element', () => {
    const callbackRef = vi.fn();
    render(<FileUpload ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });

  it('shows "button" variant placeholder text', () => {
    render(<FileUpload variant="button" />);
    expect(screen.getByText('Choose file')).toBeInTheDocument();
  });

  it('shows dropzone variant placeholder text by default', () => {
    render(<FileUpload />);
    expect(screen.getByText('Drag and drop files here, or click to browse')).toBeInTheDocument();
  });

  it('calls onUpload when files are selected via the input change event', () => {
    const handleUpload = vi.fn();
    const { container } = render(<FileUpload onUpload={handleUpload} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('via-input.png', 100);
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);
    expect(handleUpload).toHaveBeenCalledWith([file]);
  });

  it('triggers input click on Enter key press on the zone', () => {
    const { container } = render(<FileUpload />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    fireEvent.keyDown(zone, { key: 'Enter' });
    expect(clickSpy).toHaveBeenCalled();
  });

  it('triggers input click on Space key press on the zone', () => {
    const { container } = render(<FileUpload />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    fireEvent.keyDown(zone, { key: ' ' });
    expect(clickSpy).toHaveBeenCalled();
  });

  it('does not trigger input click on Enter key when disabled', () => {
    const { container } = render(<FileUpload disabled />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    fireEvent.keyDown(zone, { key: 'Enter' });
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('triggers input click when the zone button is clicked while not disabled', () => {
    const { container } = render(<FileUpload />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    fireEvent.click(zone);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('does not trigger input click when the zone button is clicked while disabled', () => {
    const { container } = render(<FileUpload disabled />);
    const zone = screen.getByRole('button', { name: 'Upload files' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    fireEvent.click(zone);
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
