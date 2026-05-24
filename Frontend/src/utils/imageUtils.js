const svgDataUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

export const FOOD_PLACEHOLDER = svgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#F5E6D3"/><circle cx="32" cy="28" r="14" fill="#5D2E17" opacity="0.15"/><ellipse cx="32" cy="26" rx="10" ry="6" fill="#D97706" opacity="0.35"/><path d="M22 42h20l-2 8H24l-2-8z" fill="#5D2E17" opacity="0.25"/></svg>'
);

export const HERO_PLACEHOLDER = svgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#3d1f0f"/><stop offset="100%" stop-color="#5D2E17"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><text x="400" y="310" text-anchor="middle" fill="#D97706" font-family="system-ui,sans-serif" font-size="42" font-weight="700">MATKA HOUSE</text></svg>'
);

export function resolveImageUrl(img, placeholder = FOOD_PLACEHOLDER) {
  if (!img) return placeholder;
  if (img.startsWith('data:')) return img;
  if (img.startsWith('http')) return img;
  return img.startsWith('/') ? img : `/${img}`;
}

export function handleImageError(e, placeholder = FOOD_PLACEHOLDER) {
  if (e.target.dataset.fallback === 'true') return;
  e.target.dataset.fallback = 'true';
  e.target.onerror = null;
  e.target.src = placeholder;
}
