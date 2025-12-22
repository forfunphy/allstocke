import React, { useRef } from 'react';
import { Upload, HardDrive } from 'lucide-react';

interface FileUploadProps {
  onDataLoaded: (csvContent: string, fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          onDataLoaded(text, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-900/20 group"
      >
        <Upload className="w-5 h-5 text-blue-200 group-hover:text-white" />
        <span>上傳股票 CSV</span>
      </button>

      <a
        href="https://drive.google.com/drive/u/0/folders/1-9H-hkbIFNmdEECVZieNv7VrqPj4y9u5"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium py-3 px-4 rounded-lg border border-slate-700 transition-colors group"
      >
        <HardDrive className="w-5 h-5 text-slate-500 group-hover:text-white" />
        <span>雲端硬碟範例檔</span>
      </a>
    </div>
  );
};

export default FileUpload;