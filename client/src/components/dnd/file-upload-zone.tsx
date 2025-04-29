import { ChangeEvent, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';
import { UploadCloud, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const FILE_TYPE = 'file';

interface FileUploadZoneProps {
  onFilesAdded: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
  className?: string;
  supportedFileTypesText?: string;
}

/**
 * A component that allows users to upload files through drag and drop
 * or by selecting them from the file system
 */
export function FileUploadZone({
  onFilesAdded,
  maxFiles = 1,
  acceptedFileTypes = [],
  maxFileSizeMB = 5,
  className,
  supportedFileTypesText = 'Supported formats: All files'
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');

  // Convert maxFileSizeMB to bytes
  const maxFileSize = maxFileSizeMB * 1024 * 1024;

  // Function to validate files
  const validateFiles = useCallback((newFiles: File[]): boolean => {
    setError('');

    // Check if adding these files would exceed the maximum number of files
    if (files.length + newFiles.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} file${maxFiles !== 1 ? 's' : ''}`);
      return false;
    }

    // Check file types if acceptedFileTypes is provided
    if (acceptedFileTypes.length > 0) {
      const invalidFiles = newFiles.filter(file => 
        !acceptedFileTypes.some(type => file.type.includes(type))
      );
      if (invalidFiles.length > 0) {
        setError(`Invalid file type. Supported formats: ${acceptedFileTypes.join(', ')}`);
        return false;
      }
    }

    // Check file sizes
    const oversizedFiles = newFiles.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      setError(`File size exceeds the maximum allowed size of ${maxFileSizeMB}MB`);
      return false;
    }

    return true;
  }, [files.length, maxFiles, acceptedFileTypes, maxFileSize, maxFileSizeMB]);

  // Handle dropped files via react-dnd
  const handleFileDrop = useCallback((item: any) => {
    if (item && item.files && validateFiles(item.files)) {
      const newFiles = [...files, ...item.files];
      setFiles(newFiles);
      onFilesAdded(newFiles);
    }
  }, [files, onFilesAdded, validateFiles]);

  // Handle files selected via the file input
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (validateFiles(selectedFiles)) {
      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);
      onFilesAdded(newFiles);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  }, [files, onFilesAdded, validateFiles]);

  // Set up drop functionality
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: FILE_TYPE,
    drop: handleFileDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Remove a file from the list
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesAdded(newFiles);
  };

  const isActive = isOver && canDrop;

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      <div
        ref={drop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer flex flex-col items-center justify-center text-center',
          isActive 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-300 hover:border-primary/50',
          error ? 'border-red-500 bg-red-50' : ''
        )}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
          {files.length === 0 
            ? 'Drag & drop files here or click to browse'
            : `${files.length} file${files.length !== 1 ? 's' : ''} selected. Click or drag to add more.`
          }
        </p>
        <p className="text-xs text-gray-500">{supportedFileTypesText}</p>
        {maxFiles > 1 && (
          <p className="text-xs text-gray-500">{`You can upload up to ${maxFiles} files`}</p>
        )}
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple={maxFiles > 1}
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileSelect}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li 
              key={`${file.name}_${index}`}
              className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded border"
            >
              <div className="flex items-center">
                <File className="text-blue-500 mr-2 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium truncate max-w-[250px]">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)}KB</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeFile(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}