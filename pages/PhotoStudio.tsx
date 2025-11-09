import React, { useState, useCallback } from 'react';
import type { UploadedImage } from '../types';
import { generateEditedImage } from '../services/geminiService';
import ImageUploader from '../components/ImageUploader';
import ImageMasker from '../components/ImageMasker';
import ResultDisplay from '../components/ResultDisplay';
import { 
  SparklesIcon, ArrowLeftIcon, UserCircleIcon, CameraIcon, PhotoIcon, PencilSquareIcon, WandSparklesIcon, TagIcon, PaintBrushIcon, UploadIcon, MagicEraserIcon
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
    description: "Combine multiple photos into a single, professional studio portrait.",
  },
  profilePicturePro: {
    title: "Profile Picture Pro",
    Icon: UserCircleIcon,
    iconColor: 'text-sky-400',
    description: "Generate a professional headshot. For best results, upload one clear photo of the subject.",
  },
  vintageCamera: {
    title: "Vintage Camera",
    Icon: CameraIcon,
    iconColor: 'text-amber-400',
    description: "Apply classic film effects and retro styles to your photos.",
  },
  backgroundScene: {
    title: "Background Scene",
    Icon: PhotoIcon,
    iconColor: 'text-emerald-400',
    description: "Place your subjects in entirely new and creative environments.",
  },
  textToImage: {
    title: "Text-to-Image Studio",
    Icon: PencilSquareIcon,
    iconColor: 'text-rose-400',
    description: "Generate a new image from scratch based on your text description.",
  },
  photoRestoration: {
    title: "AI Photo Restoration",
    Icon: WandSparklesIcon,
    iconColor: 'text-yellow-400',
    description: "Repair old, damaged, or faded photos. Upload one photo to restore.",
  },
  productStudio: {
    title: "AI Product Studio",
    Icon: TagIcon,
    iconColor: 'text-cyan-400',
    description: "Create professional product shots. Upload one product photo to begin.",
  },
  styleTransfer: {
    title: "AI Style Transfer",
    Icon: PaintBrushIcon,
    iconColor: 'text-violet-400',
    description: "Transfer the style from one image to another. Upload a content image and a style image.",
  },
  magicEraser: {
    title: "Magic Eraser",
    Icon: MagicEraserIcon,
    iconColor: 'text-teal-400',
    description: "Upload an image, then brush over any unwanted objects to remove them.",
  },
};

const defaultPrompts = {
  photoStudio: `
**TASK**: Execute a flawless composite of multiple subjects from various source images into a single, cohesive, and hyper-realistic professional studio portrait.
**CONTEXT**: The final product is for a premium, high-end client, such as a corporate team or a family seeking a legacy portrait. The image must be technically perfect and emotionally resonant, appearing as if captured in one moment by a world-class photographer.
**LIGHTING**: Implement a sophisticated multi-point lighting setup. The key light should be a large octabox providing soft, diffused light, creating a gentle "loop" or "Rembrandt" pattern on the faces. A fill light, at a 3:1 or 4:1 ratio to the key, should be used to gently lift shadows without eliminating depth. A subtle hair light/rim light from above and behind should be applied to each subject to create separation from the background. Crucially, ensure consistent catchlights are present in every subject's eyes, indicating a single primary light source.
**BACKGROUND**: Generate a premium, textured studio backdrop. Options include a hand-painted canvas look (like Oliphant or Gravity backdrops) in a neutral dark grey or deep olive green, or a clean, modern architectural element that is completely out of focus. The background must have a subtle, pleasing gradient and texture, adding depth without distracting.
**SUBJECT ARRANGEMENT**: Arrange subjects in a classic, triangular, or "V" formation that promotes visual harmony and balance. Poses should be natural and interactive, with subtle physical contact or overlapping to suggest connection. Critically, use the provided age data to scale each individual realistically. Their eyelines should converge at a point slightly off-camera to create a unified, candid feel.
**CAMERA & LENS SIMULATION**: Emulate a medium format camera system (like a Hasselblad or Phase One) with a 110mm f/2 lens. This choice ensures exceptional detail, smooth tonal transitions, and a beautiful, gradual falloff from the plane of focus. The focus must be critically sharp on the subjects' eyes.
**POST-PROCESSING**: Apply advanced, non-destructive post-processing techniques. Perform meticulous color grading to unify skin tones across all subjects. Use frequency separation for subtle, natural skin retouching, preserving texture. Employ dodging and burning to enhance facial contours and add three-dimensionality. The final output must be absolutely seamless, with no discernible artifacts from the compositing process.
  `.trim(),
  profilePicturePro: `
**TASK**: Generate a photorealistic, high-end corporate or personal branding headshot of the subject from the provided photo.
**CONTEXT**: The image is for a C-suite executive, thought leader, or professional for use on LinkedIn, a company 'About Us' page, or a conference speaker bio. The desired impression is one of confidence, expertise, and approachability.
**COMPOSITION**: Frame the subject as a classic head-and-shoulders or bust-up portrait. There should be appropriate headroom and the subject should be slightly angled to the camera to create a more dynamic pose.
**LIGHTING**: Employ a sophisticated lighting setup. A large, diffused key light (e.g., a 5-foot octabox) should create soft, flattering light on the face. A reflector or a heavily diffused fill light should be used on the opposite side to gently soften shadows. A subtle "kicker" or rim light should be used to define the jawline and separate the subject from the background. Ensure a distinct, single catchlight is visible in each eye, making the subject appear engaged and vibrant.
**BACKGROUND**: The background must be professional and non-distracting. Generate a softly blurred, modern office interior with pleasing bokeh from background light sources. Alternatively, a clean, neutral-toned studio backdrop (light grey, charcoal) with a very subtle gradient is also acceptable. The background should complement, not compete with, the subject.
**SUBJECT'S EXPRESSION & ATTIRE**: Maintain the subject's core facial features, hairstyle, and clothing from the source image. The expression should be coached to a slight, genuine smile or a confident, neutral look. The goal is authenticity and professionalism.
**CAMERA & LENS SIMULATION**: Simulate a high-resolution full-frame mirrorless camera like a Sony A7R IV or Canon R5, paired with a premium 85mm f/1.4 or 105mm f/1.4 lens. The focus must be razor-sharp on the subject's eyes. Render realistic skin texture; avoid an overly airbrushed or plastic look. The final image should be delivered in an sRGB color space, ready for web use.
  `.trim(),
  vintageCamera: `
**TASK**: Meticulously transform the provided photograph into an authentic-looking vintage image, perfectly replicating the aesthetic of a 35mm film photograph from the mid-1970s.
**AESTHETIC**: The goal is a historically accurate recreation, not a modern digital filter. The final image should be indistinguishable from a genuine, well-preserved slide or print from the era.
**FILM STOCK SIMULATION**: Emulate the distinct characteristics of Kodachrome 64 slide film. This requires a specific color science: deeply saturated reds, rich but slightly cyan-shifted blues, and warm, golden-hued highlights. Greens should be slightly muted. The dynamic range should be limited, with deep but detailed shadows and highlights that roll off gently without harsh clipping.
**LENS & CAMERA ARTIFACTS**: Simulate a popular consumer-grade prime lens from the 1970s (e.g., a Pentax Takumar 50mm f/1.4). Introduce subtle optical imperfections characteristic of such lenses: a soft vignette, slight barrel distortion, and minor chromatic aberration (red/cyan fringing) on high-contrast edges. If a bright light source is present, render a period-accurate lens flare, often appearing as a series of hexagonal or pentagonal ghosts corresponding to the lens's aperture blades.
**TEXTURE & GRAIN**: The image must feature a fine, organic film grain structure. This is not digital noise. The grain should be most apparent in the mid-tones and should be non-uniform. Also, introduce subtle "halation," a soft red-orange glow around the edges of bright, overexposed highlights, which is a classic artifact of film.
**FOCUS & COMPOSITION**: The plane of focus should be relatively shallow, and the focus itself should be slightly softer than modern digital standards, especially towards the corners of the frame. The overall image should feel candid and unposed, reflecting the photographic style of the time.
  `.trim(),
  backgroundScene: `
**TASK**: Execute a flawless, photorealistic composite of the subjects from the source images into the new background scene described in the prompt.
**CORE OBJECTIVE**: The final image must achieve perfect realism, creating the illusion that the scene was captured in-camera in a single shot. The integration must be invisible to a discerning eye.
**LIGHTING INTEGRATION (CRITICAL)**:
1. **Analyze the Environment Map**: Accurately determine the properties of the light in the target scene: directionality (angle of the sun or key light), color temperature (warm sunset, cool overcast day), and quality (hard, specular light vs. soft, diffused light).
2. **Re-light the Subjects**: Apply this lighting model to the subjects. This includes recreating specular highlights, diffuse reflections, and accurate shadow casting.
3. **Shadows**: Shadows cast by the subjects must match the direction, hardness, and color of shadows in the scene. Pay attention to both cast shadows and contact shadows where the subjects touch surfaces.
**COLOR & ATMOSPHERIC HARMONIZATION**:
1. **Color Bleed**: The subjects must pick up ambient light and color from their new surroundings. A subject in a lush green forest should have subtle green hues reflected in their shadows and on their skin/clothing.
2. **Black/White Point Matching**: The darkest and brightest points on the subjects must be perfectly aligned with the dynamic range of the background scene to avoid a "cut-out" look.
3. **Atmospheric Perspective**: Apply effects like haze, fog, or dust realistically. If a subject is further in the distance, their contrast and saturation should be slightly reduced to match the atmospheric conditions.
**PHYSICAL INTEGRATION**: Ensure the scale, perspective, and focal length match between the subjects and the background. The edges of the subjects should be blended seamlessly, perhaps with a subtle light wrap from the background bleeding over their edges. The final image must be a physically and optically coherent scene.
  `.trim(),
  textToImage: `
**TASK**: Function as a high-end generative engine for a senior concept artist or creative director. Create a photorealistic, cinematic, and emotionally resonant image based on the user's text prompt.
**QUALITY BENCHMARK**: The output must meet the standards of a flagship film production's keyframe art, a cover for a AAA video game, or a high-fashion editorial photograph. Strive for unparalleled realism, intricate detail, and a powerful, atmospheric mood.
**ARTISTIC DIRECTION**:
1.  **Conceptualization**: Before rendering, deeply interpret the prompt's intent. What is the story being told? What is the core emotion? Use this interpretation to guide all subsequent artistic choices.
2.  **Cinematic Composition**: Employ masterful compositional techniques. Use leading lines, the golden ratio, dynamic symmetry, and negative space to create a visually arresting image. Establish a clear foreground, midground, and background to create an immersive sense of depth and scale.
3.  **Advanced Lighting**: Do not settle for simple lighting. Implement complex, motivated lighting schemes that tell a story. Use techniques like volumetric lighting to show light rays, caustics for realistic water/glass reflections, and global illumination for bounce light that fills the scene with realistic color. Light should sculpt forms, reveal textures, and create mood.
4.  **Physical Materiality (PBR)**: Render all materials with physical accuracy. Metal should have realistic specular reflections and anisotropy. Skin should exhibit subsurface scattering, making it look soft and alive. Fabric should have believable weave and folds. Use high-resolution textures and displacement maps to create tactile surfaces.
5.  **Lens and Camera Simulation**: Simulate the use of a specific camera and lens to enhance the visual narrative. For example, use a wide-angle lens with slight distortion for an epic landscape, or a telephoto lens with heavy compression for an intimate portrait. Add subtle, realistic artifacts like film grain, chromatic aberration, or a gentle vignette to sell the photographic illusion.
**FINAL POLISH**: The final image must be a masterpiece of digital art, rich in detail, mood, and narrative power.
  `.trim(),
  photoRestoration: `
**TASK**: You are an expert archival photo restorationist using state-of-the-art AI tools. Your mission is to restore the provided damaged photograph to its original pristine condition while preserving its historical authenticity and character.
**GOAL**: The final output should look like a perfectly preserved print from the day it was developed. This is a meticulous restoration, not a modernization or colorization unless explicitly requested.
**RESTORATION PROTOCOL**:
1.  **Structural Damage Repair**: Identify and meticulously reconstruct areas with physical damage. Use advanced inpainting and texture synthesis to seamlessly repair scratches, tears, creases, folds, and water damage. The repairs must be invisible, perfectly matching the original image's texture, grain, and content.
2.  **Surface Blemish Removal**: Eliminate all surface-level imperfections. This includes dust specks, chemical stains, fingerprints, and mold spots.
3.  **De-Fading and Contrast Recovery**: Analyze the image histogram to correct for age-related fading. Restore the full, original tonal range. Blacks should be deep but not crushed, whites should be clean but not blown out, and mid-tones should be rich with detail.
4.  **Color Fidelity Correction (For Color Photos)**: Correct the color shifts and fading common in older color prints. Neutralize color casts, restore vibrancy, and ensure skin tones are natural and accurate to the period.
5.  **Clarity and Detail Enhancement**: Employ AI-powered deconvolution algorithms to correct for softness, minor motion blur, or missed focus from the original camera. Intelligently sharpen key details, especially in faces and textiles, without introducing digital artifacts or over-sharpening.
6.  **Noise and Grain Management**: Carefully reduce distracting noise or excessive grain while preserving the fine, desirable grain structure that gives the photo its character. The goal is to clean the image, not to make it look unnaturally sterile or "digital."
**ETHICAL CONSTRAINT**: You must not alter the fundamental content or subjects of the photograph. The restoration must be a faithful tribute to the original moment captured.
  `.trim(),
  productStudio: `
**TASK**: Create a flawless, high-end commercial product photograph suitable for a premium e-commerce website, print catalog, or digital advertising campaign.
**CONTEXT**: The final image must make the product look as appealing and high-quality as possible, driving consumer desire and trust. The aesthetic should be clean, modern, and professional.
**WORKFLOW**:
1.  **Perfect Product Isolation**: Using advanced masking, perform a perfect, clean-edged isolation of the product from its source image. Pay special attention to complex areas like fine details or transparent elements.
2.  **Background Integration**: Place the isolated product onto the new background specified in the user's SCENE DESCRIPTION. This could be a pure white infinity cove (cyclorama), a textured surface like marble or wood, or a lifestyle environment.
3.  **Advanced Studio Lighting**: Simulate a sophisticated, multi-light studio setup designed to flatter the product. Use large, soft light sources (strip boxes, octaboxes) to create broad, smooth gradients and highlights that define the product's form. Use smaller, harder lights or reflectors to add specular highlights ("pings") that accentuate texture and material quality.
4.  **Realistic Shadow and Reflection Casting**: Generate physically accurate shadows. This includes a soft, diffused contact shadow where the product meets the surface, grounding it in the scene. If the surface is reflective, generate a subtle, realistic reflection of the product.
5.  **Color Accuracy & Post-Processing**: Ensure the product's colors are accurate and vibrant. Perform minor cleanup to remove any dust or imperfections. Enhance local contrast to make details pop. The final image must be crisp, clear, and perfectly lit.
**OUTPUT REQUIREMENTS**: The product must be the clear hero of the shot. The lighting should be masterful, revealing form and texture. The overall impression must be one of luxury and high quality.
  `.trim(),
  styleTransfer: `
**TASK**: Perform an advanced artistic style transfer, re-rendering a 'Content Image' in the comprehensive aesthetic of a 'Style Image'.
**INPUTS**: Image 1 is the 'Content Image' (defining subject and composition). Image 2 is the 'Style Image' (defining the complete artistic treatment).
**DEEP STYLE ANALYSIS**: This is not a simple filter or texture overlay. You must perform a deep, multi-layered analysis of the 'Style Image' to reverse-engineer its artistic essence. Deconstruct the following elements:
1.  **Macro-Composition & Color Theory**: Analyze the overall color palette, dominant color harmonies (e.g., complementary, analogous), and the global distribution of light and shadow (chiaroscuro, high-key, etc.).
2.  **Meso-Structure & Form**: Identify how the artist renders form. Do they use hard edges, soft gradients, expressive lines, or geometric shapes? Analyze the "brushwork"—the texture, direction, and energy of the strokes.
3.  **Micro-Texture & Detail**: Extract the fine-grained texture of the medium itself. Is it the impasto of thick oil paint, the delicate grain of a watercolor paper, the clean lines of a vector illustration, or the halftone dots of a comic book?
**SYNTHESIS & RECONSTRUCTION**:
Use the extracted style parameters to completely reconstruct the 'Content Image'. Every pixel of the content should be re-imagined and re-rendered through the lens of the style. The original composition, subjects, and forms of the 'Content Image' must remain coherent and recognizable, but their execution must be entirely that of the 'Style Image' artist.
**FINAL GOAL**: The output should be a new, cohesive piece of art. It should appear as if the master artist of the 'Style Image' had created a new work depicting the subject of the 'Content Image'. The fusion should be seamless and artistically convincing.
  `.trim(),
  magicEraser: `
**TASK**: You are an advanced, context-aware inpainting AI. Your function is to flawlessly remove a designated object from a photograph, leaving absolutely no trace of its existence or the editing process.
**INPUTS**: You will receive an original source image and a corresponding black-and-white mask image.
**DIRECTIVE**: The white area on the mask image represents the target for complete obliteration. The black area is to remain untouched and preserved with perfect fidelity.
**EXECUTION PROTOCOL**:
1.  **Boundary Analysis**: First, analyze the pixel information immediately surrounding the masked region. Identify patterns, textures, gradients, and structural lines (e.g., edges of walls, horizons).
2.  **Structure Propagation**: Intelligently extend the structural lines from the surrounding area into the void. The algorithm must understand perspective, ensuring that lines converge correctly and patterns scale appropriately with distance.
3.  **Texture Synthesis**: Generate new, plausible texture to fill the area, based on the analyzed surroundings. This texture must seamlessly match the original in terms of detail, noise/grain structure, and lighting.
4.  **Lighting & Shading Reconstruction**: This is critical. Analyze the light and shadow information across the entire image. The filled-in area must be shaded with a gradient that perfectly matches what would realistically be there. It must correctly receive light and cast subtle shadows as if it were part of the original scene.
5.  **Seamless Integration**: The final step is to blend the newly generated patch into the original image at a sub-pixel level, ensuring there are no discernible seams, color mismatches, or changes in luminance.
**FINAL OUTPUT**: Produce a single, photorealistic image where the masked object has vanished, and the reconstructed background is so perfect that it appears to have been part of the original, unedited photograph.
  `.trim(),
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
            <label htmlFor="style-image-upload" className="w-full h-32 border-2 border-slate-700/80 border-dashed rounded-xl cursor-pointer bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all flex items-center justify-center p-2">
                {uploadedImage ? (
                    <img src={uploadedImage.base64} alt="Style preview" className="w-full h-full object-contain rounded-lg" />
                ) : (
                    <div className="text-center">
                        <UploadIcon className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <span className="text-sm font-semibold text-indigo-400">{title}</span>
                    </div>
                )}
            </label>
        </div>
    );
};

const GradientDivider = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
);


const PhotoStudio: React.FC<PhotoStudioProps> = ({ onBackToHome, mode }) => {
  const config = templateConfigs[mode];
  
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [styleImage, setStyleImage] = useState<UploadedImage | null>(null);
  const [eraserImage, setEraserImage] = useState<UploadedImage | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(defaultPrompts[mode]);
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

  const handleEraserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEraserImage({ file, base64: base64String });
        setMaskImage(null);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const buildFinalPrompt = useCallback(() => {
    const aspectRatioMap = {
      '4:5': 'a 4:5 portrait aspect ratio',
      '1:1': 'a 1:1 square aspect ratio',
      '16:9': 'a 16:9 landscape aspect ratio',
    };
    const aspectRatioInstruction = `The final image must have ${aspectRatioMap[aspectRatio]}.`;
    const negativePromptInstruction = `Do not include any of the following: ${negativePrompt}.`;

    switch (mode) {
      case 'magicEraser':
        return defaultPrompts.magicEraser;

      case 'textToImage':
        return `
${prompt}
**ASPECT RATIO**: ${aspectRatioInstruction}
**NEGATIVE PROMPT**: ${negativePromptInstruction}
        `.trim();
      
      case 'photoRestoration':
        return `
${defaultPrompts.photoRestoration}
**ASPECT RATIO**: ${aspectRatioInstruction}
**NEGATIVE PROMPT**: ${negativePromptInstruction}
        `.trim();

      case 'productStudio':
        return `
${defaultPrompts.productStudio}
**SCENE DESCRIPTION**: ${prompt}
**ASPECT RATIO**: ${aspectRatioInstruction}
**NEGATIVE PROMPT**: ${negativePromptInstruction}
        `.trim();

      case 'styleTransfer':
        return `
${defaultPrompts.styleTransfer}
**GUIDING KEYWORDS**: ${prompt}
**ASPECT RATIO**: ${aspectRatioInstruction}
**NEGATIVE PROMPT**: ${negativePromptInstruction}
        `.trim();

      case 'profilePicturePro': {
        const person = uploadedImages[0];
        const ageInfo = person?.age ? `who is ${person.age} years old` : 'of unknown age';
        const personDescription = `- A person ${ageInfo}. IMPORTANT: You must retain their original clothing, hairstyle, and distinct facial features from their photo. The final result must be a head-and-shoulders composition.`;
        return `
${defaultPrompts.profilePicturePro}
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
    
        let taskDescription = defaultPrompts.photoStudio;
        if (mode === 'vintageCamera') {
            taskDescription = defaultPrompts.vintageCamera;
        } else if (mode === 'backgroundScene') {
            taskDescription = defaultPrompts.backgroundScene;
        }

        return `
${taskDescription}
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
    if (mode === 'magicEraser') {
      if (!eraserImage) {
        setError("Please upload an image to edit.");
        return;
      }
      if (!maskImage) {
        setError("Please brush over an object to remove it.");
        return;
      }
    } else if (mode !== 'textToImage' && uploadedImages.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    if (mode === 'styleTransfer' && !styleImage) {
      setError("Please upload a style image.");
      return;
    }
    if (!prompt.trim() && mode !== 'magicEraser' && mode !== 'photoRestoration' && mode !== 'styleTransfer') {
      setError("Please enter a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setVariationImages([]);

    try {
      let imagesForApi: UploadedImage[] = [];
      if (mode === 'magicEraser' && eraserImage && maskImage) {
        imagesForApi = [eraserImage, { file: new File([], 'mask.png'), base64: maskImage }];
      } else if (mode === 'profilePicturePro' || mode === 'photoRestoration' || mode === 'productStudio') {
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
    if (mode === 'magicEraser') return;

    if ((mode !== 'textToImage' && uploadedImages.length === 0) || !generatedImage) {
      setError("Original settings are required to generate variations.");
      return;
    }
     if (mode !== 'photoRestoration' && mode !== 'styleTransfer' && !prompt.trim()) {
      setError("A prompt is required to generate variations.");
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
  
  const isGenerateDisabled = isLoading || isGeneratingVariations ||
    (mode !== 'textToImage' && mode !== 'magicEraser' && uploadedImages.length === 0) ||
    (mode === 'magicEraser' && (!eraserImage || !maskImage));

  const renderInputPanel = () => {
    const isPromptless = ['photoRestoration', 'styleTransfer', 'magicEraser'].includes(mode);
    
    if (mode === 'magicEraser') {
      return (
        <>
         <div>
            <h2 className="text-lg font-semibold mb-1">1. Upload Photo</h2>
            <p className="text-sm text-slate-400 mb-4">{config.description}</p>
            <label htmlFor="eraser-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700/80 border-dashed rounded-xl cursor-pointer bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all">
              <div className="flex flex-col items-center justify-center">
                <UploadIcon className="w-8 h-8 mb-2 text-slate-400" />
                <span className="font-semibold text-sm text-indigo-400">
                  {eraserImage ? 'Change Image' : 'Click to upload'}
                </span>
                <span className="text-xs text-slate-500">PNG, JPG, or WEBP</span>
              </div>
              <input id="eraser-upload" type="file" accept="image/*" className="hidden" onChange={handleEraserImageUpload} />
            </label>
          </div>
          {eraserImage && (
            <>
              <GradientDivider />
              <div>
                <h2 className="text-lg font-semibold mb-1">2. Erase Object</h2>
                <p className="text-sm text-slate-400 mb-4">Brush over anything you want to remove.</p>
                <ImageMasker imageUrl={eraserImage.base64} onMaskChange={setMaskImage} />
              </div>
            </>
          )}
        </>
      )
    }

    return (
      <>
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
        
        {!isPromptless && <GradientDivider />}

        {!isPromptless && (
            <div>
              <h2 className="text-lg font-semibold mb-1">{mode === 'textToImage' ? '1.' : '2.'} Describe Your Vision</h2>
              <p className="text-sm text-slate-400 mb-4">
                {
                  {
                    'productStudio': 'Describe the background for your product.',
                    'textToImage': 'Describe the image you want to create.',
                  }[mode] || 'Describe the background and style of your portrait.'
                }
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A professional, well-lit studio portrait..."
                className="w-full h-24 p-3 bg-slate-800/80 border border-slate-700 rounded-lg focus:outline-none transition-shadow form-input"
                disabled={isLoading || isGeneratingVariations}
              />
            </div>
        )}
        
        <GradientDivider />

        <div>
          <h2 className="text-lg font-semibold mb-1">{mode === 'textToImage' ? '2.' : '3.'} Select Aspect Ratio</h2>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {(['4:5', '1:1', '16:9'] as const).map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                disabled={isLoading || isGeneratingVariations}
                className={`py-2.5 px-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden ${
                  aspectRatio === ratio
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
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

        <GradientDivider />
        
        <div>
          <h2 className="text-lg font-semibold mb-1">{mode === 'textToImage' ? '3.' : '4.'} Things to Avoid (Optional)</h2>
          <p className="text-sm text-slate-400 mb-4">Use a negative prompt to exclude unwanted elements.</p>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="e.g., blurry faces, extra fingers..."
            className="w-full h-24 p-3 bg-slate-800/80 border border-slate-700 rounded-lg focus:outline-none transition-shadow form-input"
            disabled={isLoading || isGeneratingVariations}
          />
        </div>
      </>
    );
  };
  
  return (
    <div className="min-h-screen font-sans flex flex-col">
       <header className="py-4 px-4 sm:px-8 sticky top-0 bg-slate-950/80 backdrop-blur-lg z-20 border-b border-slate-800">
            <div className="max-w-7xl mx-auto flex items-center gap-4">
                <button onClick={onBackToHome} className="p-2 rounded-full hover:bg-slate-800 transition-colors" aria-label="Back to home">
                    <ArrowLeftIcon className="w-6 h-6 text-slate-300" />
                </button>
                <div className="flex items-center gap-3">
                    <config.Icon className={`w-7 h-7 ${config.iconColor}`} />
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-50">{config.title}</h1>
                </div>
            </div>
        </header>
      
      <main className="flex-grow p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Panel: Inputs */}
          <div className="relative p-px rounded-xl bg-gradient-to-br from-slate-700 to-slate-800">
            <div className="flex flex-col gap-6 bg-slate-900/80 backdrop-blur-sm p-6 rounded-[11px]">
              {renderInputPanel()}
              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="relative w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg text-white transition-all duration-300 overflow-hidden group mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 w-full h-full bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></span>
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
          </div>


          {/* Right Panel: Output */}
          <div className="relative p-px rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 lg:sticky lg:top-24 h-fit">
            <div className="bg-slate-900/80 backdrop-blur-sm p-6 rounded-[11px] min-h-[400px] lg:min-h-0">
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
        </div>
      </main>

       <footer className="text-center py-4 px-4 sm:px-8 text-xs text-slate-500 border-t border-slate-800">
        <p>Proudly Developed by Adil Munawar</p>
      </footer>
    </div>
  );
};

export default PhotoStudio;