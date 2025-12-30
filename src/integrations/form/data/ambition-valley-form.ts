import { FormDefinition } from '../types';

export const ambitionValleyForm: FormDefinition = {
  id: 'tIKMPvBf',
  title: 'Ambition Valley',
  type: 'quiz',
  settings: {
    language: 'nl',
    progress_bar: 'proportion',
    show_progress_bar: true,
    show_question_number: true,
    show_key_hint_on_choices: true,
  },
  welcome_screens: [
    {
      id: 'jKETdAJgkKOM',
      ref: 'ce8c45f1-bf73-4f84-9f36-c14b1cd0839d',
      title: 'Ontdek hoeveel belasting jij kunt besparen',
      properties: {
        show_button: true,
        button_text: 'Start de gratis check',
        description: 'Al 728+ ondernemers ontdekten hun besparingspotentieel. Klaar in 2 minuten.',
      },
    },
  ],
  thankyou_screens: [
    {
      id: 'gYwpaeGWFhQB',
      ref: 'dab7dfaa-413a-48bd-8386-1b37f7c4a661',
      title: 'Redirect',
      type: 'url_redirect',
      properties: {
        redirect_url:
          '/booking?name={{field:e4c76d43-32ad-4524-b1c2-006908648e60}}&email={{field:a24de67e-afa1-440f-8bb5-3ca5e82902ad}}&phone={{field:6f2eaa42-cd82-49b5-9c06-ad8d940023f7}}&notes={{field:6a6fd8a9-bd6a-4b89-ba43-b0d137ec8db4}}',
      },
    },
    {
      id: '3p4DfsEBU8f9',
      ref: 'a881c82c-5d7c-450e-addb-c27d47f560d0',
      title: 'Bedankt voor het invullen!',
      type: 'thankyou_screen',
      properties: {
        show_button: true,
        share_icons: false,
        button_mode: 'redirect',
        button_text: 'Bekijk alternatieven',
        redirect_url: '/booking/trajecten',
        description: `Op basis van je antwoorden lijkt het 1-op-1 traject op dit moment niet optimaal voor jou.

Maar goed nieuws: er is wél een alternatief dat perfect aansluit op jouw situatie.

Sluit je aan bij onze Ambition Valley Groepsdagen

Tijdens deze sessies krijg je:

direct toepasbare belastingbesparingstips
inzicht in hoe je vermogen kunt laten groeien
praktische uitleg op jouw niveau
een helder stappenplan dat wél bij je past
de mogelijkheid om vragen te stellen aan onze experts`,
      },
    },
    {
      id: 'DefaultTyScreen',
      ref: 'default_tys',
      title: 'Klaar is Kees! Bedankt voor je tijd.',
      type: 'thankyou_screen',
      properties: {
        show_button: false,
        share_icons: false,
      },
    },
  ],
  fields: [
    // START WITH EASY QUALIFYING QUESTIONS
    {
      id: 'RYpOL5PMj7ga',
      title: 'Woon je in Nederland?',
      ref: 'd8d36ddb-cc2b-4bd4-9b5e-0498f3032e02',
      properties: {
        randomize: false,
        allow_multiple_selection: false,
        allow_other_choice: false,
        vertical_alignment: true,
        choices: [
          { id: 'a2S3rIqGoVWd', ref: '32ba348e-bffb-498f-9145-4231df734365', label: 'Ja' },
          { id: 'kgG2Dfrohtgt', ref: '494872f3-87ff-4052-9f73-c1ab6c98a72e', label: 'Nee' },
        ],
      },
      validations: { required: true },
      type: 'multiple_choice',
    },
    {
      id: 'FOujiVuJWcBr',
      title: 'Wat is je huidige situatie?',
      ref: '8003f762-172c-4610-85ec-ffc22ec4403a',
      properties: {
        randomize: false,
        allow_multiple_selection: true,
        allow_other_choice: false,
        vertical_alignment: true,
        choices: [
          { id: 'd7lUEbqxk6aF', ref: '6516d91e-3eba-46fb-b3cb-10a9751d3c51', label: 'Loondienst' },
          { id: 'Ga8EmTOPZuUl', ref: '4ffcf7f4-4084-4cd3-8c89-3081db8c0a7d', label: 'ZZP (eenmanszaak)' },
          { id: 'Q7yHu4YGjH56', ref: '0f631b08-8aa5-4f98-972f-400cf0521cc7', label: 'DGA (BV)' },
          { id: 'iHwoajChzAnI', ref: 'a23a7525-1392-40db-bca5-4f51d6b1f775', label: 'VOF (vennoot)' },
          { id: '9mgEFxH3667J', ref: 'cb8138bf-4d53-4b53-936e-17c3de1f3ca9', label: 'Anders' },
        ],
      },
      validations: { required: true },
      type: 'multiple_choice',
    },
    {
      id: 'XvqRPGN9uz9n',
      title: 'Wat is je totaal bruto-inkomen per jaar?',
      ref: 'd07662a1-2637-457c-b071-c64637e6bf2c',
      properties: {
        randomize: false,
        allow_multiple_selection: false,
        allow_other_choice: false,
        vertical_alignment: true,
        choices: [
          { id: 'mnXrs9lPty9T', ref: 'e69a1170-f738-4fa6-ad5d-27354a085c0b', label: '€0 – €50.000' },
          { id: '8PjgnFFnbPLY', ref: '0a8d5656-c244-454e-8009-fa29ef88e5db', label: '€50.000 – €100.000' },
          { id: 'xhT4pvLRfeLO', ref: '08668935-59aa-42b8-9552-4244571be788', label: '€100.000 – €200.000' },
          { id: 'YUUwrMD0FmyP', ref: '2d24f4e2-d33e-45da-9265-3e651749a6ee', label: '€200.000+' },
        ],
      },
      validations: { required: true },
      type: 'multiple_choice',
    },
    {
      id: 'D0IBVz2aYamr',
      title: 'Wat is je vrij belegbaar vermogen?',
      ref: '6c970c5c-7d7e-474f-88b6-e40bac8b8755',
      properties: {
        randomize: false,
        allow_multiple_selection: false,
        allow_other_choice: false,
        vertical_alignment: true,
        choices: [
          { id: 'd2V2zlPp7Ezm', ref: '9bb18e4c-9412-4193-a3f1-ab5b804e2087', label: '€0 – €25.000' },
          { id: 'JWZlp6GvYqMy', ref: 'b26f975d-3fc4-4c93-9ff4-cac80d3d3732', label: '€25.000 – €100.000' },
          { id: 'tBhNE3RGwoqi', ref: 'f3282690-16bf-48f7-beb6-4c9fc8f58281', label: '€100.000 – €250.000' },
          { id: 'QRTJzaQkJkol', ref: '9a133cd2-2c9a-44de-9be9-70d1f4fda461', label: '€250.000+' },
        ],
      },
      validations: { required: true },
      type: 'multiple_choice',
    },
    {
      id: '1n7JR8JJtV3J',
      title: 'Heb je nu al een onderneming of vennootschap?',
      ref: '21a7380c-895e-44d3-ac04-0ddad29cff1f',
      properties: {},
      validations: { required: true },
      type: 'yes_no',
    },
    {
      id: 'J9raQvZc1nXL',
      title: 'Welke rechtsvorm(en)?',
      ref: 'c6a7dbed-1bd3-4fc0-b4da-764af31ecf92',
      properties: {
        randomize: false,
        allow_multiple_selection: true,
        allow_other_choice: false,
        vertical_alignment: true,
        choices: [
          { id: 'vcI06jlJbfno', ref: '244a010c-8aaa-4d57-a6c2-f3ff907c5833', label: 'Eenmanszaak' },
          { id: 'cwinuNU5D51q', ref: '36d30107-b1eb-4834-8d55-dbe0a5d2c48b', label: 'BV' },
          { id: 'ce63iAm44hGu', ref: '767cb412-b2f5-4cdc-9d13-7ffa3f6270cc', label: 'Holding + werk-BV' },
          { id: 'coyOivZ2RMHS', ref: 'ae41c16a-c849-428a-b3b8-d861f9f17319', label: 'VOF' },
          { id: '8uJAGaLmcZ23', ref: '11333c90-c5d0-4414-a16a-9179c8a824f2', label: 'Overig' },
        ],
      },
      validations: { required: true },
      type: 'multiple_choice',
    },
    {
      id: 'Bple4zovDDk1',
      title: 'Heb je momenteel beleggingen?',
      ref: '40cbcff5-a413-4486-a660-52c7020a091a',
      properties: {
        randomize: false,
        allow_multiple_selection: true,
        allow_other_choice: false,
        vertical_alignment: true,
        choices: [
          { id: 'dLK40U9EvraE', ref: '5bbd0d9e-4c74-4e0c-8f2b-67914e7dac3f', label: 'Aandelen / ETF\'s' },
          { id: '4rShiDWzErTl', ref: '0f3afe4e-5e62-4317-b197-93f04c636391', label: 'Crypto' },
          { id: 'gkpUXRZMMwka', ref: 'a40ac99b-85e0-48de-9896-7713f8112133', label: 'Goud / Edelmetaal' },
          { id: 'spvcNVMIgxWl', ref: '13582996-33e1-4329-ab1f-494e815b1d42', label: 'Nee, geen beleggingen' },
        ],
      },
      validations: { required: true },
      type: 'multiple_choice',
    },
    {
      id: '9GXn9E1413m6',
      title: 'Wat is je belangrijkste doel?',
      ref: '45f84f09-09b1-46c9-8b79-5a2c56532cce',
      properties: {
        randomize: false,
        allow_multiple_selection: true,
        allow_other_choice: false,
        vertical_alignment: true,
        choices: [
          { id: 'GevGGwaUuCMh', ref: '6c0dd0b1-1f3c-4c9a-85ca-8dcd97bec2e3', label: 'Belasting besparen' },
          { id: 'vjjHPIEFOp9c', ref: '57d27a8a-2c90-4a35-8cd4-958c801a4886', label: 'Vermogen laten groeien' },
          { id: '5oUkiKrfnhF5', ref: '448c8f09-aaf7-4ac2-b272-d1721cbfed08', label: 'Eerder financieel vrij worden' },
          { id: 'XdjHCuuTnzJO', ref: '82dea88d-b319-4191-9643-821c6fb4cf94', label: 'Meer structuur aanbrengen' },
        ],
      },
      validations: { required: true },
      type: 'multiple_choice',
    },
    {
      id: '96trMZP7yUhl',
      title: 'Wanneer wil je starten?',
      ref: '101edde3-d76e-4091-9ceb-955ea5fd7413',
      properties: {
        randomize: false,
        allow_multiple_selection: false,
        allow_other_choice: false,
        vertical_alignment: true,
        choices: [
          { id: 'akQPJqAZwsti', ref: 'ed7c3df3-d6d2-4768-b137-7a2d562af855', label: 'Binnen 2 weken' },
          { id: '3fJHT1Y9LTZL', ref: 'd8dcbce7-adea-4487-9135-626a58640870', label: 'Binnen 1-2 maanden' },
          { id: '0n1cNOFRM0OD', ref: '9ec5000a-de4b-4b32-a8a9-8daf31f42763', label: 'Nog oriënterend' },
        ],
      },
      validations: { required: true },
      type: 'multiple_choice',
    },
    // CONTACT INFO AT THE END - after user is invested
    {
      id: 'hxSYLR5tENne',
      title: 'Wat is je naam?',
      ref: 'e4c76d43-32ad-4524-b1c2-006908648e60',
      properties: {},
      validations: { required: true },
      type: 'short_text',
    },
    {
      id: 'na0RX7kQhaCm',
      title: 'Op welk e-mailadres kunnen we je bereiken?',
      ref: 'a24de67e-afa1-440f-8bb5-3ca5e82902ad',
      properties: {},
      validations: { required: true },
      type: 'email',
    },
    {
      id: 'YLdtFuXtxUCc',
      title: 'Wat is je telefoonnummer?',
      ref: '6f2eaa42-cd82-49b5-9c06-ad8d940023f7',
      properties: { default_country_code: 'NL' },
      validations: { required: true },
      type: 'phone_number',
    },
    {
      id: '29HF8hHYG9qW',
      title: 'Nog iets dat we moeten weten? (optioneel)',
      ref: '6a6fd8a9-bd6a-4b89-ba43-b0d137ec8db4',
      properties: {},
      validations: { required: false },
      type: 'long_text',
    },
    // SIMPLIFIED TERMS - combined with submit action
    {
      id: 'qVOx9HiraPWI',
      title: 'Bijna klaar! Verstuur je gegevens',
      ref: '05467da5-ab32-47ad-a77d-522ed2d6b0b2',
      properties: {
        choices: [
          { id: 'pBwNxrRg7wrm', ref: 'f38e041b-19c6-4c69-9ea5-b492996ca4d0', label: 'Ja, stuur mijn persoonlijke besparingsadvies' },
        ],
      },
      validations: { required: true },
      type: 'checkbox',
    },
  ],
  logic: [
    // If not in Netherlands -> thank you screen
    {
      type: 'field',
      ref: 'd8d36ddb-cc2b-4bd4-9b5e-0498f3032e02', // Woon je in Nederland?
      actions: [
        {
          action: 'jump',
          details: { to: { type: 'thankyou', value: 'a881c82c-5d7c-450e-addb-c27d47f560d0' } },
          condition: { op: 'is', vars: [{ type: 'field', value: 'd8d36ddb-cc2b-4bd4-9b5e-0498f3032e02' }, { type: 'choice', value: '494872f3-87ff-4052-9f73-c1ab6c98a72e' }] },
        },
      ],
    },
    // Disqualification logic: Loondienst + low income + low assets
    {
      type: 'field',
      ref: '6c970c5c-7d7e-474f-88b6-e40bac8b8755', // vrij belegbaar vermogen
      actions: [
        {
          action: 'jump',
          details: { to: { type: 'thankyou', value: 'a881c82c-5d7c-450e-addb-c27d47f560d0' } },
          condition: {
            op: 'and',
            vars: [
              { op: 'is', vars: [{ type: 'field', value: '8003f762-172c-4610-85ec-ffc22ec4403a' }, { type: 'choice', value: '6516d91e-3eba-46fb-b3cb-10a9751d3c51' }] },
              { op: 'is', vars: [{ type: 'field', value: 'd07662a1-2637-457c-b071-c64637e6bf2c' }, { type: 'choice', value: 'e69a1170-f738-4fa6-ad5d-27354a085c0b' }] },
              { op: 'is', vars: [{ type: 'field', value: '6c970c5c-7d7e-474f-88b6-e40bac8b8755' }, { type: 'choice', value: '9bb18e4c-9412-4193-a3f1-ab5b804e2087' }] },
            ],
          },
        },
      ],
    },
    // Skip "Welke rechtsvorm" if user answered "no" to having a business
    {
      type: 'field',
      ref: '21a7380c-895e-44d3-ac04-0ddad29cff1f', // Heb je onderneming?
      actions: [
        {
          action: 'jump',
          details: { to: { type: 'field', value: '40cbcff5-a413-4486-a660-52c7020a091a' } }, // Skip to beleggingen
          condition: { op: 'is', vars: [{ type: 'field', value: '21a7380c-895e-44d3-ac04-0ddad29cff1f' }, { type: 'choice', value: 'no' }] },
        },
      ],
    },
  ],
};
