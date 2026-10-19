import en from './en';
import pl from './pl';

export type Language = 'pl' | 'en';
type Dictionary = { [Key in keyof typeof pl]: string };

export const translations: Record<Language, Dictionary> = {
  pl,
  en,
};
