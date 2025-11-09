import React from 'react';
import { SparklesIcon, UserCircleIcon, CameraIcon, PhotoIcon, PencilSquareIcon, WandSparklesIcon, TagIcon, PaintBrushIcon, MagicEraserIcon } from '../components/Icons';
import type { Page } from '../App';

interface HomePageProps {
  onSelectTemplate: (template: Page) => void;
}

const templates = [
  {
    id: 'photoStudio',
    title: 'AI Photo Studio',
    description: 'Combine multiple photos into a single, professional studio portrait.',
    icon: SparklesIcon,
    color: 'text-indigo-400',
    enabled: true,
  },
  {
    id: 'textToImage',
    title: 'Text-to-Image Studio',
    description: 'Generate a new image from scratch using only a text description.',
    icon: PencilSquareIcon,
    color: 'text-rose-400',
    enabled: true,
  },
  {
    id: 'magicEraser',
    title: 'Magic Eraser',
    description: 'Brush over unwanted objects to remove them from your photos.',
    icon: MagicEraserIcon,
    color: 'text-teal-400',
    enabled: true,
  },
  {
    id: 'profilePicturePro',
    title: 'Profile Picture Pro',
    description: 'Generate professional, high-quality headshots for your profile.',
    icon: UserCircleIcon,
    color: 'text-sky-400',
    enabled: true,
  },
  {
    id: 'photoRestoration',
    title: 'AI Photo Restoration',
    description: 'Repair old, scratched, or faded photos and bring them back to life.',
    icon: WandSparklesIcon,
    color: 'text-yellow-400',
    enabled: true,
  },
  {
    id: 'productStudio',
    title: 'AI Product Studio',
    description: 'Create professional product photos with custom backgrounds.',
    icon: TagIcon,
    color: 'text-cyan-400',
    enabled: true,
  },
  {
    id: 'styleTransfer',
    title: 'AI Style Transfer',
    description: 'Apply the artistic style of one image to another photo.',
    icon: PaintBrushIcon,
    color: 'text-violet-400',
    enabled: true,
  },
  {
    id: 'vintageCamera',
    title: 'Vintage Camera',
    description: 'Apply classic film effects and retro styles to your photos.',
    icon: CameraIcon,
    color: 'text-amber-400',
    enabled: true,
  },
  {
    id: 'backgroundScene',
    title: 'Background Scene',
    description: 'Place your subjects in entirely new and creative environments.',
    icon: PhotoIcon,
    color: 'text-emerald-400',
    enabled: true,
  },
];

interface TemplateCardProps {
  template: typeof templates[0];
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => (
    <button
        onClick={onClick}
        disabled={!template.enabled}
        className="relative group text-left w-full h-full p-px rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all duration-300"
    >
        <div className="relative w-full h-full bg-slate-900/80 backdrop-blur-sm p-6 rounded-[11px] overflow-hidden">
             {/* Glow effect */}
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-indigo-500/40 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
            <div className="relative z-10">
                {!template.enabled && (
                    <div className="absolute top-3 right-3 bg-slate-700 text-slate-300 text-xs font-semibold px-2 py-1 rounded-full">
                        Coming Soon
                    </div>
                )}
                <template.icon className={`w-10 h-10 ${template.color}`} />
                <h3 className="text-lg font-bold mt-4 text-slate-100">{template.title}</h3>
                <p className="text-sm text-slate-400 mt-1 h-10">{template.description}</p>
                <div className="absolute bottom-6 right-6 text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </div>
            </div>
        </div>
    </button>
);


const HomePage: React.FC<HomePageProps> = ({ onSelectTemplate }) => {
  return (
    <div className="min-h-screen text-slate-200 font-sans">
      <header className="py-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-200 to-slate-500">
                Welcome to <span className="gradient-text">AdiFlux</span>
            </h1>
            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
                Your AI-powered creative suite. Transform your photos into professional portraits, artistic masterpieces, and more. Select a tool below to begin your creative journey.
            </p>
        </div>
      </header>

      <main className="py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onClick={() => onSelectTemplate(template.id as Page)} 
              />
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 px-4 sm:px-8 text-xs text-slate-500">
        <p>Proudly Developed by Adil Munawar</p>
      </footer>
    </div>
  );
};

export default HomePage;