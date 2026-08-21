'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { ResourceManager } from '@/components/ResourceManager';
import { MediaPreview } from '@/components/SitePreviews';
import { api } from '@/lib/api';
import { MEDIA_LIBRARY_HINT } from '@/lib/placements';
import { publicAssetUrl } from '@/lib/site';

export default function Page() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [alt, setAlt] = useState('');
  const [localPreview, setLocalPreview] = useState<string | null>(null);
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
    setMessage('Image stored in the library. Attach the URL to a service, insurance plan, homepage, or logo, then Save there — that is when visitors see it.');
    setTitle('');
    setAlt('');
    setLocalPreview(null);
    form.reset();
    setReloadKey((k) => k + 1);
  }

  useEffect(() => {
    // remount list after upload
  }, [reloadKey]);

  return (
    <div>
      <h1 className="page-title">Media</h1>
      <p className="page-sub">{MEDIA_LIBRARY_HINT}</p>

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
            <input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              required
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  setLocalPreview(null);
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setLocalPreview(String(reader.result || ''));
                reader.readAsDataURL(file);
              }}
            />
          </div>
        </div>
        {localPreview ? (
          <div className="upload-preview">
            <p className="preview-kicker">File preview (not on the website yet)</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={localPreview} alt={alt || title || 'Upload preview'} />
          </div>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          <Upload size={16} />
          {uploading ? 'Uploading…' : 'Upload to library'}
        </button>
      </form>

      <ResourceManager
        key={reloadKey}
        title="Uploaded files"
        subtitle="Preview shows the image and every page it is attached to. Copy the URL into Services, Insurance, Homepage, or Appearance."
        endpoint="/api/admin/media"
        createDefaults={{ folder: 'general' }}
        itemLabel={(r) => String(r.title || 'Image')}
        preview={{
          hint: MEDIA_LIBRARY_HINT,
          liveHref: () => '/our-services',
          render: (form) => (
            <MediaPreview
              url={String(form.url || '')}
              title={String(form.title || '')}
              alt={form.alt_text ? String(form.alt_text) : null}
            />
          ),
        }}
        columns={[
          {
            key: 'url',
            label: 'Preview',
            render: (r) =>
              r.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publicAssetUrl(String(r.url))} alt="" className="table-thumb" />
              ) : (
                '—'
              ),
          },
          { key: 'title', label: 'Title' },
          { key: 'folder', label: 'Folder' },
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
