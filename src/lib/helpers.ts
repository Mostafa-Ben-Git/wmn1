import { ExtractionType } from '../types';

export const getRegexPattern = (type: ExtractionType): RegExp => {
  const patterns: Record<ExtractionType, RegExp> = {
    servers: /\b(sr|s)_[a-zA-Z0-9]{1,5}_[0-9]{1,4}\b/g,
    ips: /(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})/g,
    emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    domains: /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-_.]+\.[a-zA-Z]{2,})/gi,
  };
  return patterns[type];
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

export const generateString = (
  length: number,
  includeSymbols: boolean,
  includeNumbers: boolean,
  includeUppercase: boolean
): string => {
  let chars = 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) chars += '0123456789';
  if (includeSymbols) chars += '!@#$%^&*()_-+=<>?/';

  if (chars.length === 0) {
    return '';
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};