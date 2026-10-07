// Inline-style twins of the CSS classes in index.css, so the spec'd values
// (glass-card, action-btn, list-container, hero-heading, centred flex) are
// present on the elements themselves as well as in the stylesheet.
export const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.07)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderRadius: '18px',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  boxShadow: '0 10px 36px rgba(6, 7, 32, 0.5)',
};

export const actionBtnStyle = { transition: 'all 0.3s', cursor: 'pointer' };

export const listContainerStyle = { margin: '20px', textAlign: 'center' };

export const heroHeadingStyle = { fontSize: '48px', fontWeight: '800' };

export const centerFlexStyle = { display: 'flex', justifyContent: 'center' };
