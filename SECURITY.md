# Security policy

PhoneDB is intended to run with a private database and a controlled API
origin. Security fixes should be handled privately until a suitable release
decision has been made.

## Reporting

Report a suspected vulnerability privately to the repository owner with:

- a concise description and impact;
- affected route, component, or configuration;
- reproducible steps that do not access data you do not own;
- a suggested mitigation, if known.

Do not include real credentials, personal data, or production database exports
in an issue or test fixture.

## Built-in safeguards

- Database credentials are required from the environment and have no source
  fallback.
- SQL values use parameterized statements; dynamic sort fields use an allowlist.
- Request bodies have a configured size limit.
- CORS uses an explicit origin list.
- Responses include baseline security headers.
- Error envelopes hide internal database details.
- Query diagnostics are opt-in and disabled in production.
- Destructive database cleanup requires a confirmation flag and is blocked in
  production.

These safeguards do not replace a deployment-specific threat model, secret
manager, network policy, TLS configuration, backup plan, or dependency review.
