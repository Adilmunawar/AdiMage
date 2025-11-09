import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import PhotoStudio from './pages/PhotoStudio';

export type Page = 'home' | 'photoStudio';

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
      return <PhotoStudio onBackToHome={handleBackToHome} />;
    default:
      return <HomePage onSelectTemplate={handleSelectTemplate} />;
  }
}

export default App;
