import React from 'react';
import { SparklesIcon, UserCircleIcon, CameraIcon, PhotoIcon, PencilSquareIcon, WandSparklesIcon, TagIcon, PaintBrushIcon } from '../components/Icons';
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
    bgColor: 'bg-indigo-500/20',
    enabled: true,
  },
  {
    id: 'textToImage',
    title: 'Text-to-Image Studio',
    description: 'Generate a new image from scratch using only a text description.',
    icon: PencilSquareIcon,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    enabled: true,
  },
  {
    id: 'profilePicturePro',
    title: 'Profile Picture Pro',
    description: 'Generate professional, high-quality headshots for your profile.',
    icon: UserCircleIcon,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
    enabled: true,
  },
  {
    id: 'photoRestoration',
    title: 'AI Photo Restoration',
    description: 'Repair old, scratched, or faded photos and bring them back to life.',
    icon: WandSparklesIcon,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    enabled: true,
  },
  {
    id: 'productStudio',
    title: 'AI Product Studio',
    description: 'Create professional product photos with custom backgrounds.',
    icon: TagIcon,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    enabled: true,
  },
  {
    id: 'styleTransfer',
    title: 'AI Style Transfer',
    description: 'Apply the artistic style of one image to another photo.',
    icon: PaintBrushIcon,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    enabled: true,
  },
  {
    id: 'vintageCamera',
    title: 'Vintage Camera',
    description: 'Apply classic film effects and retro styles to your photos.',
    icon: CameraIcon,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    enabled: true,
  },
  {
    id: 'backgroundScene',
    title: 'Background Scene',
    description: 'Place your subjects in entirely new and creative environments.',
    icon: PhotoIcon,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
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
        className="relative group text-left w-full h-full bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:bg-slate-800/50"
    >
        {!template.enabled && (
            <div className="absolute top-3 right-3 bg-slate-600 text-slate-300 text-xs font-semibold px-2 py-1 rounded-full">
                Coming Soon
            </div>
        )}
        <div className={`p-3 rounded-lg inline-block ${template.bgColor}`}>
            <template.icon className={`w-8 h-8 ${template.color}`} />
        </div>
        <h3 className="text-lg font-bold mt-4 text-slate-100">{template.title}</h3>
        <p className="text-sm text-slate-400 mt-1">{template.description}</p>
        <div className="absolute bottom-6 right-6 text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
        </div>
    </button>
);


const HomePage: React.FC<HomePageProps> = ({ onSelectTemplate }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <header className="py-6 px-4 sm:px-8 border-b border-slate-700/50">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
           <div className="p-2.5 bg-indigo-500/20 rounded-lg">
                <SparklesIcon className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-50">AdiFlux</h1>
                <p className="text-slate-400">Choose a tool to start creating</p>
            </div>
        </div>
      </header>

      <main className="py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      <footer className="text-center py-6 px-4 sm:px-8 text-xs text-slate-500 border-t border-slate-700/50">
        <p>Proudly Developed by Adil Munawar</p>
      </footer>
    </div>
  );
};

export default HomePage;