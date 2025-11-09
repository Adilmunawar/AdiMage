import React from 'react';
import { DownloadIcon, SparklesIcon } from './Icons';

interface ResultDisplayProps {
    isLoading: boolean;
    error: string | null;
    generatedImage: string | null;
    variationImages: string[];
    isGeneratingVariations: boolean;
    onGenerateVariations: () => void;
}

const LoadingSpinner: React.FC<{text?: string}> = ({text = "Generating your masterpiece..."}) => (
    <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
        </div>
        <p className="text-slate-400 text-center">{text} <br/> This can take a moment.</p>
    </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, error, generatedImage, variationImages, isGeneratingVariations, onGenerateVariations }) => {
    const handleDownload = (imageUrl: string) => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ai-photostudio-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-center">
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg">
                    <p className="font-semibold">An Error Occurred</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }
    
    if (variationImages.length > 0) {
        return (
            <div className="w-full h-full flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-slate-300">Image Variations</h3>
                <div className="grid grid-cols-2 gap-3 flex-grow overflow-y-auto pr-2">
                    {variationImages.map((image, index) => (
                        <div key={index} className="relative group aspect-square bg-black/30 rounded-lg overflow-hidden">
                            <img src={image} alt={`Variation ${index + 1}`} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDownload(image)}
                                    className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                                    aria-label="Download variation"
                                >
                                    <DownloadIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                 <button
                    onClick={onGenerateVariations}
                    disabled={isGeneratingVariations}
                    className="relative w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg text-white transition-all duration-300 overflow-hidden group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <span className="absolute left-0 w-full h-full bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></span>
                    {isGeneratingVariations ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Generating...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            Generate More Variations
                        </>
                    )}
                </button>
            </div>
        );
    }

    if (generatedImage) {
        return (
            <div className="w-full h-full flex flex-col gap-4">
                <div className="aspect-square bg-black/30 rounded-lg overflow-hidden flex-grow relative">
                    {isGeneratingVariations && (
                        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                           <LoadingSpinner text="Generating variations..."/>
                        </div>
                    )}
                    <img src={generatedImage} alt="Generated result" className="w-full h-full object-contain" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                     <div className="relative p-px rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                         <button
                            onClick={() => handleDownload(generatedImage)}
                            className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-md hover:bg-slate-700 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Download
                        </button>
                     </div>
                    <button
                        onClick={onGenerateVariations}
                        disabled={isGeneratingVariations}
                         className="relative w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg text-white transition-all duration-300 overflow-hidden group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span className="absolute left-0 w-full h-full bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></span>
                        {isGeneratingVariations ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Generating...
                            </>
                        ) : (
                           <>
                            <SparklesIcon className="w-5 h-5" />
                            Generate Variations
                           </>
                        )}
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 border-2 border-slate-800 border-dashed rounded-lg p-8 relative overflow-hidden">
            <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <SparklesIcon className="w-12 h-12 mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-slate-400">Your AI masterpiece will appear here</h3>
            <p className="mt-1 text-sm">Fill out the details on the left and let the magic begin.</p>
        </div>
    );
};

export default ResultDisplay;
