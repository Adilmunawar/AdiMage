import React, { useCallback, useState } from 'react';
import type { UploadedImage } from '../types';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImagesUpload: (images: UploadedImage[]) => void;
  showAgeInput?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUpload, showAgeInput = false }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) {
      setImages([]);
      onImagesUpload([]);
      return;
    }

    const fileArray = Array.from(files);
    const uploadedImages: UploadedImage[] = [];

    let filesProcessed = 0;
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        uploadedImages.push({ file, base64: base64String, age: '' });
        filesProcessed++;
        if (filesProcessed === fileArray.length) {
          setImages(uploadedImages);
          onImagesUpload(uploadedImages);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [onImagesUpload]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  };
  
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-indigo-400', 'scale-105');
    handleFileChange(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const onDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-indigo-400', 'scale-105');
  }
  
  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-indigo-400', 'scale-105');
  }

  const handleAgeChange = (index: number, age: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], age };
    setImages(newImages);
    onImagesUpload(newImages);
  };

  const handleClear = () => {
    setImages([]);
    onImagesUpload([]);
    // Reset file input value
    const input = document.getElementById('file-upload') as HTMLInputElement;
    if(input) input.value = '';
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-slate-700/80 border-dashed rounded-xl cursor-pointer bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300 ease-in-out transform hover:scale-[1.02] overflow-hidden"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
      >
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #4f46e5 0%, transparent 60%)` }}></div>
        <div className="relative z-10 flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className="w-8 h-8 mb-4 text-slate-400" />
          <p className="mb-2 text-sm text-slate-300">
            <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500">PNG, JPG, or WEBP</p>
        </div>
        <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={onFileChange} />
      </label>
      {images.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-300">Uploaded Images ({images.length})</h3>
            <button onClick={handleClear} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="aspect-square bg-slate-800/50 rounded-md overflow-hidden relative group transition-transform duration-200 hover:scale-105">
                <img src={image.base64} alt={`preview ${index}`} className="w-full h-full object-cover" />
                 {showAgeInput && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                        <label htmlFor={`age-${index}`} className="sr-only">Age</label>
                        <input
                        id={`age-${index}`}
                        type="number"
                        placeholder="Age?"
                        value={image.age || ''}
                        onChange={(e) => handleAgeChange(index, e.target.value)}
                        className="w-full bg-transparent text-white text-xs text-center border-0 focus:ring-0 p-0.5 placeholder-slate-300"
                        min="0"
                        max="150"
                        />
                    </div>
                 )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
