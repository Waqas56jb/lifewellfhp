'use client';

import type { ReactNode } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { livePageUrl } from '@/lib/site';

export function PreviewShell({
  title,
  hint,
  livePath,
  onClose,
  children,
}: {
  title: string;
  hint?: string;
  livePath?: string | null;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overlay modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="card card-pad modal-card preview-modal">
        <div className="modal-head">
          <div>
            <p className="preview-kicker">Website preview</p>
            <h2>{title}</h2>
          </div>
          <div className="preview-head-actions">
            {livePath ? (
              <a className="btn btn-ghost" href={livePageUrl(livePath)} target="_blank" rel="noreferrer">
                <ExternalLink size={15} />
                Open live page
              </a>
            ) : null}
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close preview">
              <X size={18} />
            </button>
          </div>
        </div>
        <p className="preview-hint">
          {hint || 'This is how it will look on the public website. Visitors only see it after you click Save.'}
        </p>
        <div className="preview-canvas">{children}</div>
      </div>
    </div>
  );
}
