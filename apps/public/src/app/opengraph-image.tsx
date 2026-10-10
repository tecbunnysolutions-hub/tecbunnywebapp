import { ImageResponse } from 'next/og';

export const alt = 'TecBunny Solutions - CCTV, Wi-Fi, Computer Repair & IT Support in Goa';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #09090b 0%, #1e3a8a 100%)',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 40, color: '#93c5fd', fontWeight: 700 }}>TecBunny Solutions</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1, marginTop: 24 }}>
          CCTV, Wi-Fi, Computer Repair &amp; IT Support
        </div>
        <div style={{ fontSize: 38, color: '#d4d4d8', marginTop: 32 }}>
          Local technology team in Goa
        </div>
      </div>
    ),
    size,
  );
}
