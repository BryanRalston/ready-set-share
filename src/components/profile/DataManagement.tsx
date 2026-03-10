'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  IoCloudDownloadOutline,
  IoCloudUploadOutline,
  IoGlobeOutline,
  IoCheckmarkCircle,
  IoDocumentOutline,
  IoCloseCircleOutline,
} from 'react-icons/io5';
import { useUser } from '@/lib/user-context';
import { downloadExport, importFromFile } from '@/lib/data-export';
import { generateLandingHTML } from '@/lib/landing-generator';
import { getPhotos } from '@/lib/photo-library';
import { getConnectedAccounts } from '@/lib/social-accounts';

type ExportState = 'idle' | 'exporting' | 'done';
type ImportState = 'idle' | 'importing' | 'success' | 'error';

export default function DataManagement() {
  const { businessName, businessDescription, businessType } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export state
  const [exportState, setExportState] = useState<ExportState>('idle');

  // Import state
  const [importState, setImportState] = useState<ImportState>('idle');
  const [importResult, setImportResult] = useState<string>('');
  const [importError, setImportError] = useState<string>('');

  // Download website state
  const [downloadingHtml, setDownloadingHtml] = useState(false);

  // Handle data export
  const handleExport = async () => {
    setExportState('exporting');
    try {
      await downloadExport();
      setExportState('done');
      setTimeout(() => setExportState('idle'), 2500);
    } catch {
      setExportState('idle');
    }
  };

  // Handle data import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportState('importing');
    setImportError('');
    setImportResult('');

    const result = await importFromFile(file);

    if (result.success) {
      const parts: string[] = [];
      if (result.imported.photos > 0) parts.push(`${result.imported.photos} photo${result.imported.photos !== 1 ? 's' : ''}`);
      if (result.imported.drafts > 0) parts.push(`${result.imported.drafts} draft${result.imported.drafts !== 1 ? 's' : ''}`);
      if (result.imported.accounts > 0) parts.push(`${result.imported.accounts} account${result.imported.accounts !== 1 ? 's' : ''}`);
      if (result.imported.settings) parts.push('settings restored');

      setImportResult(
        parts.length > 0
          ? `Imported! ${parts.join(', ')}.`
          : 'Backup loaded. No new data to import (everything was already present).'
      );
      setImportState('success');
    } else {
      setImportError(result.error || 'Import failed.');
      setImportState('error');
    }

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle website HTML download
  const handleDownloadWebsite = async () => {
    setDownloadingHtml(true);

    try {
      // Gather photos
      let photos: Array<{ base64: string; name?: string }> = [];
      try {
        const allPhotos = await getPhotos();
        photos = allPhotos.slice(0, 6).map((p) => ({
          base64: p.thumbnail || p.base64,
          name: p.name,
        }));
      } catch {
        // IndexedDB unavailable
      }

      // Gather connected accounts
      const socialAccounts = getConnectedAccounts();
      const socialLinks = socialAccounts
        .filter((a) => a.username)
        .map((a) => ({ platform: a.platform, username: a.username }));

      // Generate HTML
      const html = generateLandingHTML({
        businessName: businessName || 'My Business',
        businessDescription: businessDescription || '',
        businessType: businessType || 'other',
        photos,
        socialLinks,
      });

      // Create and trigger download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const slug = (businessName || 'my-business')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const filename = `${slug}-website.html`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silent fail
    }

    setDownloadingHtml(false);
  };

  return (
    <div className="space-y-5">
      {/* Download Website */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <IoGlobeOutline className="w-4 h-4 text-sage-500" />
          <h3 className="font-semibold text-brown text-sm">Download Your Website</h3>
        </div>
        <p className="text-xs text-brown-light mb-3 leading-relaxed">
          Save your landing page as an HTML file you can host anywhere — no GitHub needed.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="w-full gap-1.5"
          onClick={handleDownloadWebsite}
          loading={downloadingHtml}
        >
          <IoDocumentOutline className="w-3.5 h-3.5" />
          {downloadingHtml ? 'Generating...' : 'Download HTML'}
        </Button>
      </Card>

      {/* Export / Import Data */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <IoCloudDownloadOutline className="w-4 h-4 text-sage-500" />
          <h3 className="font-semibold text-brown text-sm">Your Data</h3>
        </div>
        <p className="text-xs text-brown-light mb-3 leading-relaxed">
          Export your data to transfer between devices or as a backup.
        </p>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={handleExport}
            loading={exportState === 'exporting'}
          >
            {exportState === 'done' ? (
              <>
                <IoCheckmarkCircle className="w-3.5 h-3.5" />
                Downloaded!
              </>
            ) : (
              <>
                <IoCloudDownloadOutline className="w-3.5 h-3.5" />
                {exportState === 'exporting' ? 'Exporting...' : 'Download Backup'}
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={handleImportClick}
            loading={importState === 'importing'}
          >
            <IoCloudUploadOutline className="w-3.5 h-3.5" />
            {importState === 'importing' ? 'Importing...' : 'Import Backup'}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelected}
          className="hidden"
        />

        {/* Import status messages */}
        <AnimatePresence>
          {importState === 'success' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-600">
                <IoCheckmarkCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{importResult}</span>
              </div>
            </motion.div>
          )}

          {importState === 'error' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                <IoCloseCircleOutline className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{importError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
