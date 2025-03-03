export const loader = (show) => {
  const loader = document.querySelector('.loader-container');
  if (!loader) return;
  
  if (show) {
    loader.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    loader.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
};