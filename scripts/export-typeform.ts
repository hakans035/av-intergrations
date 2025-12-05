import * as fs from "fs";
import * as path from "path";

/**
 * Typeform Form Structure Export Script
 *
 * Exports the full form flow including:
 * - Fields (questions)
 * - Welcome screens
 * - Thank you screens
 * - Logic jumps
 * - Variables (scores, calculations)
 * - Settings
 * - Theme reference
 */

const TYPEFORM_API_TOKEN = process.env.TYPEFORM_API_TOKEN;
const OUTPUT_DIR = "./exports";

interface TypeformForm {
  id: string;
  title: string;
  language: string;
  fields: TypeformField[];
  hidden?: string[];
  welcome_screens?: WelcomeScreen[];
  thankyou_screens?: ThankYouScreen[];
  logic?: Logic[];
  variables?: Variable[];
  theme?: { href: string };
  workspace?: { href: string };
  settings?: FormSettings;
  cui_settings?: CUISettings;
  _links?: { display: string };
}

interface TypeformField {
  id: string;
  ref: string;
  title: string;
  type: string;
  properties?: Record<string, unknown>;
  validations?: {
    required?: boolean;
    max_length?: number;
    min_value?: number;
    max_value?: number;
  };
  attachment?: Attachment;
  layout?: Layout;
}

interface WelcomeScreen {
  ref: string;
  title: string;
  properties?: {
    show_button?: boolean;
    button_text?: string;
    description?: string;
  };
  attachment?: Attachment;
  layout?: Layout;
}

interface ThankYouScreen {
  ref: string;
  title: string;
  properties?: {
    show_button?: boolean;
    button_text?: string;
    button_mode?: string;
    redirect_url?: string;
    share_icons?: boolean;
  };
  attachment?: Attachment;
  layout?: Layout;
}

interface Attachment {
  type: string;
  href?: string;
  properties?: Record<string, unknown>;
}

interface Layout {
  type: string;
  attachment?: Attachment;
  placement?: string;
}

interface Logic {
  type: string;
  ref: string;
  actions: LogicAction[];
}

interface LogicAction {
  action: string;
  details: {
    to: { type: string; value: string };
    target?: { type: string; value: string };
    value?: { type: string; value: number };
  };
  condition: LogicCondition;
}

interface LogicCondition {
  op: string;
  vars: Array<{ type: string; value: unknown }>;
}

interface Variable {
  type: string;
  name: string;
  value: number;
}

interface FormSettings {
  language?: string;
  progress_bar?: string;
  meta?: {
    title?: string;
    allow_indexing?: boolean;
    description?: string;
    image?: { href: string };
  };
  hide_navigation?: boolean;
  is_public?: boolean;
  is_trial?: boolean;
  show_progress_bar?: boolean;
  show_typeform_branding?: boolean;
  are_uploads_public?: boolean;
  show_time_to_complete?: boolean;
  show_number_of_submissions?: boolean;
  show_cookie_consent?: boolean;
  show_question_number?: boolean;
  show_key_hint_on_choices?: boolean;
  autosave_progress?: boolean;
  free_form_navigation?: boolean;
  pro_subdomain_enabled?: boolean;
  capabilities?: {
    e2e_encryption?: { enabled: boolean; modifiable: boolean };
  };
  notifications?: {
    self?: {
      enabled?: boolean;
      recipients?: string[];
      reply_to?: string[];
      subject?: string;
    };
    respondent?: {
      enabled?: boolean;
      recipient?: string;
      reply_to?: string[];
      subject?: string;
      message?: string;
    };
  };
}

interface CUISettings {
  avatar?: string;
  typing_emulation?: boolean;
}

async function fetchWithAuth(url: string): Promise<Response> {
  if (!TYPEFORM_API_TOKEN) {
    throw new Error("TYPEFORM_API_TOKEN environment variable is required");
  }

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${TYPEFORM_API_TOKEN}`,
    },
  });
}

async function getForm(formId: string): Promise<TypeformForm> {
  const response = await fetchWithAuth(
    `https://api.typeform.com/forms/${formId}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch form: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function listForms(): Promise<{ id: string; title: string; _links: { display: string } }[]> {
  console.log("Fetching all forms...\n");

  const response = await fetchWithAuth("https://api.typeform.com/forms?page_size=200");

  if (!response.ok) {
    throw new Error(`Failed to fetch forms: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  console.log("Available forms:");
  console.log("================");
  for (const form of data.items) {
    console.log(`  ID: ${form.id}`);
    console.log(`  Title: ${form.title}`);
    console.log(`  URL: ${form._links?.display || "N/A"}`);
    console.log("");
  }

  return data.items;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, "_").substring(0, 50);
}

async function exportForm(formId: string): Promise<void> {
  console.log(`\nExporting form: ${formId}`);

  const form = await getForm(formId);

  console.log(`Title: ${form.title}`);
  console.log(`Language: ${form.language}`);
  console.log(`Fields: ${form.fields?.length || 0}`);
  console.log(`Welcome screens: ${form.welcome_screens?.length || 0}`);
  console.log(`Thank you screens: ${form.thankyou_screens?.length || 0}`);
  console.log(`Logic rules: ${form.logic?.length || 0}`);
  console.log(`Variables: ${form.variables?.length || 0}`);

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const filename = sanitizeFilename(form.title);

  // Export full form structure as JSON
  const jsonPath = path.join(OUTPUT_DIR, `${filename}_form.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(form, null, 2));
  console.log(`\nExported: ${jsonPath}`);

  // Export human-readable summary
  const summaryPath = path.join(OUTPUT_DIR, `${filename}_summary.txt`);
  const summary = generateSummary(form);
  fs.writeFileSync(summaryPath, summary);
  console.log(`Exported: ${summaryPath}`);
}

function generateSummary(form: TypeformForm): string {
  const lines: string[] = [];

  lines.push(`FORM: ${form.title}`);
  lines.push(`ID: ${form.id}`);
  lines.push(`Language: ${form.language}`);
  lines.push("=".repeat(60));
  lines.push("");

  // Welcome screens
  if (form.welcome_screens?.length) {
    lines.push("WELCOME SCREENS:");
    lines.push("-".repeat(40));
    for (const screen of form.welcome_screens) {
      lines.push(`  [${screen.ref}] ${screen.title}`);
      if (screen.properties?.description) {
        lines.push(`    Description: ${screen.properties.description}`);
      }
      if (screen.properties?.button_text) {
        lines.push(`    Button: ${screen.properties.button_text}`);
      }
    }
    lines.push("");
  }

  // Fields (Questions)
  lines.push("FIELDS (QUESTIONS):");
  lines.push("-".repeat(40));
  for (let i = 0; i < form.fields.length; i++) {
    const field = form.fields[i];
    lines.push(`  ${i + 1}. [${field.type}] ${field.title}`);
    lines.push(`     ID: ${field.id} | Ref: ${field.ref}`);
    if (field.validations?.required) {
      lines.push(`     Required: Yes`);
    }
    if (field.properties) {
      const props = Object.entries(field.properties)
        .filter(([k]) => !["fields"].includes(k))
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join(", ");
      if (props) {
        lines.push(`     Properties: ${props}`);
      }
    }
  }
  lines.push("");

  // Logic
  if (form.logic?.length) {
    lines.push("LOGIC JUMPS:");
    lines.push("-".repeat(40));
    for (const logic of form.logic) {
      lines.push(`  Field ref: ${logic.ref}`);
      for (const action of logic.actions) {
        lines.push(`    Action: ${action.action}`);
        lines.push(`    Jump to: ${action.details.to.type} = ${action.details.to.value}`);
        lines.push(`    Condition: ${JSON.stringify(action.condition)}`);
      }
      lines.push("");
    }
  }

  // Thank you screens
  if (form.thankyou_screens?.length) {
    lines.push("THANK YOU SCREENS:");
    lines.push("-".repeat(40));
    for (const screen of form.thankyou_screens) {
      lines.push(`  [${screen.ref}] ${screen.title}`);
      if (screen.properties?.redirect_url) {
        lines.push(`    Redirect: ${screen.properties.redirect_url}`);
      }
      if (screen.properties?.button_text) {
        lines.push(`    Button: ${screen.properties.button_text}`);
      }
    }
    lines.push("");
  }

  // Variables
  if (form.variables?.length) {
    lines.push("VARIABLES:");
    lines.push("-".repeat(40));
    for (const variable of form.variables) {
      lines.push(`  ${variable.name} (${variable.type}): ${variable.value}`);
    }
    lines.push("");
  }

  // Settings summary
  if (form.settings) {
    lines.push("SETTINGS:");
    lines.push("-".repeat(40));
    const s = form.settings;
    if (s.progress_bar) lines.push(`  Progress bar: ${s.progress_bar}`);
    if (s.show_progress_bar !== undefined) lines.push(`  Show progress: ${s.show_progress_bar}`);
    if (s.show_typeform_branding !== undefined) lines.push(`  Branding: ${s.show_typeform_branding}`);
    if (s.meta?.title) lines.push(`  Meta title: ${s.meta.title}`);
    if (s.meta?.description) lines.push(`  Meta description: ${s.meta.description}`);
  }

  return lines.join("\n");
}

async function exportAllForms(): Promise<void> {
  const response = await fetchWithAuth("https://api.typeform.com/forms?page_size=200");

  if (!response.ok) {
    throw new Error(`Failed to fetch forms: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Found ${data.items.length} forms to export\n`);

  for (const form of data.items) {
    await exportForm(form.id);
  }

  console.log(`\nAll forms exported to ${OUTPUT_DIR}/`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case "list":
        await listForms();
        break;
      case "export":
        if (args[1]) {
          await exportForm(args[1]);
        } else {
          console.log("Exporting all forms...");
          await exportAllForms();
        }
        break;
      case "export-all":
        await exportAllForms();
        break;
      default:
        console.log(`
Typeform Form Structure Export
==============================

Exports the full form flow: fields, logic, screens, settings.

Usage:
  npx tsx scripts/export-typeform.ts <command> [form_id]

Commands:
  list              List all your Typeform forms
  export [form_id]  Export form structure (all forms if no ID)
  export-all        Export all forms

Environment Variables:
  TYPEFORM_API_TOKEN  Your Typeform personal access token (required)

Get your API token at: https://admin.typeform.com/user/tokens

Examples:
  # List all forms
  TYPEFORM_API_TOKEN=xxx npx tsx scripts/export-typeform.ts list

  # Export a specific form
  TYPEFORM_API_TOKEN=xxx npx tsx scripts/export-typeform.ts export abc123

  # Export all forms
  TYPEFORM_API_TOKEN=xxx npx tsx scripts/export-typeform.ts export-all

Output:
  ./exports/{form_title}_form.json     Full form structure
  ./exports/{form_title}_summary.txt   Human-readable summary
`);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
