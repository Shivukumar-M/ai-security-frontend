import React, { useEffect, useRef } from "react";

const MatrixRain = ({ className = "h-full w-full rounded-xl" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const glyphs =
      "01ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%&*+-<>[]{}!?アイウエオカキクケコサシスセソタチツテトナニヌネノ";
    const fontSize = 20;
    let width = 0;
    let height = 0;
    let streams = [];
    let rafId = 0;

    const randomGlyph = () => glyphs[Math.floor(Math.random() * glyphs.length)];

    const initStreams = () => {
      const columns = Math.max(1, Math.floor(width / fontSize));
      streams = Array.from({ length: columns }, (_, i) => ({
        x: i * fontSize,
        y: Math.random() * height,
        speed: 0.4 + Math.random() * 1.2,
        length: 10 + Math.floor(Math.random() * 20),
      }));
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
      ctx.textBaseline = "top";
      initStreams();
    };

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.17)";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < streams.length; i += 1) {
        const stream = streams[i];

        for (let tail = 0; tail < stream.length; tail += 1) {
          const y = stream.y - tail * fontSize;
          if (y < -fontSize || y > height + fontSize) continue;

          if (tail === 0) {
            ctx.fillStyle = "rgba(4, 61, 2, 0.05)";
            ctx.shadowColor = "rgba(3, 54, 2, 0.85)";
            ctx.shadowBlur = 12;
          } else {
            const alpha = Math.max(0.04, 1 - tail / stream.length);
            ctx.fillStyle = `rgba(0, 255, 90, ${alpha * 0.92})`;
            ctx.shadowColor = "rgba(3, 54, 3, 0.67)";
            ctx.shadowBlur = 7;
          }

          ctx.fillText(randomGlyph(), stream.x, y);
        }

        stream.y += stream.speed;

        if (stream.y - stream.length * fontSize > height) {
          stream.y = -Math.random() * height * 0.35;
          stream.speed = 0.6 + Math.random() * 1.6;
          stream.length = 10 + Math.floor(Math.random() * 20);
        }
      }

      rafId = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", background: "#010101" }}
    />
  );
};

export default MatrixRain;