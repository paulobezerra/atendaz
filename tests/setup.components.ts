// Setup da camada de teste de componente/render (jsdom).
// NÃO sobe MongoDB — isolada da suíte de integração (docs/07 §4.1).
import '@testing-library/jest-dom';

// Polyfills que o Radix UI usa e o jsdom não implementa (abrir Select/Tooltip).
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
