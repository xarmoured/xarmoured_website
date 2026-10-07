export const lifecycle = [
  [
    'Scope',
    'Agree on the boundary.',
    'Define assets, access, exclusions, testing windows and rules of engagement. Establish how urgent findings will be communicated before any testing begins.',
  ],
  [
    'Map',
    'Understand the system.',
    'Trace entry points, identities, data flows and trust relationships. Identify which assumptions deserve a closer look.',
  ],
  [
    'Test',
    'Challenge the assumptions.',
    'Combine manual exploration with focused tooling. Test authentication, authorization, business logic and the paths between components.',
  ],
  [
    'Validate',
    'Demonstrate the impact.',
    'Reproduce exploitable behavior within the agreed scope. Chain findings where appropriate and capture the minimum evidence needed to explain the risk.',
  ],
  [
    'Report',
    'Make the evidence useful.',
    'Connect technical detail to business impact. Supply reproducible steps, contextual severity and engineering-ready remediation.',
  ],
  [
    'Remediate',
    'Address the cause.',
    'Discuss fixes with your engineers. Separate immediate containment from the underlying design or implementation change.',
  ],
  [
    'Retest',
    'Verify the boundary.',
    'Repeat the original test against the fix, check related behavior within scope and record resolved, partial or remaining risk.',
  ],
];
