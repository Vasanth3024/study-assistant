export const isTyping = (el) =>
  ['INPUT', 'TEXTAREA', 'SELECT'].includes(el?.tagName) || Boolean(el?.isContentEditable);
