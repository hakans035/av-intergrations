import { FormDefinition, FormAnswers, LogicCondition, FormField } from './types';

export function evaluateCondition(
  condition: LogicCondition,
  answers: FormAnswers,
  fields: FormField[]
): boolean {
  if (condition.op === 'always') {
    return true;
  }

  if (condition.op === 'and') {
    return condition.vars.every((v) => {
      if ('op' in v && v.op && v.vars) {
        return evaluateCondition(v as LogicCondition, answers, fields);
      }
      return true;
    });
  }

  if (condition.op === 'or') {
    return condition.vars.some((v) => {
      if ('op' in v && v.op && v.vars) {
        return evaluateCondition(v as LogicCondition, answers, fields);
      }
      return false;
    });
  }

  if (condition.op === 'is' || condition.op === 'is_not') {
    const fieldVar = condition.vars.find((v) => v.type === 'field');
    const choiceVar = condition.vars.find((v) => v.type === 'choice');

    if (!fieldVar || !choiceVar) return condition.op === 'is_not';

    const fieldRef = fieldVar.value as string;
    const choiceValue = choiceVar.value as string;
    const answer = answers[fieldRef];

    if (!answer) return condition.op === 'is_not';

    // Find the field
    const field = fields.find((f) => f.ref === fieldRef);

    // Handle yes_no fields - answer is 'yes' or 'no' string
    if (field?.type === 'yes_no') {
      const isMatch = answer === choiceValue;
      return condition.op === 'is' ? isMatch : !isMatch;
    }

    // Handle multiple choice fields
    if (field?.properties.choices) {
      const choice = field.properties.choices.find((c) => c.ref === choiceValue);
      if (!choice) return condition.op === 'is_not';

      const isMatch = Array.isArray(answer)
        ? answer.includes(choice.ref) || answer.includes(choice.label)
        : answer === choice.ref || answer === choice.label;

      return condition.op === 'is' ? isMatch : !isMatch;
    }

    // Fallback for other field types
    const isMatch = answer === choiceValue;
    return condition.op === 'is' ? isMatch : !isMatch;
  }

  return false;
}

export function getNextFieldIndex(
  currentFieldRef: string,
  answers: FormAnswers,
  form: FormDefinition
): { type: 'field' | 'thankyou'; index: number } | null {
  const currentFieldIndex = form.fields.findIndex((f) => f.ref === currentFieldRef);

  // Check if there's logic for this field
  const logic = form.logic.find((l) => l.ref === currentFieldRef);

  if (logic) {
    for (const action of logic.actions) {
      if (evaluateCondition(action.condition, answers, form.fields)) {
        if (action.details.to.type === 'thankyou') {
          const thankyouIndex = form.thankyou_screens.findIndex(
            (s) => s.ref === action.details.to.value
          );
          return { type: 'thankyou', index: thankyouIndex >= 0 ? thankyouIndex : 0 };
        }

        if (action.details.to.type === 'field') {
          const nextFieldIndex = form.fields.findIndex(
            (f) => f.ref === action.details.to.value
          );
          if (nextFieldIndex >= 0) {
            return { type: 'field', index: nextFieldIndex };
          }
        }
      }
    }
  }

  // Default: go to next field
  const nextIndex = currentFieldIndex + 1;
  if (nextIndex < form.fields.length) {
    return { type: 'field', index: nextIndex };
  }

  // End of form - go to default thank you screen
  return { type: 'thankyou', index: 0 };
}

export function interpolateTemplate(
  template: string,
  answers: FormAnswers,
  fields: FormField[],
  encodeForUrl: boolean = false
): string {
  return template.replace(/\{\{field:([^}]+)\}\}/g, (_, fieldRef) => {
    const answer = answers[fieldRef];
    if (!answer) return '';
    const value = Array.isArray(answer) ? answer.join(', ') : String(answer);
    return encodeForUrl ? encodeURIComponent(value) : value;
  });
}
