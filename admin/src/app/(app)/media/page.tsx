'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { ResourceManager } from '@/components/ResourceManager';
import { api } from '@/lib/api';

export default function Page() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [alt, setAlt] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setError('Choose an image file first.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Max file size is 4 MB.');
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    const reader = new FileReader();
    const content_base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = String(reader.result || '');
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });

    const res = await api('/api/admin/media/upload', {
      method: 'POST',
      body: JSON.stringify({
        title: title || file.name,
        alt_text: alt || null,
        folder: 'general',
        filename: file.name,
        mime_type: file.type,
        content_base64,
      }),
    });

    setUploading(false);
    if (!res.success) {
      setError(res.message || 'Upload failed');
      return;
    }
    setMessage('Image uploaded.');
    setTitle('');
    setAlt('');
    form.reset();
    setReloadKey((k) => k + 1);
  }

  useEffect(() => {
    // force remount of resource table after upload
  }, [reloadKey]);

  return (
    <div>
      <h1 className="page-title">Media</h1>
      <p className="page-sub">Upload photos (max 4 MB) for service cards, insurance logos, and page images.</p>

      <form className="card card-pad" style={{ marginBottom: '1rem' }} onSubmit={onUpload}>
        <h2 style={{ marginTop: 0 }}>Upload image</h2>
        {error ? <div className="error-banner">{error}</div> : null}
        {message ? <p className="muted">{message}</p> : null}
        <div className="form-grid two">
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="alt">Alt text</label>
            <input id="alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="file">Image file</label>
            <input id="file" name="file" type="file" accept="image/*" required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          <Upload size={16} />
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      <ResourceManager
        key={reloadKey}
        title="Uploaded files"
        subtitle="Copy a URL into Services, Insurance, or Homepage fields."
        endpoint="/api/admin/media"
        createDefaults={{ folder: 'general' }}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'folder', label: 'Folder' },
          { key: 'url', label: 'URL', render: (r) => String(r.url || '').slice(0, 48) },
        ]}
        fields={[
          { key: 'title', label: 'Title' },
          { key: 'url', label: 'File / CDN URL', full: true },
          { key: 'alt_text', label: 'Alt text', full: true },
          { key: 'mime_type', label: 'MIME type' },
          { key: 'folder', label: 'Folder' },
          { key: 'width', label: 'Width', type: 'number' },
          { key: 'height', label: 'Height', type: 'number' },
        ]}
      />
    </div>
  );
}
