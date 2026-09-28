// Model outputs awaiting inspection. `label` is the reference verdict (true = PASS) under
// the rubric; `why` explains it. Borderline items also carry a second inspector's verdict.
export interface Item {
  id: string;
  task: string;
  input: string;
  output: string;
  label: boolean;
  why: string;
  borderline?: boolean;
  inspector?: boolean;
}

export const RUBRIC = [
  'Supported: every claim is backed by the given context or input.',
  'On-question: it answers what was actually asked.',
  'No inventions: no made-up facts, numbers or citations.',
  'Classifiers: the predicted label is right for the input.',
  'Saying the context does not contain the answer counts as PASS.',
];

const I = (id: string, task: string, input: string, output: string, label: boolean, why: string, extra: Partial<Item> = {}): Item =>
  ({ id, task, input, output, label, why, ...extra });

export const BANK: Item[] = [
  I('rag-refund', 'Answer from context', 'Context: "Refunds are issued within 14 days of an approved return." Q: How long do refunds take?', 'Refunds are issued within 14 days once your return is approved.', true, 'Fully supported by the context.'),
  I('rag-hours', 'Answer from context', 'Context: "Support is open 9:00–17:00 CET, Monday to Friday." Q: Is support open on Saturday?', 'Yes, support is open on Saturdays from 10:00.', false, 'Invents Saturday hours; the context says Monday to Friday only.'),
  I('rag-unknown', 'Answer from context', 'Context: "Plans: Basic, Team, Enterprise." Q: How much does Team cost?', 'The context lists the plans but does not include prices.', true, 'Correctly abstains; prices are not in the context.'),
  I('rag-price-made', 'Answer from context', 'Context: "Plans: Basic, Team, Enterprise." Q: How much does Team cost?', 'Team costs $29 per user per month.', false, 'Made-up price.'),
  I('rag-offtopic', 'Answer from context', 'Context: "API keys can be rotated from Settings → Security." Q: How do I rotate my API key?', 'Our API supports JSON and XML responses.', false, 'Off-question.'),
  I('rag-partial', 'Answer from context', 'Context: "Exports run nightly at 02:00 UTC and are kept for 30 days." Q: When do exports run?', 'Exports run nightly at 02:00 UTC.', true, 'Answers the question; omitting retention is fine.'),
  I('rag-hedge', 'Answer from context', 'Context: "The beta is available to Enterprise customers." Q: Can Team customers use the beta?', 'Probably not. The context only mentions Enterprise customers having access.', true, 'Reasonable reading, and it flags the limit of the context.', { borderline: true, inspector: false }),
  I('rag-overreach', 'Answer from context', 'Context: "Data is stored in the EU (Frankfurt)." Q: Where is data stored?', 'Data is stored in the EU (Frankfurt), fully GDPR-compliant and ISO 27001 certified.', false, 'Adds unsupported compliance claims.', { borderline: true, inspector: true }),
  I('rag-cite', 'Answer from context', 'Context [doc 3]: "SSO supports SAML 2.0 and OIDC." Q: Which SSO protocols are supported?', 'SAML 2.0 and OIDC [doc 3].', true, 'Correct, with the right citation.'),
  I('rag-cite-wrong', 'Answer from context', 'Context [doc 3]: "SSO supports SAML 2.0 and OIDC." Q: Which SSO protocols are supported?', 'SAML 2.0, OIDC and LDAP [doc 5].', false, 'Invents LDAP and cites a document that was not given.'),
  I('rag-unit', 'Answer from context', 'Context: "Max upload size is 2 GB." Q: Can I upload a 1500 MB file?', 'Yes. 1500 MB is under the 2 GB limit.', true, 'Correct inference from the context.'),
  I('rag-unit-wrong', 'Answer from context', 'Context: "Max upload size is 2 GB." Q: Can I upload a 2.5 GB file?', 'Yes, files up to 3 GB are accepted.', false, 'Contradicts the stated limit.'),
  I('lang-es', 'Detect language (ISO 639-1)', '"¿Dónde está la estación de tren?"', 'Label: es', true, 'Spanish.'),
  I('lang-pt', 'Detect language (ISO 639-1)', '"Obrigado pela ajuda, até amanhã."', 'Label: es', false, 'It is Portuguese (pt).'),
  I('lang-nl', 'Detect language (ISO 639-1)', '"Kunt u mij helpen met mijn bestelling?"', 'Label: nl', true, 'Dutch.'),
  I('lang-mixed', 'Detect language (ISO 639-1)', '"Can you send the rapport by morgen?"', 'Label: en', true, 'Mostly English with Dutch words; en is defensible.', { borderline: true, inspector: false }),
  I('sent-pos', 'Classify sentiment', '"Setup took two minutes and everything just worked."', 'Label: positive', true, 'Clearly positive.'),
  I('sent-sarcasm', 'Classify sentiment', '"Great, another update that logs me out every hour."', 'Label: positive', false, 'Sarcasm: negative.'),
  I('sent-mixed', 'Classify sentiment', '"The app is fast, but support never answers."', 'Label: negative', true, 'Mixed; the complaint dominates. Negative is acceptable.', { borderline: true, inspector: true }),
  I('sent-neutral', 'Classify sentiment', '"I received the invoice on Tuesday."', 'Label: negative', false, 'Neutral statement.'),
  I('tox-ok', 'Toxicity filter', '"This release is garbage, fix the sync bug."', 'Label: not toxic', true, 'Harsh about the product, not a person.', { borderline: true, inspector: false }),
  I('tox-bad', 'Toxicity filter', '"People like you should not be allowed online."', 'Label: not toxic', false, 'Targets a person: toxic.'),
  I('tox-quote', 'Toxicity filter', '"The user wrote: \'you idiot\'. Please review."', 'Label: toxic', false, 'Reporting a quote is not itself toxic.', { borderline: true, inspector: true }),
  I('route-billing', 'Route ticket', '"I was charged twice this month."', 'Team: Billing', true, 'Billing issue.'),
  I('route-wrong', 'Route ticket', '"The API returns 500 on every POST."', 'Team: Billing', false, 'Engineering issue.'),
  I('route-both', 'Route ticket', '"After upgrading my plan, the export API stopped working."', 'Team: Engineering', true, 'The failing API is the actionable part.', { borderline: true, inspector: false }),
  I('extract-total', 'Extract invoice total', 'Invoice: "Subtotal €100.00 · VAT 21% €21.00 · Total €121.00"', 'total: 121.00 EUR', true, 'Correct total.'),
  I('extract-sub', 'Extract invoice total', 'Invoice: "Subtotal €100.00 · VAT 21% €21.00 · Total €121.00"', 'total: 100.00 EUR', false, 'Picked the subtotal.'),
  I('extract-currency', 'Extract invoice total', 'Invoice: "Total due: 1.250,00 €"', 'total: 1250.00 EUR', true, 'Correctly normalised the European number format.'),
  I('extract-guess', 'Extract invoice total', 'Invoice: "Total due: see attached statement."', 'total: 0.00 EUR', false, 'Should report the total is missing, not 0.', { borderline: true, inspector: true }),
  I('sum-ok', 'Summarise ticket (≤ 20 words)', 'Ticket: customer cannot reset password; reset email never arrives; checked spam; uses Outlook.', 'Password reset emails are not arriving (not in spam) for an Outlook user.', true, 'Faithful and short.'),
  I('sum-invent', 'Summarise ticket (≤ 20 words)', 'Ticket: customer cannot reset password; reset email never arrives; checked spam; uses Outlook.', 'Customer locked out after 5 failed logins; wants account deleted.', false, 'Invents facts.'),
  I('sum-long', 'Summarise ticket (≤ 20 words)', 'Ticket: dashboard charts load slowly since Monday for the whole EU team.', 'Since Monday, the whole EU team has experienced slow-loading dashboard charts, which is affecting their daily reporting workflows significantly.', false, 'Over the 20-word limit and adds an unstated impact.', { borderline: true, inspector: false }),
  I('sql-ok', 'Write SQL', 'Q: count orders per customer in 2025. Table orders(id, customer_id, created_at).', "SELECT customer_id, COUNT(*) FROM orders WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01' GROUP BY customer_id;", true, 'Correct and index-friendly.'),
  I('sql-year', 'Write SQL', 'Q: count orders per customer in 2025. Table orders(id, customer_id, created_at).', 'SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id;', false, 'Ignores the 2025 filter.'),
  I('sql-func', 'Write SQL', 'Q: count orders per customer in 2025. Table orders(id, customer_id, created_at).', 'SELECT customer_id, COUNT(*) FROM orders WHERE YEAR(created_at) = 2025 GROUP BY customer_id;', true, 'Correct result, though it cannot use an index on created_at.', { borderline: true, inspector: true }),
  I('tr-ok', 'Translate to French', '"Your order has shipped."', '"Votre commande a été expédiée."', true, 'Correct.'),
  I('tr-literal', 'Translate to French', '"Break a leg tonight!"', '"Casse-toi une jambe ce soir !"', false, 'Literal and rude; the idiom is "Merde !" or "Bonne chance !".', { borderline: true, inspector: false }),
];
