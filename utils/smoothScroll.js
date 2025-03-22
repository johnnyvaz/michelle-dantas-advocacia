export const smoothScroll = (e) => {
  e.preventDefault();
  const targetId = e.currentTarget.getAttribute("href").replace("/#", "#");
  const targetElement = document.querySelector(targetId);
  
  if (targetElement) {
    const headerOffset = 100; // Ajuste este valor conforme necessário
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
}; 