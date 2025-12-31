# Task 07: Compliance Checker

## Reference

See `docs/seo-content-engine-requirements.md`:
- Section 2: Content Safety and Compliance Rules

## Objective

Implement compliance validation for financial content safety.

## Requirements

### Disclaimer Validation

#### Site-Wide Disclaimer (footer)
Dutch:
```
De informatie op deze website is uitsluitend bedoeld voor algemene informatieve doeleinden en vormt geen persoonlijk financieel, fiscaal of juridisch advies. AmbitionValley is geen financiele instelling en verricht geen financiele transacties. Raadpleeg altijd een gekwalificeerde adviseur voordat u financiele beslissingen neemt.
```

English:
```
The information on this website is intended for general informational purposes only and does not constitute personal financial, tax, or legal advice. AmbitionValley is not a financial institution and does not perform financial transactions. Always consult a qualified advisor before making financial decisions.
```

#### Per-Post Disclaimer (end of Post Body)
Dutch:
```
Disclaimer: Dit artikel is uitsluitend bedoeld ter informatie en vormt geen persoonlijk advies. De genoemde bedragen, regelingen en percentages kunnen wijzigen. Raadpleeg een gekwalificeerde adviseur voor uw specifieke situatie.
```

English:
```
Disclaimer: This article is for informational purposes only and does not constitute personal advice. The amounts, regulations, and percentages mentioned are subject to change. Consult a qualified advisor for your specific situation.
```

### Prohibited Claims Detection

Block content containing:
- Guaranteed returns (gegarandeerde besparing, guaranteed savings)
- Specific tax reduction promises without qualification
- Investment recommendations (investeer in, buy this stock)
- Urgency language (nu handelen, act now, limited time)
- Absolute statements about tax law (altijd, never, always allowed)
- Competitor superiority claims
- Unqualified expertise claims (de beste, the best)
- Medical/health financial advice
- Cryptocurrency/speculative investment content

### Tone Validation

Check for violations:
- Exclamation marks (except in quotes)
- Rhetorical questions in headlines
- First-person plural implying partnership
- Superlatives without substantiation
- Emotional appeals or fear-based messaging

### Risk Controls

Validate:
- Tax figures include year and source reference
- Tax law statements include qualification phrases
- Investment content disclaims advice provision
- Tax optimization content clarifies legal boundaries
- Rates/thresholds are verifiable against official sources

### Output

Return ComplianceCheckResult with:
- passed: boolean
- violations: array of ComplianceViolation
- warnings: array of string
- suggestions: array of string

## Acceptance Criteria

- [ ] Disclaimer presence validation working
- [ ] Prohibited claims detection implemented
- [ ] Tone validation implemented
- [ ] Risk controls implemented
- [ ] Dutch patterns detected
- [ ] English patterns detected
- [ ] Clear violation reporting
- [ ] Suggestions for fixes provided
- [ ] Unit tests for all patterns
- [ ] Integration with content generation

## Dependencies

- Task 02: Types and Configuration

## Estimated Effort

Medium
