import React, { useState, useCallback } from 'react';
import type { UploadedImage } from '../types';
import { generateEditedImage } from '../services/geminiService';
import ImageUploader from '../components/ImageUploader';
import ResultDisplay from '../components/ResultDisplay';
import { 
  SparklesIcon, ArrowLeftIcon, UserCircleIcon, CameraIcon, PhotoIcon, PencilSquareIcon, WandSparklesIcon, TagIcon, PaintBrushIcon, UploadIcon 
} from '../components/Icons';
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
  textToImage: {
    title: "Text-to-Image Studio",
    Icon: PencilSquareIcon,
    iconColor: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    defaultPrompt: "A photorealistic, highly detailed image of a futuristic city at night, with flying vehicles and neon signs, cinematic lighting.",
    description: "Generate a new image from scratch based on your text description.",
  },
  photoRestoration: {
    title: "AI Photo Restoration",
    Icon: WandSparklesIcon,
    iconColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    defaultPrompt: "Please restore this photo. Remove scratches, improve clarity, and enhance the colors.",
    description: "Repair old, damaged, or faded photos. Upload one photo to restore.",
  },
  productStudio: {
    title: "AI Product Studio",
    Icon: TagIcon,
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    defaultPrompt: "a clean, solid white background.",
    description: "Create professional product shots. Upload one product photo to begin.",
  },
  styleTransfer: {
    title: "AI Style Transfer",
    Icon: PaintBrushIcon,
    iconColor: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    defaultPrompt: "Apply the artistic style.",
    description: "Transfer the style from one image to another. Upload a content image and a style image.",
  },
};

const SingleImageUploader: React.FC<{onImageUpload: (image: UploadedImage) => void; uploadedImage: UploadedImage | null; title: string;}> = ({onImageUpload, uploadedImage, title}) => {
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                onImageUpload({ file, base64: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <input type="file" id="style-image-upload" className="hidden" onChange={onFileChange} accept="image/*" />
            <label htmlFor="style-image-upload" className="w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center">
                {uploadedImage ? (
                    <img src={uploadedImage.base64} alt="Style preview" className="w-full h-full object-contain p-1 rounded-lg" />
                ) : (
                    <div className="text-center">
                        <UploadIcon className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-300">{title}</span>
                    </div>
                )}
            </label>
        </div>
    );
};


const PhotoStudio: React.FC<PhotoStudioProps> = ({ onBackToHome, mode }) => {
  const config = templateConfigs[mode];
  
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [styleImage, setStyleImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState<string>(config.defaultPrompt);
  const [negativePrompt, setNegativePrompt] = useState<string>("blurry, deformed, extra limbs, poorly drawn, text, watermark, ugly, disfigured, mutated, missing limbs");
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
    const negativePromptInstruction = `Do not include any of the following: ${negativePrompt}.`;

    switch (mode) {
      case 'textToImage':
        return `
**TASK**: Create a new image from scratch based on the following description.
**PROMPT**: ${prompt}
**ASPECT RATIO**: ${aspectRatioInstruction}
**NEGATIVE PROMPT**: ${negativePromptInstruction}
        `.trim();
      
      case 'photoRestoration':
        return `
**TASK**: Restore the provided photograph.
**ANALYSIS**: The image may be old, faded, blurry, or have physical damage like scratches, tears, or dust marks.
**GOAL**: 
1. **Repair Damage**: Seamlessly remove all scratches, creases, and imperfections.
2. **Enhance Clarity**: Improve focus and sharpness, especially on faces and key subjects.
3. **Correct Colors**: Restore faded colors to their original vibrancy.
4. **Reduce Noise**: Clean up film grain or digital noise without losing important texture.
**CONSTRAINTS**: The final output must look like a high-quality, professionally restored version of the original photo. Do not change the composition, subjects, or clothing.
**ASPECT RATIO**: ${aspectRatioInstruction}
**NEGATIVE PROMPT**: ${negativePromptInstruction}
        `.trim();

      case 'productStudio':
        return `
**TASK**: Create a professional e-commerce product shot.
**INPUT**: An image of a product.
**ACTION**: 
1. Isolate the primary product from its background.
2. Remove the original background completely.
3. Place the isolated product onto a new background as described in the SCENE DESCRIPTION.
4. Render realistic lighting and soft shadows on the product that are consistent with the new background.
**OUTPUT**: A photorealistic, high-resolution image suitable for a product listing or advertisement.
**SCENE DESCRIPTION**: ${prompt}
**ASPECT RATIO**: ${aspectRatioInstruction}
**NEGATIVE PROMPT**: ${negativePromptInstruction}
        `.trim();

      case 'styleTransfer':
        return `
**TASK**: Perform artistic style transfer.
**INPUTS**: 
- The first uploaded image is the 'Content Image'.
- The second uploaded image is the 'Style Image'.
**GOAL**: Re-create the 'Content Image' by applying the artistic style of the 'Style Image'.
**STYLE ANALYSIS**: From the 'Style Image', extract its color palette, brushstroke patterns, texture, lighting, and overall composition mood.
**CONTENT PRESERVATION**: The final image must clearly retain the recognizable subjects, shapes, and arrangement from the 'Content Image'.
**OUTPUT**: A new image that is a fusion of the content from the first image and the style of the second.
**ASPECT RATIO**: ${aspectRatioInstruction}
**NEGATIVE PROMPT**: ${negativePromptInstruction}
        `.trim();

      case 'profilePicturePro': {
        const person = uploadedImages[0];
        const ageInfo = person?.age ? `who is ${person.age} years old` : 'of unknown age';
        const personDescription = `- A person ${ageInfo}. IMPORTANT: You must retain their original clothing, hairstyle, and distinct facial features from their photo. The final result must be a head-and-shoulders composition.`;
        return `
**TASK**: Create a single, photorealistic, professional headshot of the person from the provided image.
**PERSON TO FEATURE**:
${personDescription}
**SCENE DESCRIPTION**:
${prompt}
**ASPECT RATIO**: ${aspectRatioInstruction}
**NEGATIVE PROMPT**: ${negativePromptInstruction}
        `.trim();
      }

      default: { // Covers photoStudio, vintageCamera, backgroundScene
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
**ASPECT RATIO**: ${aspectRatioInstruction}
**NEGATIVE PROMPT**: ${negativePromptInstruction}
        `.trim();
      }
    }
  }, [uploadedImages, styleImage, prompt, negativePrompt, aspectRatio, mode]);


  const handleGenerate = async () => {
    if (mode !== 'textToImage' && uploadedImages.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    if (mode === 'styleTransfer' && !styleImage) {
      setError("Please upload a style image.");
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
      let imagesForApi: UploadedImage[] = [];
      if (mode === 'profilePicturePro' || mode === 'photoRestoration' || mode === 'productStudio') {
        imagesForApi = uploadedImages.length > 0 ? [uploadedImages[0]] : [];
      } else if (mode === 'styleTransfer') {
        imagesForApi = uploadedImages.length > 0 && styleImage ? [uploadedImages[0], styleImage] : [];
      } else if (mode !== 'textToImage') {
        imagesForApi = uploadedImages;
      }

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
    if ((mode !== 'textToImage' && uploadedImages.length === 0) || !prompt.trim() || !generatedImage) {
      setError("Original settings are required to generate variations.");
      return;
    }
    if (mode === 'styleTransfer' && !styleImage) {
        setError("Original style image is required to generate variations.");
        return;
    }

    setIsGeneratingVariations(true);
    setError(null);

    try {
      let imagesForApi: UploadedImage[] = [];
      if (mode === 'profilePicturePro' || mode === 'photoRestoration' || mode === 'productStudio') {
        imagesForApi = uploadedImages.length > 0 ? [uploadedImages[0]] : [];
      } else if (mode === 'styleTransfer') {
        imagesForApi = uploadedImages.length > 0 && styleImage ? [uploadedImages[0], styleImage] : [];
      } else if (mode !== 'textToImage') {
        imagesForApi = uploadedImages;
      }
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
  
  const isGenerateDisabled = isLoading || isGeneratingVariations || (mode !== 'textToImage' && uploadedImages.length === 0);

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
            {mode !== 'textToImage' && (
                <div>
                  <h2 className="text-lg font-semibold mb-1">1. Upload Photos</h2>
                  <p className="text-sm text-slate-400 mb-4">{config.description}</p>
                  <ImageUploader onImagesUpload={handleImagesUpload} showAgeInput={mode === 'photoStudio'} />
                  {['profilePicturePro', 'photoRestoration', 'productStudio', 'styleTransfer'].includes(mode) && uploadedImages.length > 1 && (
                    <div className="mt-3 text-xs text-amber-400 bg-amber-900/30 border border-amber-500/30 p-2 rounded-md">
                        <strong>Note:</strong> This mode only uses the first uploaded image.
                    </div>
                  )}
                  {mode === 'styleTransfer' && (
                     <div className="mt-4">
                        <SingleImageUploader onImageUpload={setStyleImage} uploadedImage={styleImage} title="Upload Style Image" />
                     </div>
                  )}
                </div>
            )}
            
            <div className="border-t border-slate-700"></div>

            <div>
              <h2 className="text-lg font-semibold mb-1">{mode === 'textToImage' ? '1.' : '2.'} Describe Your Vision</h2>
              <p className="text-sm text-slate-400 mb-4">
                {
                  {
                    'productStudio': 'Describe the background for your product.',
                    'textToImage': 'Describe the image you want to create.',
                    'styleTransfer': 'Add any guiding keywords for the style transfer.'
                  }[mode] || 'Describe the background and style of your portrait.'
                }
              </p>
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
              <h2 className="text-lg font-semibold mb-1">{mode === 'textToImage' ? '2.' : '3.'} Select Aspect Ratio</h2>
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
              <h2 className="text-lg font-semibold mb-1">{mode === 'textToImage' ? '3.' : '4.'} Things to Avoid (Optional)</h2>
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
              disabled={isGenerateDisabled}
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