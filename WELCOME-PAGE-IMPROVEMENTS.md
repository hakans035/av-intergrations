# Welcome Page Improvements - Ambition Valley

## Reference Sites Analyzed

- **Geldgids.com** - Clean professional layout, trust badges, property cards, certification logos, AdvisKeuze verification
- **Geldinstituut.nl/kennismaking** - Conversion-focused design with pulsing blue CTA, trust logos banner (Deloitte, Rabobank, Knab, ABN AMRO), accordion FAQs, objection-handling copy, repeated CTAs throughout page

---

## Current State

The welcome screen is a single centered viewport with:
- Gradient heading: "Ontdek hoeveel belasting jij kunt besparen"
- Savings highlight: "€3.000 – €15.000 per jaar"
- Trust badges: "Slechts 2 minuten" + "100% gratis"
- CTA button: "Start de gratis check"

---

## Proposed New Structure (Top to Bottom)

The page becomes a scrollable landing page. Clicking any CTA starts the form quiz.

---

### Section 1: Hero (keep existing + add blinking indicator)

**Keep everything that's already there**, plus add above the CTA button:

> [Blinking green/blue dot] "Dit gesprek is vrijblijvend. In slechts 30 minuten vertel ik jou meteen of jij ook minimaal €3.000 aan belasting kan besparen."

- Blinking dot: small pulsing circle (like a live indicator), similar to Geldinstituut's glowing pulse effect
- Text style: slightly smaller than the main heading, white/light color

---

### Section 2: Value Proposition + Checkmarks

**Intro text:**
> Voor ondernemers en particulieren die minder belasting willen betalen en hun spaargeld aan het werk willen zetten. Vul onze Checklist in en plan je Gratis Intake.

**Checkmark list (green checkmarks like Geldinstituut):**
- Persoonlijk Traject, geen stoffig standaardadvies
- Belastingbesparing en Vermogensgroei
- Je verdient het traject terug doordat je minder belasting gaat betalen

**CTA Button:** "Start mijn intake" (same style as hero button)

---

### Section 3: Trust Banner - "Advies gegeven aan"

Horizontal logo strip with company names/logos:
- Belastingdienst
- Knab
- Deloitte
- Rabobank
- KPMG

Style: grayscale logos on a subtle background strip, similar to Geldinstituut's trust section.

---

### Section 4: Red Warning Section - "Stop met deze acties"

**Red heading:** "Stop met deze acties"

**Red bullet points (red icons/dots):**
- Je denkt dat je boekhouder jou helpt met belastingbesparing
- Je denkt dat je in jouw situatie geen belasting kan besparen
- Je zakelijke bankrekening is gevuld, maar je geld is niet voor jou aan het werk
- Je bent ondernemer, maar bouwt niks op voor je pensioen

Style: Red accent color for heading and bullet icons. Contrasting section background to draw attention. Similar to the bold/confrontational style on Geldinstituut.

---

### Section 5: "Jouw Oplossing"

**Heading:** "Jouw Oplossing"

**Subheading (larger):**
> Een persoonlijk, belastingbesparend traject waarin wij je leren hoe je jouw geld voor jezelf aan het werk zet.

**Body text (smaller):**
> Wij willen jou leren kennen. Jouw verhaal en passie. Wij zorgen er vervolgens voor dat we een strategie opstellen die past bij jou als persoon en jouw doelen en wensen.

---

### Section 6: FAQ Accordion - "Veelgestelde vragen"

**Heading:** "Veelgestelde vragen"

Accordion items (question visible, answer reveals on click):

| Question | Answer |
|---|---|
| Waarom doet mijn boekhouder/accountant dit niet? | Omdat jouw boekhouder/accountant enkel gericht is op het draaien van productie en grote aantallen cijfers. Wij zijn gericht op jou laten besparen, dat is ons enige doel! |
| Weinig mensen praten hierover, terwijl ik precies wil weten hoe dit zit. | Dit wordt niet geleerd op school. Ramin Nourzad (oprichter van Ambition Valley) heeft zelf Fiscaal Recht gestudeerd aan de Universiteit in Tilburg, ook daar werd alleen geleerd hoe het belastingstelsel werkt. Ramin heeft zichzelf aangeleerd om het vóór je te laten werken. |
| Kan een ZZP'er altijd minder belasting betalen? | JA! Tot nu toe hebben wij GEEN ENKELE ZZP'er gehad die wij niet hebben kunnen helpen. Er zijn meerdere manieren om je belastingdruk effectief te verlagen. |
| Helpen jullie met de overstap van eenmanszaak naar BV? | Jazeker. Ramin heeft deze overstap zelf enkele jaren geleden ook al gemaakt, en kan jou precies vertellen waar je rekening mee moet houden. Zo voorkom je dure fouten achteraf, en kan je dit bespaarde geld meteen voor jezelf aan het werk zetten. |
| Ik denk dat ik nog niet genoeg verdien om dit traject te doen? | Wij hebben meer dan genoeg klantcases waarbij iemand dacht niet genoeg te verdienen om belasting te kunnen besparen. Het resultaat: juist bij lagere inkomens is er vaak optimalisatie mogelijk, zodat je zelfs extra toeslagen kunt krijgen! |
| Hoe weet ik of het bij mij past? | Daar is onze gratis en vrijblijvende 15 minuten intake voor gemaakt. Tijdens deze call laten wij je meteen zien hoeveel jij aan belasting kan besparen. |

---

### Section 7: CTA Button

> "Klik hier om jouw gratis intake te starten"

Same button style, triggers the form quiz.

---

### Section 8: 3-Step Process - "In 3 minuten naar inzicht in jouw situatie"

**Heading:** "In 3 minuten naar inzicht in jouw situatie"

Three steps with numbered icons (1, 2, 3):

| Step | Heading | Description |
|---|---|---|
| 1 | Vul onze Checklist in | Wij stellen een aantal gerichte vragen over jou en je financiële situatie. Zo weten we meteen hoe we je kunnen helpen. |
| 2 | Plan je Gratis Intake | Tijdens deze call van slechts 15 minuten laten we je meteen zien hoeveel belasting jij kunt besparen. |
| 3 | Start je Route naar Financiële Vrijheid | Wij nemen je mee in jouw concrete strategie om belasting te besparen en je vermogen te laten groeien. |

---

## Design Notes (from reference analysis)

- **Geldinstituut uses**: Pulsing blue glow on CTA, grayscale trust logos, bold confrontational copy, accordion FAQs, repeated CTA buttons between sections
- **Color palette**: Keep current dark/gradient background for hero, introduce section breaks with slightly different backgrounds (e.g., subtle dark cards for FAQ, red-tinted section for warnings)
- **All CTA buttons** trigger `onStart` to begin the form quiz
- **Mobile responsive**: All sections should stack cleanly on mobile
- **Page becomes scrollable** but each CTA still starts the quiz from question 1
