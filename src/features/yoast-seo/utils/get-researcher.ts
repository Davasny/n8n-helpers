// based on https://github.com/Yoast/wordpress-seo/blob/b42e2c6fc4554caffe502e39b19436b92b9c4e07/packages/yoastseo/spec/specHelpers/getResearcher.js

import DefaultResearcher from "yoastseo/build/languageProcessing/languages/_default/Researcher";
import ArabicResearcher from "yoastseo/build/languageProcessing/languages/ar/Researcher";
import CatalanResearcher from "yoastseo/build/languageProcessing/languages/ca/Researcher";
import CzechResearcher from "yoastseo/build/languageProcessing/languages/cs/Researcher";
import GermanResearcher from "yoastseo/build/languageProcessing/languages/de/Researcher";
import GreekResearcher from "yoastseo/build/languageProcessing/languages/el/Researcher";
import EnglishResearcher from "yoastseo/build/languageProcessing/languages/en/Researcher";
// import SpanishResearcher from "yoastseo/build/languageProcessing/languages/es/Researcher";
import FarsiResearcher from "yoastseo/build/languageProcessing/languages/fa/Researcher";
import FrenchResearcher from "yoastseo/build/languageProcessing/languages/fr/Researcher";
import HebrewResearcher from "yoastseo/build/languageProcessing/languages/he/Researcher";
import HungarianResearcher from "yoastseo/build/languageProcessing/languages/hu/Researcher";
import IndonesianResearcher from "yoastseo/build/languageProcessing/languages/id/Researcher";
import ItalianResearcher from "yoastseo/build/languageProcessing/languages/it/Researcher";
import JapaneseResearcher from "yoastseo/build/languageProcessing/languages/ja/Researcher";
import NorwegianResearcher from "yoastseo/build/languageProcessing/languages/nb/Researcher";
import DutchResearcher from "yoastseo/build/languageProcessing/languages/nl/Researcher";
import PolishResearcher from "yoastseo/build/languageProcessing/languages/pl/Researcher";
import PortugueseResearcher from "yoastseo/build/languageProcessing/languages/pt/Researcher";
import RussianResearcher from "yoastseo/build/languageProcessing/languages/ru/Researcher";
import SlovakResearcher from "yoastseo/build/languageProcessing/languages/sk/Researcher";
import SwedishResearcher from "yoastseo/build/languageProcessing/languages/sv/Researcher";
import TurkishResearcher from "yoastseo/build/languageProcessing/languages/tr/Researcher";

type ResearcherConstructor = typeof DefaultResearcher;

const researchers: Record<string, ResearcherConstructor> = {
  ar: ArabicResearcher,
  ca: CatalanResearcher,
  de: GermanResearcher,
  en: EnglishResearcher,
  // commented out bc throws error during import
  // es: SpanishResearcher,
  fa: FarsiResearcher,
  fr: FrenchResearcher,
  he: HebrewResearcher,
  hu: HungarianResearcher,
  id: IndonesianResearcher,
  it: ItalianResearcher,
  nb: NorwegianResearcher,
  nl: DutchResearcher,
  pl: PolishResearcher,
  pt: PortugueseResearcher,
  ru: RussianResearcher,
  sv: SwedishResearcher,
  tr: TurkishResearcher,
  cs: CzechResearcher,
  sk: SlovakResearcher,
  ja: JapaneseResearcher,
  el: GreekResearcher,
};

// Turn the key-value pairs into a Map to prevent a js/unvalidated-dynamic-method-call.
// Refer to https://github.com/Yoast/wordpress-seo/security/code-scanning/45 for details.
const researchersMap = new Map<string, ResearcherConstructor>(
  Object.entries(researchers),
);

/**
 * Retrieves the language-specific Researcher.
 *
 * @param language The language for which to load the correct Researcher.
 *
 * @returns The Researcher constructor for the given language.
 */
export default function getResearcher(language: string): ResearcherConstructor {
  const researcher = researchersMap.get(language);

  if (typeof researcher === "function") {
    return researcher;
  }

  return DefaultResearcher;
}
