import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

export interface SignaturePadRef {
  clear: () => void;
  getImage: () => string;
}

const SignaturePad = forwardRef<SignaturePadRef>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useImperativeHandle(ref, () => ({
    clear() {
      const ctx = contextRef.current;
      const canvas = canvasRef.current;
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    getImage() {
      return canvasRef.current?.toDataURL('image/png') || '';
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    contextRef.current = ctx;

    const ratio = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = 150 * ratio;
      ctx.scale(ratio, ratio);
    };
    resize();
    window.addEventListener('resize', resize);

    const startDrawing = (x: number, y: number) => {
      drawing.current = true;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (x: number, y: number) => {
      if (!drawing.current) return;
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const endDrawing = () => {
      drawing.current = false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      startDrawing(e.offsetX, e.offsetY);
    };
    const handlePointerMove = (e: PointerEvent) => {
      draw(e.offsetX, e.offsetY);
    };
    const handlePointerUp = () => {
      endDrawing();
    };

    const getTouchPos = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const pos = getTouchPos(e);
      startDrawing(pos.x, pos.y);
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const pos = getTouchPos(e);
      draw(pos.x, pos.y);
    };
    const handleTouchEnd = () => {
      endDrawing();
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '150px', border: '1px solid #ccc' }}
    />
  );
});

export default SignaturePad;
