export interface FormChoice {
  id: string;
  ref: string;
  label: string;
}

export interface FieldProperties {
  randomize?: boolean;
  allow_multiple_selection?: boolean;
  allow_other_choice?: boolean;
  vertical_alignment?: boolean;
  choices?: FormChoice[];
  default_country_code?: string;
}

export interface FieldValidations {
  required?: boolean;
  max_length?: number;
  min_value?: number;
  max_value?: number;
}

export interface FormField {
  id: string;
  title: string;
  ref: string;
  type: 'short_text' | 'long_text' | 'email' | 'phone_number' | 'multiple_choice' | 'yes_no' | 'checkbox' | 'number' | 'date';
  properties: FieldProperties;
  validations: FieldValidations;
}

export interface WelcomeScreen {
  id: string;
  ref: string;
  title: string;
  properties: {
    show_button?: boolean;
    button_text?: string;
    description?: string;
  };
}

export interface ThankYouScreen {
  id: string;
  ref: string;
  title: string;
  type: 'thankyou_screen' | 'url_redirect';
  properties: {
    show_button?: boolean;
    share_icons?: boolean;
    button_mode?: string;
    button_text?: string;
    redirect_url?: string;
    description?: string;
  };
}

export interface LogicCondition {
  op: 'is' | 'is_not' | 'and' | 'or' | 'always';
  vars: Array<{
    type?: string;
    value?: string;
    op?: string;
    vars?: Array<{ type: string; value: string }>;
  }>;
}

export interface LogicAction {
  action: 'jump';
  details: {
    to: {
      type: 'field' | 'thankyou';
      value: string;
    };
  };
  condition: LogicCondition;
}

export interface Logic {
  type: string;
  ref: string;
  actions: LogicAction[];
}

export interface FormDefinition {
  id: string;
  title: string;
  type?: string;
  settings: {
    language?: string;
    progress_bar?: string;
    show_progress_bar?: boolean;
    show_question_number?: boolean;
    show_key_hint_on_choices?: boolean;
  };
  welcome_screens: WelcomeScreen[];
  thankyou_screens: ThankYouScreen[];
  fields: FormField[];
  logic: Logic[];
}

export type FormAnswers = Record<string, string | string[] | boolean>;
