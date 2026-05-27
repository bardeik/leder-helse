import type { Locale } from "@/i18n/types";

export interface MotivationalQuote {
  text: string;
  author: string;
}

export const motivationalQuotesByLocale: Record<Locale, MotivationalQuote[]> = {
  no: [
    { text: "En god økt er nok til å holde rytmen i gang.", author: "Helseloggen" },
    { text: "Små steg hver dag gir store resultater over tid.", author: "Helseloggen" },
    { text: "Det viktigste er å møte opp igjen i dag.", author: "Helseloggen" },
    { text: "Du trenger ikke være perfekt for å gjøre fremgang.", author: "Helseloggen" },
    { text: "Ett godt valg er starten på neste gode valg.", author: "Helseloggen" },
    { text: "Fremgang teller mer enn tempo.", author: "Helseloggen" },
    { text: "Gode vaner bygges av repeterte enkle valg.", author: "Helseloggen" },
    { text: "Konsistens slår intensitet når målet er varig endring.", author: "Helseloggen" }
  ],
  en: [
    { text: "One good session is enough to keep the rhythm going.", author: "Leader Health Loop" },
    { text: "Small steps each day add up over time.", author: "Leader Health Loop" },
    { text: "The most important part is showing up again today.", author: "Leader Health Loop" },
    { text: "You do not need perfection to make progress.", author: "Leader Health Loop" },
    { text: "One good choice starts the next one.", author: "Leader Health Loop" },
    { text: "Progress matters more than pace.", author: "Leader Health Loop" },
    { text: "Good habits are built from repeated simple choices.", author: "Leader Health Loop" },
    { text: "Consistency beats intensity when the goal is lasting change.", author: "Leader Health Loop" }
  ]
};

export function getRandomMotivationalQuote(locale: Locale, random = Math.random): MotivationalQuote {
  const quotes = motivationalQuotesByLocale[locale];
  const index = Math.floor(random() * quotes.length);
  return quotes[index] ?? quotes[0]!;
}
