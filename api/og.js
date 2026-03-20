import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a2a3a 0%, #07080d 100%)',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Background glow
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(78,142,186,0.15) 0%, transparent 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              },
            },
          },
          // Logo title
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: '96px',
                fontWeight: '700',
                marginBottom: '20px',
              },
              children: [
                { type: 'span', props: { style: { color: '#c8d6e5' }, children: 'Cine' } },
                { type: 'span', props: { style: { color: '#4e8eba' }, children: 'map' } },
              ],
            },
          },
          // Tagline
          {
            type: 'div',
            props: {
              style: {
                fontSize: '32px',
                color: '#8fa3b8',
                fontFamily: 'Arial, sans-serif',
                fontWeight: '400',
                marginBottom: '40px',
                letterSpacing: '0.02em',
              },
              children: 'Explore o universo do cinema',
            },
          },
          // CTA badge
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(78,142,186,0.2)',
                border: '1px solid rgba(78,142,186,0.5)',
                borderRadius: '100px',
                padding: '12px 28px',
                marginBottom: '40px',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#4e8eba',
                      display: 'inline-block',
                    },
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { color: '#7eb8f7', fontSize: '22px', fontFamily: 'Arial, sans-serif', fontWeight: '500' },
                    children: 'Descubra seu próximo filme favorito',
                  },
                },
              ],
            },
          },
          // URL
          {
            type: 'div',
            props: {
              style: {
                fontSize: '22px',
                color: '#3d7aad',
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '0.05em',
              },
              children: 'cinemap.com.br',
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
}
