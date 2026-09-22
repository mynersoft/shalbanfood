// lib/generateSku.ts
export const generateSKU = (name) => {
  const prefix = 'TM'; //Tomartbd
  const namePart = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 5)
    .toUpperCase();

  const randomPart = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `${prefix}-${namePart}-${randomPart}`;
};
