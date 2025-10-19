// based on https://github.com/Yoast/wordpress-seo/blob/b42e2c6fc4554caffe502e39b19436b92b9c4e07/packages/yoastseo/spec/specHelpers/getResearcher.js

import * as DefaultResearcherMod from "yoastseo/build/languageProcessing/languages/_default/Researcher";
import * as ArabicResearcherMod from "yoastseo/build/languageProcessing/languages/ar/Researcher";
import * as CatalanResearcherMod from "yoastseo/build/languageProcessing/languages/ca/Researcher";
import * as CzechResearcherMod from "yoastseo/build/languageProcessing/languages/cs/Researcher";
import * as GermanResearcherMod from "yoastseo/build/languageProcessing/languages/de/Researcher";
import * as GreekResearcherMod from "yoastseo/build/languageProcessing/languages/el/Researcher";
import * as EnglishResearcherMod from "yoastseo/build/languageProcessing/languages/en/Researcher";
// import SpanishResearcher from "yoastseo/build/languageProcessing/languages/es/Researcher";
import * as FarsiResearcherMod from "yoastseo/build/languageProcessing/languages/fa/Researcher";
import * as FrenchResearcherMod from "yoastseo/build/languageProcessing/languages/fr/Researcher";
import * as HebrewResearcherMod from "yoastseo/build/languageProcessing/languages/he/Researcher";
import * as HungarianResearcherMod from "yoastseo/build/languageProcessing/languages/hu/Researcher";
import * as IndonesianResearcherMod from "yoastseo/build/languageProcessing/languages/id/Researcher";
import * as ItalianResearcherMod from "yoastseo/build/languageProcessing/languages/it/Researcher";
import * as JapaneseResearcherMod from "yoastseo/build/languageProcessing/languages/ja/Researcher";
import * as NorwegianResearcherMod from "yoastseo/build/languageProcessing/languages/nb/Researcher";
import * as DutchResearcherMod from "yoastseo/build/languageProcessing/languages/nl/Researcher";
import * as PolishResearcherMod from "yoastseo/build/languageProcessing/languages/pl/Researcher";
import * as PortugueseResearcherMod from "yoastseo/build/languageProcessing/languages/pt/Researcher";
import * as RussianResearcherMod from "yoastseo/build/languageProcessing/languages/ru/Researcher";
import * as SlovakResearcherMod from "yoastseo/build/languageProcessing/languages/sk/Researcher";
import * as SwedishResearcherMod from "yoastseo/build/languageProcessing/languages/sv/Researcher";
import * as TurkishResearcherMod from "yoastseo/build/languageProcessing/languages/tr/Researcher";

type AnyModule = { default?: unknown; Researcher?: unknown } | unknown;
type ResearcherConstructor = new (...args: any[]) => any;

function unwrapCtor(mod: AnyModule): unknown {
  // Try common shapes: function itself, .default, nested .default.default, named Researcher
  let current: any = mod;
  for (let i = 0; i < 3; i++) {
    if (typeof current === "function") return current;
    if (current && typeof current === "object") {
      if (typeof current.Researcher === "function") return current.Researcher;
      if ("default" in current) {
        current = current.default;
        continue;
      }
    }
    break;
  }
  return current;
}

function normalizeCtor(mod: AnyModule, fallback: ResearcherConstructor): ResearcherConstructor {
  const unwrapped = unwrapCtor(mod);
  if (typeof unwrapped === "function") return unwrapped as ResearcherConstructor;
  return fallback;
}

// Resolve the default researcher first for fallback purposes.
const DefaultResearcher = ((): ResearcherConstructor => {
  const unwrapped = unwrapCtor(DefaultResearcherMod);
  if (typeof unwrapped === "function") return unwrapped as ResearcherConstructor;
  // As a last resort, return a minimal passthrough class to avoid crashes.
  // Yoast assessors expect methods from AbstractResearcher, so this is only a guard.
  return class FallbackResearcher {
    constructor(_paper: any) {}
  } as unknown as ResearcherConstructor;
})();

const ArabicResearcher = normalizeCtor(ArabicResearcherMod, DefaultResearcher);
const CatalanResearcher = normalizeCtor(CatalanResearcherMod, DefaultResearcher);
const CzechResearcher = normalizeCtor(CzechResearcherMod, DefaultResearcher);
const GermanResearcher = normalizeCtor(GermanResearcherMod, DefaultResearcher);
const GreekResearcher = normalizeCtor(GreekResearcherMod, DefaultResearcher);
const EnglishResearcher = normalizeCtor(EnglishResearcherMod, DefaultResearcher);
const FarsiResearcher = normalizeCtor(FarsiResearcherMod, DefaultResearcher);
const FrenchResearcher = normalizeCtor(FrenchResearcherMod, DefaultResearcher);
const HebrewResearcher = normalizeCtor(HebrewResearcherMod, DefaultResearcher);
const HungarianResearcher = normalizeCtor(HungarianResearcherMod, DefaultResearcher);
const IndonesianResearcher = normalizeCtor(IndonesianResearcherMod, DefaultResearcher);
const ItalianResearcher = normalizeCtor(ItalianResearcherMod, DefaultResearcher);
const JapaneseResearcher = normalizeCtor(JapaneseResearcherMod, DefaultResearcher);
const NorwegianResearcher = normalizeCtor(NorwegianResearcherMod, DefaultResearcher);
const DutchResearcher = normalizeCtor(DutchResearcherMod, DefaultResearcher);
const PolishResearcher = normalizeCtor(PolishResearcherMod, DefaultResearcher);
const PortugueseResearcher = normalizeCtor(PortugueseResearcherMod, DefaultResearcher);
const RussianResearcher = normalizeCtor(RussianResearcherMod, DefaultResearcher);
const SlovakResearcher = normalizeCtor(SlovakResearcherMod, DefaultResearcher);
const SwedishResearcher = normalizeCtor(SwedishResearcherMod, DefaultResearcher);
const TurkishResearcher = normalizeCtor(TurkishResearcherMod, DefaultResearcher);

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
  // researcher is already normalized to a constructor above
  return researchersMap.get(language) ?? DefaultResearcher;
}
