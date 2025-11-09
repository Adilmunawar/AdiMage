import React, { useState, useCallback } from 'react';
import type { UploadedImage } from '../types';
import { generateEditedImage } from '../services/geminiService';
import ImageUploader from '../components/ImageUploader';
import ResultDisplay from '../components/ResultDisplay';
import { SparklesIcon, ArrowLeftIcon, UserCircleIcon, CameraIcon, PhotoIcon } from '../components/Icons';
import type { Page } from '../App';

interface PhotoStudioProps {
  onBackToHome: () => void;
  mode: Exclude<Page, 'home'>;
}

const templateConfigs = {
  photoStudio: {
    title: "Photo Studio",
    Icon: SparklesIcon,
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    defaultPrompt: "A professional, well-lit studio portrait with a neutral grey background.",
    description: "Add images and specify age for realistic height scaling.",
  },
  profilePicturePro: {
    title: "Profile Picture Pro",
    Icon: UserCircleIcon,
    iconColor: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
    defaultPrompt: "A professional, corporate headshot suitable for a social media profile. The background is a simple, out-of-focus office setting. The lighting is flattering and highlights the person's face.",
    description: "Generate a professional headshot. For best results, upload one clear photo of the subject.",
  },
  vintageCamera: {
    title: "Vintage Camera",
    Icon: CameraIcon,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    defaultPrompt: "A vintage photograph from the 1970s, captured on grainy 35mm film with a classic analog camera. The colors are slightly faded and warm, with a soft vignette effect.",
    description: "Apply classic film effects and retro styles to your photos.",
  },
  backgroundScene: {
    title: "Background Scene",
    Icon: PhotoIcon,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    defaultPrompt: "The people are standing together on a scenic mountain overlook at sunset, enjoying the view.",
    description: "Place your subjects in entirely new and creative environments.",
  },
};


const PhotoStudio: React.FC<PhotoStudioProps> = ({ onBackToHome, mode }) => {
  const config = templateConfigs[mode];
  
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState<string>(config.defaultPrompt);
  const [negativePrompt, setNegativePrompt] = useState<string>("blurry, deformed, extra limbs, poorly drawn, text, watermark, ugly, disfigured");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [variationImages, setVariationImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1' | '16:9'>('4:5');

  const handleImagesUpload = useCallback((images: UploadedImage[]) => {
    setUploadedImages(images);
  }, []);
  
  const buildFinalPrompt = useCallback(() => {
    const aspectRatioMap = {
      '4:5': 'a 4:5 portrait aspect ratio',
      '1:1': 'a 1:1 square aspect ratio',
      '16:9': 'a 16:9 landscape aspect ratio',
    };
    const aspectRatioInstruction = `The final image must have ${aspectRatioMap[aspectRatio]}.`;

    if (mode === 'profilePicturePro' && uploadedImages.length > 0) {
        const person = uploadedImages[0]; // Only consider the first person
        const ageInfo = person.age ? `who is ${person.age} years old` : 'of unknown age';
        const personDescription = `- A person ${ageInfo}. IMPORTANT: You must retain their original clothing, hairstyle, and distinct facial features from their photo. The final result must be a head-and-shoulders composition.`;

        return `
**TASK**: Create a single, photorealistic, professional headshot of the person from the provided image.

**PERSON TO FEATURE**:
${personDescription}

**SCENE DESCRIPTION**:
${prompt}

**ASPECT RATIO**:
${aspectRatioInstruction}

**NEGATIVE PROMPT (Things to AVOID)**:
Do not include any of the following: ${negativePrompt}.
        `.trim();
    }

    const personDescriptions = uploadedImages.map((image, index) => {
      const ageInfo = image.age ? `who is ${image.age} years old` : 'of unknown age';
      return `- Person ${index + 1} (from image ${index + 1}): A person ${ageInfo}. IMPORTANT: You must retain their original clothing, hairstyle, and distinct facial features from their photo.`;
    }).join('\n');

    let taskDescription = "Create a single, cohesive, photorealistic image featuring ALL the people from the provided images.";
    if (mode === 'vintageCamera') {
        taskDescription = "Apply a vintage camera effect to the provided photo(s), creating a single, cohesive, retro-styled image."
    } else if (mode === 'backgroundScene') {
        taskDescription = "Place the people from the provided photos into a new scene, creating a single, cohesive, photorealistic image."
    }

    return `
**TASK**: ${taskDescription}

**PEOPLE TO INCLUDE**:
${personDescriptions}

**SCENE DESCRIPTION**:
${prompt}

**ARRANGEMENT & SCALING INSTRUCTIONS**:
- Arrange all individuals in a natural, believable pose suitable for the scene.
- **CRITICAL**: If multiple people are present, use the provided ages to ensure realistic height and body proportions relative to one another. Younger individuals must be visibly shorter than adults.
- Ensure consistent lighting, shadows, and color grading across all subjects to make them look like they were photographed together in the same environment.
- The final composition should be clean and well-composed.

**ASPECT RATIO**:
${aspectRatioInstruction}

**NEGATIVE PROMPT (Things to AVOID)**:
Do not include any of the following: ${negativePrompt}.
    `.trim();
  }, [uploadedImages, prompt, negativePrompt, aspectRatio, mode]);


  const handleGenerate = async () => {
    if (uploadedImages.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setVariationImages([]);

    try {
      const imagesForApi = mode === 'profilePicturePro' && uploadedImages.length > 0 ? [uploadedImages[0]] : uploadedImages;
      const base64Images = imagesForApi.map(img => img.base64);
      const finalPrompt = buildFinalPrompt();
      const result = await generateEditedImage(base64Images, finalPrompt);
      setGeneratedImage(result);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateVariations = async () => {
    if (uploadedImages.length === 0 || !prompt.trim() || !generatedImage) {
      setError("Original image and settings are required to generate variations.");
      return;
    }

    setIsGeneratingVariations(true);
    setError(null);

    try {
      const imagesForApi = mode === 'profilePicturePro' && uploadedImages.length > 0 ? [uploadedImages[0]] : uploadedImages;
      const base64Images = imagesForApi.map(img => img.base64);
      const finalPrompt = buildFinalPrompt();
      
      const variationPromises = Array(4).fill(0).map(() => 
        generateEditedImage(base64Images, finalPrompt)
      );
      
      const results = await Promise.all(variationPromises);
      setVariationImages([generatedImage, ...results]);

    } catch (e: any) {
      setError(e.message || "Failed to generate variations.");
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
       <header className="py-4 px-4 sm:px-8 border-b border-slate-700/50 flex items-center gap-4 sticky top-0 bg-slate-900/80 backdrop-blur-md z-20">
            <button onClick={onBackToHome} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Back to home">
                <ArrowLeftIcon className="w-6 h-6 text-slate-300" />
            </button>
            <div className="flex items-center gap-3">
                <div className={`p-2 ${config.bgColor} rounded-lg`}>
                    <config.Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-50">AdiFlux - {config.title}</h1>
            </div>
        </header>
      
      <main className="flex-grow p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Panel: Inputs */}
          <div className="flex flex-col gap-6 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <div>
              <h2 className="text-lg font-semibold mb-1">1. Upload Photos</h2>
              <p className="text-sm text-slate-400 mb-4">{config.description}</p>
              <ImageUploader onImagesUpload={handleImagesUpload} />
              {mode === 'profilePicturePro' && uploadedImages.length > 1 && (
                <div className="mt-3 text-xs text-amber-400 bg-amber-900/30 border border-amber-500/30 p-2 rounded-md">
                    <strong>Note:</strong> Profile Picture Pro mode only uses the first uploaded image to generate a headshot.
                </div>
              )}
            </div>
            
            <div className="border-t border-slate-700"></div>

            <div>
              <h2 className="text-lg font-semibold mb-1">2. Describe The Scene</h2>
              <p className="text-sm text-slate-400 mb-4">Describe the background and style of your portrait.</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A professional, well-lit studio portrait with a neutral grey background."
                className="w-full h-24 p-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                disabled={isLoading || isGeneratingVariations}
              />
            </div>
            
            <div className="border-t border-slate-700"></div>

            <div>
              <h2 className="text-lg font-semibold mb-1">3. Select Aspect Ratio</h2>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {(['4:5', '1:1', '16:9'] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    disabled={isLoading || isGeneratingVariations}
                    className={`py-2.5 px-2 rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2 ${
                      aspectRatio === ratio
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    {
                      {
                        '4:5': 'Portrait (4:5)',
                        '1:1': 'Square (1:1)',
                        '16:9': 'Landscape (16:9)'
                      }[ratio]
                    }
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-700"></div>
            
            <div>
              <h2 className="text-lg font-semibold mb-1">4. Things to Avoid (Optional)</h2>
              <p className="text-sm text-slate-400 mb-4">Use a negative prompt to exclude unwanted elements.</p>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="e.g., blurry faces, extra fingers..."
                className="w-full h-24 p-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                disabled={isLoading || isGeneratingVariations}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || isGeneratingVariations || uploadedImages.length === 0}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                 <SparklesIcon className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>
          </div>

          {/* Right Panel: Output */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 min-h-[400px] lg:min-h-0 lg:sticky lg:top-24">
             <ResultDisplay 
                isLoading={isLoading} 
                error={error} 
                generatedImage={generatedImage}
                variationImages={variationImages}
                isGeneratingVariations={isGeneratingVariations}
                onGenerateVariations={handleGenerateVariations}
              />
          </div>
        </div>
      </main>

       <footer className="text-center py-4 px-4 sm:px-8 text-xs text-slate-500 border-t border-slate-700/50">
        <p>Proudly Developed by Adil Munawar</p>
      </footer>
    </div>
  );
};

export default PhotoStudio;