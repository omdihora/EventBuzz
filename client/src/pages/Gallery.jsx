import DomeGallery from '../components/DomeGallery';
import { useTheme } from '../context/ThemeContext';

const pastEventPhotos = [
    { src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop', alt: 'Tech Hackathon 2025' },
    { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop', alt: 'Annual Tech Fest' },
    { src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop', alt: 'Quiz Bowl Finals' },
    { src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop', alt: 'Cultural Night' },
    { src: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop', alt: 'Cultural Fest 2025' },
    { src: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop', alt: 'DJ Night' },
    { src: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop', alt: 'Startup Pitch Day' },
    { src: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop', alt: 'AI Workshop' },
    { src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop', alt: 'Coding Marathon' },
    { src: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop', alt: 'Photography Contest' },
    { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop', alt: 'Graduation Ceremony' },
    { src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop', alt: 'Sports Day' },
    { src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop', alt: 'Dance Competition' },
    { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop', alt: 'Music Concert' },
    { src: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&h=600&fit=crop', alt: 'Workshop Session' },
    { src: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&h=600&fit=crop', alt: 'Freshers Party' },
    { src: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=600&fit=crop', alt: 'Robotics Exhibition' },
    { src: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&h=600&fit=crop', alt: 'Art Exhibition' },
];

export default function Gallery() {
    const { theme } = useTheme();
    const blurColor = theme === 'dark' ? '#121212' : '#060010';

    return (
        <div style={{ width: '100vw', height: 'calc(100vh - 64px)', position: 'relative', background: 'var(--th-bg)' }}>
            {/* Title overlay */}
            <div style={{ position: 'absolute', top: '24px', left: 0, right: 0, zIndex: 30, textAlign: 'center', pointerEvents: 'none' }}>
                <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e8725c', background: 'rgba(232,114,92,0.1)' }}>
                    📸 Past Events
                </span>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--th-charcoal)', margin: '8px 0 0' }}>
                    Event <span style={{ color: '#e8725c' }}>Gallery</span>
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--th-text-muted)', marginTop: '4px' }}>
                    Drag to explore • Click to enlarge • Scroll through memories
                </p>
            </div>

            <DomeGallery
                images={pastEventPhotos}
                fit={0.55}
                minRadius={600}
                maxVerticalRotationDeg={0}
                segments={34}
                dragDampening={2}
                grayscale={false}
                overlayBlurColor={blurColor}
                imageBorderRadius="16px"
                openedImageBorderRadius="20px"
                openedImageWidth="500px"
                openedImageHeight="400px"
            />
        </div>
    );
}
