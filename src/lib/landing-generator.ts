// Static HTML generator for landing page deployment
// Generates a self-contained, single-file HTML page with all CSS inlined

export function generateLandingHTML(config: {
  businessName: string;
  businessDescription: string;
  businessType: string;
  photos: Array<{ base64: string; name?: string }>;
  socialLinks: Array<{ platform: string; username: string }>;
}): string {
  const {
    businessName = 'My Business',
    businessDescription = 'Quality products crafted with care.',
    businessType,
    photos,
    socialLinks,
  } = config;

  // Limit to 6 photos to keep file size manageable
  const displayPhotos = photos.slice(0, 6);
  const hasPhotos = displayPhotos.length > 0;

  // Build social links HTML
  const socialLinksHTML = socialLinks
    .filter(link => link.username)
    .map(link => {
      const platformConfig: Record<string, { url: string; label: string; svg: string }> = {
        instagram: {
          url: `https://instagram.com/${link.username}`,
          label: 'Instagram',
          svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
        },
        facebook: {
          url: `https://facebook.com/${link.username}`,
          label: 'Facebook',
          svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        },
        pinterest: {
          url: `https://pinterest.com/${link.username}`,
          label: 'Pinterest',
          svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24 18.635 24 24 18.633 24 12.013 24 5.393 18.635 0 12.017 0z"/></svg>',
        },
      };

      const cfg = platformConfig[link.platform];
      if (!cfg) return '';

      return `<a href="${cfg.url}" target="_blank" rel="noopener noreferrer" class="social-link social-${link.platform}">${cfg.svg} ${cfg.label}</a>`;
    })
    .filter(Boolean)
    .join('\n              ');

  // Build photo gallery HTML
  const galleryHTML = hasPhotos
    ? `<section class="gallery">
          <h2>Our Work</h2>
          <div class="gallery-grid">
            ${displayPhotos.map((photo, i) => `<div class="gallery-item"><img src="${photo.base64}" alt="${photo.name || `Photo ${i + 1}`}" loading="lazy" /></div>`).join('\n            ')}
          </div>
        </section>`
    : '';

  // Build social section HTML
  const socialSectionHTML = socialLinksHTML
    ? `<section class="contact">
          <h2>Get In Touch</h2>
          <p>Custom orders welcome! Reach out on social media.</p>
          <div class="social-links">
              ${socialLinksHTML}
          </div>
        </section>`
    : '';

  // Determine the business emoji
  const typeEmojis: Record<string, string> = {
    wreaths: '\uD83C\uDF3F',
    candles: '\uD83D\uDD6F\uFE0F',
    jewelry: '\uD83D\uDC8D',
    pottery: '\uD83C\uDFFA',
    'baked-goods': '\uD83E\uDDC1',
    soap: '\uD83E\uDDFC',
    art: '\uD83C\uDFA8',
    clothing: '\uD83D\uDC57',
    woodwork: '\uD83E\uDEB5',
    flowers: '\uD83D\uDC90',
    crafts: '\u2702\uFE0F',
    other: '\uD83D\uDECD\uFE0F',
  };
  const heroEmoji = typeEmojis[businessType] || '\uD83D\uDECD\uFE0F';

  // Determine about text
  const hasLongDescription = businessDescription && businessDescription.length > 60;
  const heroSubtitle = hasLongDescription
    ? 'Quality products crafted with care.'
    : (businessDescription || 'Quality products crafted with care.');
  const aboutText = hasLongDescription
    ? businessDescription
    : 'Every piece is thoughtfully crafted with quality materials and attention to detail. We take pride in creating products that bring joy to our customers.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(businessName)}</title>
  <meta name="description" content="${escapeHTML(businessDescription || 'Quality products crafted with care.')}" />
  <meta property="og:title" content="${escapeHTML(businessName)}" />
  <meta property="og:description" content="${escapeHTML(businessDescription || 'Quality products crafted with care.')}" />
  <meta property="og:type" content="website" />
  <style>
    /* Reset & Base */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --sage-50: #f0f4f0;
      --sage-100: #dce5dc;
      --sage-200: #b8ccb8;
      --sage-300: #8fb08f;
      --sage-400: #6e9470;
      --sage-500: #5a7d5a;
      --sage-600: #4a6b4a;
      --cream-50: #faf8f5;
      --cream-100: #f5f0eb;
      --cream-200: #e8e0d8;
      --cream-300: #d4c9be;
      --brown: #3d2e22;
      --brown-light: #7a6a5e;
      --gold-200: #f0dca0;
      --gold-300: #d4a843;
    }

    html {
      scroll-behavior: smooth;
      -webkit-text-size-adjust: 100%;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--cream-50);
      color: var(--brown);
      line-height: 1.6;
      min-height: 100vh;
    }

    /* Hero */
    .hero {
      position: relative;
      min-height: 70vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
      background: linear-gradient(135deg, var(--sage-500), var(--sage-400), var(--sage-300));
      overflow: hidden;
    }

    .hero::before {
      content: '${heroEmoji}';
      position: absolute;
      font-size: 200px;
      opacity: 0.12;
      user-select: none;
      pointer-events: none;
    }

    .hero-emoji {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: fadeInUp 0.8s ease-out;
    }

    .hero h1 {
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 800;
      color: white;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
      animation: fadeInUp 0.8s ease-out 0.15s both;
    }

    .hero p {
      color: rgba(255,255,255,0.85);
      font-size: 1.05rem;
      max-width: 28rem;
      animation: fadeInUp 0.8s ease-out 0.3s both;
    }

    /* Content Container */
    .content {
      max-width: 40rem;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }

    /* About Section */
    .about {
      text-align: center;
      margin-bottom: 3rem;
    }

    .about h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--brown);
      margin-bottom: 0.75rem;
    }

    .about p {
      color: var(--brown-light);
      font-size: 0.95rem;
      line-height: 1.7;
      max-width: 32rem;
      margin: 0 auto;
    }

    /* Gallery */
    .gallery {
      margin-bottom: 3rem;
    }

    .gallery h2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--brown);
      text-align: center;
      margin-bottom: 1.25rem;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    @media (min-width: 640px) {
      .gallery-grid { gap: 0.75rem; }
    }

    .gallery-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid var(--cream-200);
      background: var(--cream-100);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .gallery-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(61, 46, 34, 0.12);
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .gallery-item:hover img {
      transform: scale(1.05);
    }

    /* Contact / Social */
    .contact {
      text-align: center;
      margin-bottom: 2rem;
    }

    .contact h2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--brown);
      margin-bottom: 0.5rem;
    }

    .contact p {
      color: var(--brown-light);
      font-size: 0.9rem;
      margin-bottom: 1.25rem;
    }

    .social-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
    }

    .social-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 9999px;
      color: white;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .social-link:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .social-link svg {
      flex-shrink: 0;
    }

    .social-instagram { background: var(--sage-500); }
    .social-facebook { background: #4267B2; }
    .social-pinterest { background: var(--gold-300); }

    /* Footer */
    .footer {
      text-align: center;
      padding: 1.5rem 0;
      border-top: 1px solid var(--cream-200);
      margin-top: 1rem;
    }

    .footer p {
      font-size: 0.625rem;
      color: var(--brown-light);
      opacity: 0.6;
    }

    .footer a {
      color: var(--sage-500);
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .fade-in {
      animation: fadeInUp 0.6s ease-out both;
    }

    .fade-in-delay-1 { animation-delay: 0.1s; }
    .fade-in-delay-2 { animation-delay: 0.2s; }
    .fade-in-delay-3 { animation-delay: 0.3s; }
  </style>
</head>
<body>
  <!-- Hero -->
  <header class="hero">
    <div class="hero-emoji">${heroEmoji}</div>
    <h1>${escapeHTML(businessName)}</h1>
    <p>${escapeHTML(heroSubtitle)}</p>
  </header>

  <main class="content">
    <!-- About -->
    <section class="about fade-in">
      <h2>About</h2>
      <p>${escapeHTML(aboutText)}</p>
    </section>

    <!-- Gallery -->
    ${galleryHTML}

    <!-- Social / Contact -->
    ${socialSectionHTML}

    <!-- Footer -->
    <footer class="footer">
      <p>Made with <a href="https://postcraft.app" target="_blank" rel="noopener noreferrer">PostCraft</a></p>
    </footer>
  </main>
</body>
</html>`;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
