'use client';
import React from 'react';
import { useState } from 'react';
import { Prisma } from '@prisma/client';
import { importBuyersFromCsvAction, exportBuyersToCsvAction, ImportResult } from '../app/buyers/actions';

type Props = {
  where: Prisma.BuyerWhereInput;
  orderBy: Prisma.BuyerOrderByWithRelationInput;
  isLoggedIn: boolean; // Control visibility based on login status
};

export function ImportExportControls({ where, orderBy, isLoggedIn }: Props) {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvData = await exportBuyersToCsvAction(where, orderBy);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `buyers-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };
  
  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target?.result as string;
      const result = await importBuyersFromCsvAction(csvData);
      setImportResult(result);
      setIsImporting(false);
      if (result.successCount > 0) {
        window.location.reload();
      }
    };
    reader.readAsText(file);
  };


  if (!isLoggedIn) {
    // If user is not logged in, don't render the import/export buttons
    return null;
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-x-2 whitespace-nowrap bg-white text-slate-700 px-4 py-2 rounded-md shadow-sm border border-slate-300 hover:bg-slate-50 text-sm font-medium"
        >
          <UploadIcon className="h-5 w-5" />
          Import
        </button>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-x-2 whitespace-nowrap bg-white text-slate-700 px-4 py-2 rounded-md shadow-sm border border-slate-300 hover:bg-slate-50 text-sm font-medium"
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : <><DownloadIcon className="h-5 w-5" /> Export</>}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Import Buyers from CSV</h2>
            
             <div className="mt-2 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" ref={fileInputRef} onChange={handleFileChange} disabled={isImporting} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">{fileName || "CSV up to 200 rows"}</p>
                </div>
              </div>

            {importResult && (
              <div className={`mt-4 p-4 rounded-md ${importResult.errors.length > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <p className={`font-semibold ${importResult.errors.length > 0 ? 'text-red-800' : 'text-green-800'}`}>
                    Processed {importResult.totalCount} rows. Successfully imported {importResult.successCount}.
                </p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2 text-sm text-red-700 max-h-48 overflow-y-auto">
                    <p className="font-bold">Validation Errors:</p>
                    <ul className="list-disc pl-5">
                      {importResult.errors.map((err, index) => (
                        <li key={index}>
                          Row {err.row}: {err.messages.join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => { setShowModal(false); setImportResult(null); setFileName(""); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Close
              </button>
               <button
                onClick={handleImport}
                disabled={isImporting || !fileInputRef.current?.files?.[0]}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {isImporting ? "Processing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
          <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
          <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
        </svg>
    );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
          <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 10-1.09-1.03L10.75 11.364V2.75z" />
          <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
        </svg>
    );
}