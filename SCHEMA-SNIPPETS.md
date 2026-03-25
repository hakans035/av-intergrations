# Schema Markup Snippets for Webflow

> Paste these in Webflow: **Page Settings → Custom Code → Before `</head>`**

---

## 1. FAQ Page (`/faq`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Wat levert Ambition Valley mij concreet op?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Onze klanten besparen gemiddeld EUR 3.000 tot EUR 15.000 per jaar aan belasting. Daarnaast krijg je een persoonlijke vermogensstrategie, toegang tot ons dashboard en begeleiding bij de uitvoering."
      }
    },
    {
      "@type": "Question",
      "name": "Is dit geschikt voor zzp'ers, ondernemers en particulieren?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja. Wij werken met zzp'ers, mkb-ondernemers, DGA's en particulieren met vermogen. Elk traject wordt afgestemd op jouw specifieke situatie."
      }
    },
    {
      "@type": "Question",
      "name": "Hoe werkt de 100% terugverdiengarantie?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Als je ons plan volgt en binnen 12 maanden je investering niet terugverdient, begeleiden wij je gratis verder totdat je dat wel bereikt."
      }
    },
    {
      "@type": "Question",
      "name": "Wat kost het en welke pakketten zijn er?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wij bieden drie pakketten: Financieel Fundament (EUR 995), Private Wealth (EUR 2.250) en Ambition Wealth Circle (EUR 3.500). Alle prijzen zijn exclusief btw."
      }
    },
    {
      "@type": "Question",
      "name": "Hoe verschilt Ambition Valley van een boekhouder of accountant?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wij gaan verder dan aangiftes. Wij bouwen een complete financiele strategie met belastingoptimalisatie, vermogensopbouw en persoonlijke begeleiding."
      }
    },
    {
      "@type": "Question",
      "name": "Wie zitten er achter Ambition Valley?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ambition Valley is opgericht door Hakan Sahingoz (Strategisch Lead) en Ramin Nourzad (Fiscalist, LL.M in fiscaal recht)."
      }
    },
    {
      "@type": "Question",
      "name": "Wat heb ik nodig om te starten?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Je begint met een gratis intake. Daarin bespreken we je situatie, doelen en mogelijkheden. Na de intake ontvang je een persoonlijk advies."
      }
    },
    {
      "@type": "Question",
      "name": "Hoe weet ik of mijn gegevens veilig zijn?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wij werken volledig AVG/GDPR-compliant. Je gegevens worden versleuteld opgeslagen en nooit gedeeld met derden zonder jouw toestemming."
      }
    },
    {
      "@type": "Question",
      "name": "Kan ik tussentijds opzeggen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, je kunt altijd opzeggen. Wij geloven in onze waarde en werken liever met klanten die er vrijwillig voor kiezen."
      }
    },
    {
      "@type": "Question",
      "name": "Bieden jullie ook doorlopende begeleiding?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja. Na afronding van je traject kun je gebruik blijven maken van ons dashboard en onze community. Bij de Premium pakketten is doorlopende begeleiding inbegrepen."
      }
    },
    {
      "@type": "Question",
      "name": "Werken jullie met een no cure, no pay model?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nee, maar wij bieden wel een 100% terugverdiengarantie. Je betaalt vooraf en wij garanderen dat je je investering terugverdient."
      }
    },
    {
      "@type": "Question",
      "name": "Hoe lang duurt een traject gemiddeld?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Dat hangt af van je situatie en pakket. Een basistraject duurt gemiddeld 4-8 weken, een uitgebreid traject 3-6 maanden."
      }
    }
  ]
}
</script>
```

---

## 2. Contact Page (`/contact-us`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Ambition Valley",
  "legalName": "Ambition Valley VOF",
  "url": "https://ambitionvalley.nl",
  "telephone": "+31636167812",
  "email": "info@ambitionvalley.nl",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Laanstraat 82-04",
    "addressLocality": "Soest",
    "postalCode": "3762 KE",
    "addressCountry": "NL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 52.1731,
    "longitude": 5.2922
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "17:00"
  },
  "areaServed": "NL",
  "priceRange": "$$",
  "knowsAbout": [
    "Belastingoptimalisatie",
    "Vermogensgroei",
    "Fiscale strategie",
    "BV en holding structuren",
    "ZZP pensioenopbouw"
  ]
}
</script>
```

---

## 3. Homepage (`/`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Ambition Valley",
  "legalName": "Ambition Valley VOF",
  "url": "https://ambitionvalley.nl",
  "logo": "https://ambitionvalley.nl/logo.png",
  "foundingDate": "2025",
  "founders": [
    {
      "@type": "Person",
      "name": "Hakan Sahingoz",
      "jobTitle": "Oprichter & Strategisch Lead",
      "url": "https://ambitionvalley.nl/team/hakan-sahingoz"
    },
    {
      "@type": "Person",
      "name": "Ramin Nourzad",
      "jobTitle": "Oprichter & Fiscalist (LL.M)",
      "url": "https://ambitionvalley.nl/team/ramin"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Laanstraat 82-04",
    "addressLocality": "Soest",
    "postalCode": "3762 KE",
    "addressCountry": "NL"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+31636167812",
    "email": "info@ambitionvalley.nl",
    "contactType": "customer service",
    "availableLanguage": ["Dutch", "English"],
    "areaServed": "NL"
  },
  "sameAs": [
    "https://www.linkedin.com/company/ambitionvalley",
    "https://www.facebook.com/people/Ambitionvalley/61580967114292/"
  ],
  "knowsAbout": [
    "Belastingoptimalisatie",
    "Vermogensgroei",
    "Box 3 belasting",
    "BV en holding structuren",
    "ZZP pensioenopbouw",
    "Fiscale strategie"
  ]
}
</script>
```

---

## 4. Team Pages

### `/team/hakan-sahingoz` — Before `</head>`

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Hakan Sahingoz",
  "jobTitle": "Oprichter & Strategisch Lead",
  "url": "https://ambitionvalley.nl/team/hakan-sahingoz",
  "email": "hakan@ambitionvalley.nl",
  "worksFor": {
    "@type": "Organization",
    "name": "Ambition Valley",
    "url": "https://ambitionvalley.nl"
  },
  "knowsAbout": ["Financiele strategie", "Vermogensgroei", "Ondernemerschap"]
}
</script>
```

### `/team/ramin` — Before `</head>`

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ramin Nourzad",
  "jobTitle": "Oprichter & Fiscalist (LL.M)",
  "url": "https://ambitionvalley.nl/team/ramin",
  "email": "ramin@ambitionvalley.nl",
  "sameAs": [
    "https://www.linkedin.com/in/ramin-nourzad-2baab2183/",
    "https://www.instagram.com/raminnourzad/"
  ],
  "worksFor": {
    "@type": "Organization",
    "name": "Ambition Valley",
    "url": "https://ambitionvalley.nl"
  },
  "hasCredential": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "degree",
    "name": "LL.M Fiscaal Recht"
  },
  "knowsAbout": ["Belastingoptimalisatie", "Fiscaal recht", "Box 3 belasting", "BV en holding structuren"]
}
</script>
```
