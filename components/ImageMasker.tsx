import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ImageMaskerProps {
  imageUrl: string;
  onMaskChange: (maskDataUrl: string | null) => void;
}

const ImageMasker: React.FC<ImageMaskerProps> = ({ imageUrl, onMaskChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [brushSize, setBrushSize] = useState(40);

  const getCanvasCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };
  
  const draw = useCallback((start: {x: number; y: number}, end: {x: number; y: number}) => {
    const displayCtx = displayCanvasRef.current?.getContext('2d');
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!displayCtx || !maskCtx) return;

    // Draw on display canvas (semi-transparent white)
    displayCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    displayCtx.lineWidth = brushSize;
    displayCtx.lineCap = 'round';
    displayCtx.lineJoin = 'round';
    displayCtx.beginPath();
    displayCtx.moveTo(start.x, start.y);
    displayCtx.lineTo(end.x, end.y);
    displayCtx.stroke();
    
    // Draw on mask canvas (solid white on black background)
    maskCtx.strokeStyle = 'white';
    maskCtx.lineWidth = brushSize;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';
    maskCtx.beginPath();
    maskCtx.moveTo(start.x, start.y);
    maskCtx.lineTo(end.x, end.y);
    maskCtx.stroke();
  }, [brushSize]);


  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoordinates(event);
    if (coords) {
      setIsDrawing(true);
      lastPointRef.current = coords;
      // Draw a dot for single clicks
      draw(coords, coords);
    }
  };

  const handleDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const currentPoint = getCanvasCoordinates(event);
    if (currentPoint && lastPointRef.current) {
      draw(lastPointRef.current, currentPoint);
      lastPointRef.current = currentPoint;
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPointRef.current = null;
      onMaskChange(maskCanvasRef.current?.toDataURL() ?? null);
    }
  };

  const clearMask = () => {
    const displayCtx = displayCanvasRef.current?.getContext('2d');
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    const displayCanvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    
    if (displayCtx && displayCanvas) {
      displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    }
    if (maskCtx && maskCanvas) {
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
    onMaskChange(null);
  };
  
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;
    imageRef.current = image;

    image.onload = () => {
      const container = containerRef.current;
      const displayCanvas = displayCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!container || !displayCanvas || !maskCanvas) return;

      const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
      const imageAspectRatio = image.width / image.height;
      const containerAspectRatio = containerWidth / containerHeight;

      let canvasWidth, canvasHeight;
      if (imageAspectRatio > containerAspectRatio) {
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / imageAspectRatio;
      } else {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * imageAspectRatio;
      }

      displayCanvas.width = canvasWidth;
      displayCanvas.height = canvasHeight;
      maskCanvas.width = canvasWidth;
      maskCanvas.height = canvasHeight;
      
      clearMask();
    };
  }, [imageUrl]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div 
        ref={containerRef}
        className="relative w-full aspect-square bg-black/30 rounded-lg overflow-hidden flex items-center justify-center cursor-crosshair"
        style={{ touchAction: 'none' }}
      >
        <img src={imageUrl} alt="Original to edit" className="max-w-full max-h-full block" />
        <canvas
          ref={displayCanvasRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          onMouseDown={startDrawing}
          onMouseMove={handleDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={handleDrawing}
          onTouchEnd={stopDrawing}
        />
        <canvas ref={maskCanvasRef} className="hidden" />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/50 backdrop-blur-sm p-3 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label htmlFor="brushSize" className="font-medium text-sm text-slate-300 whitespace-nowrap">Brush Size</label>
          <div 
              className="w-8 h-8 rounded-full bg-white/50 border-2 border-white transition-transform duration-150"
              style={{ transform: `scale(${brushSize / 40})` }}
           />
        </div>
        <input
          id="brushSize"
          type="range"
          min="10"
          max="80"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer range-lg gradient-slider"
        />
        <div className="relative p-px rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full sm:w-auto">
          <button
            onClick={clearMask}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageMasker;
