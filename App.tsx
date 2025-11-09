import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import PhotoStudio from './pages/PhotoStudio';

export type Page = 'home' 
  | 'photoStudio' 
  | 'profilePicturePro' 
  | 'vintageCamera' 
  | 'backgroundScene'
  | 'textToImage'
  | 'photoRestoration'
  | 'productStudio'
  | 'styleTransfer'
  | 'magicEraser';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleSelectTemplate = (template: Page) => {
    setCurrentPage(template);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  switch (currentPage) {
    case 'home':
      return <HomePage onSelectTemplate={handleSelectTemplate} />;
    case 'photoStudio':
    case 'profilePicturePro':
    case 'vintageCamera':
    case 'backgroundScene':
    case 'textToImage':
    case 'photoRestoration':
    case 'productStudio':
    case 'styleTransfer':
    case 'magicEraser':
      return <PhotoStudio mode={currentPage} onBackToHome={handleBackToHome} />;
    default:
      return <HomePage onSelectTemplate={handleSelectTemplate} />;
  }
}

export default App;