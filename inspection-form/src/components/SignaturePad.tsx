import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

export interface SignaturePadRef {
  clear: () => void;
  getImage: () => string;
}

const SignaturePad = forwardRef<SignaturePadRef>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useImperativeHandle(ref, () => ({
    clear() {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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

    const start = (e: PointerEvent) => {
      drawing.current = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };

    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };

    const end = () => {
      drawing.current = false;
    };

    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);

    return () => {
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
    };
  }, []);

  return <canvas ref={canvasRef} width={600} height={150} style={{ width: '100%', height: '150px', border: '1px solid #ccc' }} />;
});

export default SignaturePad;
