export const LANGS = ['de', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/** Localised paths (without base). Keys are stable page identifiers. */
export const ROUTES = {
  home: { de: '/', en: '/en/' },
  careers: { de: '/karriere/', en: '/en/careers/' },
  imprint: { de: '/impressum/', en: '/en/imprint/' },
  privacy: { de: '/datenschutz/', en: '/en/privacy/' },
} as const satisfies Record<string, Record<Lang, string>>;

export type PageKey = keyof typeof ROUTES;

/** Section ids on the home page, localised for readable URLs. */
export const ANCHORS = {
  de: { services: 'leistungen', clients: 'kunden', team: 'team', contact: 'kontakt' },
  en: { services: 'services', clients: 'clients', team: 'team', contact: 'contact' },
} as const satisfies Record<Lang, Record<string, string>>;

/** Short interface strings. Editorial copy lives in the CMS (src/content). */
export const UI = {
  de: {
    skip: 'Zum Inhalt springen',
    nav: { services: 'Leistungen', clients: 'Kunden', team: 'Team', careers: 'Karriere', contact: 'Kontakt' },
    menu: 'Menü',
    switchLang: 'English',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    toTop: 'Nach oben',
    placeholder: 'Bild folgt',
    contactPerson: 'Ansprechpartner',
    form: {
      name: 'Name',
      company: 'Firma',
      email: 'E-Mail',
      phone: 'Telefon (optional)',
      type: 'Art der Produktion',
      date: 'Termin / Zeitraum',
      location: 'Ort',
      services: 'Benötigte Unterstützung',
      message: 'Nachricht',
      submit: 'Anfrage per E-Mail senden',
      required: 'Pflichtfeld',
      invalidEmail: 'Bitte eine gültige E-Mail-Adresse angeben.',
      note: 'Beim Absenden öffnet sich Ihr E-Mail-Programm mit einer vorbereiteten Nachricht an uns. Es werden keine Daten über diese Website übertragen oder gespeichert.',
      opened: 'Ihr E-Mail-Programm wurde geöffnet. Falls nicht, schreiben Sie uns direkt an',
      subject: 'Produktionsanfrage',
      choose: 'Bitte wählen',
    },
    jobs: {
      open: 'Offene Stellen',
      none: 'Aktuell sind keine Stellen ausgeschrieben.',
      apply: 'Jetzt bewerben',
      location: 'Einsatzort',
      type: 'Anstellung',
      until: 'Bewerbung bis',
    },
  },
  en: {
    skip: 'Skip to content',
    nav: { services: 'Services', clients: 'Clients', team: 'Team', careers: 'Careers', contact: 'Contact' },
    menu: 'Menu',
    switchLang: 'Deutsch',
    imprint: 'Imprint',
    privacy: 'Privacy',
    toTop: 'Back to top',
    placeholder: 'Image to follow',
    contactPerson: 'Contact',
    form: {
      name: 'Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone (optional)',
      type: 'Production type',
      date: 'Date / period',
      location: 'Location',
      services: 'Support required',
      message: 'Message',
      submit: 'Send enquiry by email',
      required: 'Required',
      invalidEmail: 'Please enter a valid email address.',
      note: 'Submitting opens your email client with a prepared message to us. No data is transmitted or stored by this website.',
      opened: 'Your email client has been opened. If not, write to us directly at',
      subject: 'Production enquiry',
      choose: 'Please select',
    },
    jobs: {
      open: 'Open positions',
      none: 'There are currently no open positions.',
      apply: 'Apply now',
      location: 'Location',
      type: 'Employment',
      until: 'Apply by',
    },
  },
} as const;
