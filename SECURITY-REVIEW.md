# Security Review

**Review date:** 2026-11-14  
**Scope:** Repository application code, dependency manifests, backend, Firebase/Firestore rules, and deployment configuration.

## Findings

### Critical: Vulnerable Next.js image optimization dependency

- **Affected dependency:** Next.js `16.2.10`, pinned in [`project/package-lock.json`](./project/package-lock.json).
- **Relevant configuration:** [`project/next.config.js`](./project/next.config.js) permits remote images from a wildcard `*.googleapis.com` host and enables AVIF output.
- **Advisory:** [GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4).
- **Risk:** The reviewed dependency version is affected by an unauthenticated image-optimization remote-code-execution advisory. The broad remote-image host pattern and AVIF optimization increase exposure to untrusted image inputs.
- **Recommended remediation:** Upgrade Next.js to a patched release (the review recommends at least `16.4.1`), verify the resolved Sharp version is patched, and restrict remote image hosts and paths to trusted sources.
- **Confidence:** 8/10.

The dependency audit also reported other npm and Python advisories, but the review did not establish another sufficiently clear, applicable exploitation path to include as a confirmed finding here.

## Firestore rules

The repository rules were assessed as consistent with the observed application access patterns: catalog and review reads are public; profiles are self/admin scoped; carts are owner scoped; orders are owner/admin scoped; and privileged writes are restricted. This is a repository-level review only; whether these rules are deployed to the live Firebase project could not be verified.

## Model-training schedule

The repository describes running training manually with `npm run python:train` after seeding reviews, and says training output should be stored and deployed deliberately. It does not specify an automated training schedule, planned training date, or ETA.

## Review limitations

This review did not verify deployed production configuration, live Firebase rules, or ignored local credentials/configuration. Dependency advisory results may change as upstream advisories and package versions change.
