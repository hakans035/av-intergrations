# Ambition Valley - Question Flow

## Overview
- **Form Type:** Quiz / Lead qualification form
- **Language:** Dutch (NL)
- **Estimated Completion Time:** 2 minutes
- **Total Questions:** 14 (including welcome screen and consent)
- **Disqualification Points:** 2
- **Conditional Branches:** 1

---

## Flow Diagram

```
START (Welcome Screen)
  |
  v
Q1: "Do you live in Netherlands?"
  |-- NO --> DISQUALIFIED SCREEN
  |-- YES
  v
Q2: "Current situation?" (multi-select)
  |
  v
Q3: "Annual gross income?"
  |
  v
Q4: "Investable capital?" --- GATE #2
  |-- (Employee + <50k income + <25k capital) --> DISQUALIFIED SCREEN
  |-- Otherwise
  v
Q5: "Do you have a business?"
  |-- NO --> Skip Q6, jump to Q7
  |-- YES
  v
Q6: "Legal business forms?" (conditional, only if Q5 = YES)
  |
  v
Q7: "Current investments?" (multi-select)
  |
  v
Q8: "Primary goal?" (multi-select)
  |
  v
Q9: "Timeline to start?"
  |
  v
Q10: "Full name?" (text input)
  |
  v
Q11: "Email address?" (email input)
  |
  v
Q12: "Phone number?" (phone input)
  |
  v
Q13: "Additional info?" (optional, long text)
  |
  v
Q14: Terms & consent checkbox
  |
  v
REDIRECT --> /booking (with name, email, phone, notes pre-filled)
```

---

## Welcome Screen

**Title:** "Ontdek hoeveel belasting jij kunt besparen"
*(Discover how much tax you can save)*

**Description:** "Al 728+ ondernemers ontdekten hun besparingspotentieel. Klaar in 2 minuten."
*(728+ entrepreneurs discovered their savings potential. Ready in 2 minutes.)*

**Button:** "Start de gratis check" *(Start the free check)*

**Social Proof Badge:** "728+ checks" (top-right corner)

---

## Questions

### Q1: Residency Check (Qualification Gate #1)
- **Question:** "Woon je in Nederland?" *(Do you live in the Netherlands?)*
- **Type:** Yes/No
- **Required:** Yes
- **Logic:**
  - YES --> Continue to Q2
  - NO --> Jump to Disqualification Screen

### Q2: Current Situation
- **Question:** "Wat is je huidige situatie?" *(What is your current situation?)*
- **Type:** Multiple Choice (multi-select)
- **Required:** Yes
- **Options:**
  - Loondienst *(Employed)*
  - ZZP (eenmanszaak) *(Self-employed / sole proprietorship)*
  - DGA (BV) *(Director-shareholder in limited company)*
  - VOF (vennoot) *(Partnership)*
  - Anders *(Other)*

### Q3: Annual Gross Income
- **Question:** "Wat is je totaal bruto-inkomen per jaar?" *(What is your total annual gross income?)*
- **Type:** Multiple Choice (single select)
- **Required:** Yes
- **Options:**
  - €0 - €50.000
  - €50.000 - €100.000
  - €100.000 - €200.000
  - €200.000+

### Q4: Investable Capital (Qualification Gate #2)
- **Question:** "Wat is je vrij belegbaar vermogen?" *(What is your freely investable capital?)*
- **Type:** Multiple Choice (single select)
- **Required:** Yes
- **Options:**
  - €0 - €25.000
  - €25.000 - €100.000
  - €100.000 - €250.000
  - €250.000+
- **Disqualification Logic:**
  - IF Q2 = "Loondienst" AND Q3 = "€0-€50.000" AND Q4 = "€0-€25.000"
  - THEN --> Jump to Disqualification Screen

### Q5: Existing Business
- **Question:** "Heb je nu al een onderneming of vennootschap?" *(Do you currently have a business or partnership?)*
- **Type:** Yes/No
- **Required:** Yes
- **Logic:**
  - YES --> Continue to Q6
  - NO --> Skip Q6, jump to Q7

### Q6: Business Legal Structure (Conditional)
- **Question:** "Welke rechtsvorm(en)?" *(Which legal form(s)?)*
- **Type:** Multiple Choice (multi-select)
- **Required:** Yes
- **Shown only if:** Q5 = YES
- **Options:**
  - Eenmanszaak *(Sole proprietorship)*
  - BV *(Limited company)*
  - Holding + werk-BV *(Holding + work BV)*
  - VOF *(Partnership)*
  - Overig *(Other)*

### Q7: Current Investments
- **Question:** "Heb je momenteel beleggingen?" *(Do you currently have investments?)*
- **Type:** Multiple Choice (multi-select)
- **Required:** Yes
- **Options:**
  - Aandelen / ETF's *(Stocks / ETFs)*
  - Crypto
  - Goud / Edelmetaal *(Gold / Precious metals)*
  - Nee, geen beleggingen *(No investments)*

### Q8: Primary Goal
- **Question:** "Wat is je belangrijkste doel?" *(What is your primary goal?)*
- **Type:** Multiple Choice (multi-select)
- **Required:** Yes
- **Options:**
  - Belasting besparen *(Save on taxes)*
  - Vermogen laten groeien *(Grow wealth)*
  - Eerder financieel vrij worden *(Achieve financial freedom sooner)*
  - Meer structuur aanbrengen *(Add more structure)*

### Q9: Timeline to Start
- **Question:** "Wanneer wil je starten?" *(When do you want to start?)*
- **Type:** Multiple Choice (single select)
- **Required:** Yes
- **Options:**
  - Binnen 2 weken *(Within 2 weeks)*
  - Binnen 1-2 maanden *(Within 1-2 months)*
  - Nog orienterend *(Still exploring)*

### Q10: Full Name
- **Question:** "Wat is je naam?" *(What is your name?)*
- **Type:** Short Text
- **Required:** Yes

### Q11: Email Address
- **Question:** "Op welk e-mailadres kunnen we je bereiken?" *(What email address can we reach you at?)*
- **Type:** Email
- **Required:** Yes
- **Placeholder:** "naam@voorbeeld.nl"

### Q12: Phone Number
- **Question:** "Wat is je telefoonnummer?" *(What is your phone number?)*
- **Type:** Phone Number
- **Required:** Yes
- **Default Country:** NL
- **Placeholder:** "+31 6 12345678"

### Q13: Additional Information (Optional)
- **Question:** "Nog iets dat we moeten weten? (optioneel)" *(Anything else we should know? optional)*
- **Type:** Long Text
- **Required:** No

### Q14: Terms & Submission
- **Question:** "Bijna klaar! Verstuur je gegevens" *(Almost done! Send your data)*
- **Type:** Checkbox / Consent
- **Required:** Yes
- **Option:** "Ja, stuur mijn persoonlijke besparingsadvies" *(Yes, send my personal savings advice)*

---

## End Screens

### Qualified Lead (Primary Path)
- **Type:** URL Redirect
- **Redirect:** `/booking?name={name}&email={email}&phone={phone}&notes={notes}`
- **Purpose:** Routes qualified leads to the booking system with pre-filled data

### Disqualification Screen
- **Title:** "Bedankt voor het invullen!" *(Thanks for filling it out!)*
- **Message:** "Bedankt voor je interesse! Op basis van je antwoorden is ons traject op dit moment niet de beste match voor jouw situatie. Wil je toch meer weten over wat Ambition Valley voor je kan betekenen? Bezoek onze website voor meer informatie."
*(Thanks for your interest! Based on your answers, our program is currently not the best match for your situation. Want to learn more about what Ambition Valley can do for you? Visit our website for more info.)*
- **Button:** "Naar Ambition Valley" --> https://ambitionvalley.nl/

### Default Thank You (Fallback)
- **Title:** "Klaar is Kees! Bedankt voor je tijd." *(All done! Thanks for your time.)*

---

## Post-Form: Booking Flow

After qualified leads are redirected to `/booking`:

1. **Choose booking type:**
   - 1-op-1 Intake (Free, 30 min, online via Teams)
   - Groepsdag (Free, full day, on location)

2. **Select date/time** from available calendar slots

3. **Confirm booking** (data pre-filled from form)

4. **Calendar sync** with Outlook (checks availability)

5. **Confirmation email** + Teams meeting link sent

6. **Optional:** Browse paid trajecten at `/booking/trajecten`:
   - Financieel Fundament (€1,500)
   - Private Wealth (€3,500)
   - Ambition Wealth Circle (Group program, price TBD)

---

## UX Features

- **Progress bar** showing completion percentage
- **Question numbers** displayed
- **Keyboard shortcuts:** A-Z for choices, Y/J for Yes, N for No, Enter to submit, arrows to navigate
- **Motivation toasts** at 25%, 50%, 75%, 90% progress
- **Auto-advance** on single-choice questions
- **Mobile-optimized** responsive design
