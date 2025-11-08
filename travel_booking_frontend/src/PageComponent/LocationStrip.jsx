import React, { useState } from 'react';

// Enhanced infinitely-scrolling horizontal strip of location images.
// - Uses a larger default image set
// - Images are lazy-loaded
// - Each row can be paused on hover
// - Simple optional caption overlay
const defaultImages = [
  { src: '/images/beach.svg', caption: 'Tropical Beach' },
  { src: '/images/mountain.svg', caption: 'Mountain View' },
  { src: '/images/city.svg', caption: 'City Lights' },
  { src: '/images/historic.svg', caption: 'Historic Streets' },
  { src: '/images/sunset.svg', caption: 'Sunset Horizon' },
  { src: '/images/forest.svg', caption: 'Forest Path' },
  { src: '/images/desert.svg', caption: 'Desert Dunes' },
  { src: '/images/hills.svg', caption: 'Rolling Hills' },
  { src: '/images/jungle.svg', caption: 'Tropical Jungle' },
  { src: '/images/iceberg.svg', caption: 'Iceberg Bay' }
];

export default function LocationStrip({ images = defaultImages, rows = 2, speed = 30, height = 140 }) {
  // rows: number of horizontal strips; speed: seconds for full loop (smaller = faster)
  const [pausedRows, setPausedRows] = useState(() => Array(rows).fill(false));

  const setPaused = (rowIdx, paused) => {
    setPausedRows((prev) => {
      const next = [...prev];
      next[rowIdx] = paused;
      return next;
    });
  };

  return (
    <div className="location-strip container-fluid my-4">
      {Array.from({ length: rows }).map((_, idx) => {
        const dir = idx % 2 === 0 ? 'normal' : 'reverse';
        const duration = Math.max(12, speed + idx * 6); // vary duration per row
        return (
          <div
            className="marquee"
            key={`row-${idx}`}
            onMouseEnter={() => setPaused(idx, true)}
            onMouseLeave={() => setPaused(idx, false)}
            style={{ overflow: 'hidden', margin: '8px 0' }}
          >
            <div
              className="marquee__content"
              style={{
                animationDuration: `${duration}s`,
                animationDirection: dir,
                animationPlayState: pausedRows[idx] ? 'paused' : 'running',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {[...images, ...images].map((item, i) => {
                const src = item.src || item;
                const caption = item.caption || '';
                return (
                  <div
                    className="marquee__item"
                    key={`${idx}-${i}`}
                    style={{ flex: '0 0 auto', marginRight: 10 }}
                  >
                    <div style={{ position: 'relative', height }}>
                      <img
                        src={src}
                        alt={caption || `location-${i}`}
                        loading="lazy"
                        style={{
                          height,
                          width: 'auto',
                          borderRadius: 8,
                          objectFit: 'cover',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                        }}
                      />
                      {caption ? (
                        <div
                          style={{
                            position: 'absolute',
                            left: 8,
                            bottom: 8,
                            background: 'rgba(0,0,0,0.45)',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 12
                          }}
                        >
                          {caption}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
