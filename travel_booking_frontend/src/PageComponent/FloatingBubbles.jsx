import React from 'react';

// A small decorative component that shows floating circular "bubbles"
// Use up to 10 high-quality Unsplash photos (1920px) for clearer, crisper bubbles.
const images = [
    'https://images.unsplash.com/photo-1496412705862-e0088f16f791?auto=format&fit=crop&w=1920&q=90',
    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1920&q=90',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=90',
    'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1920&q=90',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=90',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=90'
];

const rand = (min, max) => Math.random() * (max - min) + min;

export default function FloatingBubbles({ count = 6, height = 260 }) {
  const bubbles = new Array(count).fill(0).map((_, i) => {
    const img = images[i % images.length];
    // make many small bubbles for subtlety
    const size = Math.floor(rand(64, 120));
    const left = Math.floor(rand(2, 94));
    const top = Math.floor(rand(-20, height - 60));
    const dur = rand(18, 36).toFixed(1); // slower vertical movement
    const delay = rand(0, 6).toFixed(1);
    const spinDur = rand(12, 30).toFixed(1); // slow rotation
    return { img, size, left, top, dur, delay, spinDur, key: `bubble-${i}` };
  });

  return (
    <div className="bubble-container" style={{ height: `${height}px` }}>
      {bubbles.map((b) => (
        <div
          key={b.key}
          className="bubble bubble-image"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            top: `${b.top}px`,
            animation: `floatY ${b.dur}s ease-in-out ${b.delay}s infinite alternate, spin ${b.spinDur}s linear ${b.delay}s infinite`
          }}
          aria-hidden
        >
          <img src={b.img} alt="" />
        </div>
      ))}
    </div>
  );
}
