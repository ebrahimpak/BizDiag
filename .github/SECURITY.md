# Security Policy

## 1. Purpose

The security of BizDiag and the systems in which it is used is important.

This document explains how to report potential security vulnerabilities affecting BizDiag and how such reports are handled.

## 2. Supported Versions

Security reports are primarily considered for the latest publicly available version of BizDiag.

Older versions may no longer receive security fixes or updates. Users are encouraged to use the latest available version.

## 3. Reporting a Security Vulnerability

**Please do not report suspected security vulnerabilities through public GitHub Issues or Discussions.**

Public disclosure of an unpatched vulnerability may expose other users and their systems to unnecessary risk.

Instead, report suspected vulnerabilities directly to the project maintainer by email:

**Security contact:** graaljs@mailfence.com

Please include as much relevant information as possible:

- A clear description of the suspected vulnerability.
- The affected BizDiag module, component, or functionality.
- The affected version or commit, if known.
- Steps to reproduce the issue.
- Potential security impact.
- Relevant logs, screenshots, or technical evidence, where appropriate.
- Any suggested mitigation, if available.

Please avoid including passwords, API keys, access tokens, personal information, or other confidential data in your report.

## 4. Handling of Security Reports

The project maintainer independently evaluates submitted security reports and determines the appropriate course of action.

Depending on the findings, this may include:

- Requesting additional technical information.
- Investigating and attempting to reproduce the reported issue.
- Assessing its potential impact and severity.
- Developing or recommending a corrective measure.
- Publishing an update or security-related advisory, where appropriate.

There is no guaranteed response or resolution timeframe. The handling of each report depends on its technical validity, severity, available information, and the maintainer's capacity.

Please allow reasonable time for private assessment before disclosing a suspected vulnerability publicly.

## 5. Scope and Third-Party Components

Security reports may concern:

- BizDiag source code and jArchi scripts.
- Java applications and client/server components.
- Database operations and data handling.
- Local AI integrations and related functionality.
- Configuration, file handling, and execution of scripts.
- Other components maintained and distributed as part of BizDiag.

BizDiag may also interact with or depend on third-party software, libraries, platforms, and services, including Archi, jArchi, GraalVM, Java, H2, and Ollama.

Vulnerabilities originating in third-party components should also be reported to their respective maintainers through their established security reporting channels.

This policy does not replace or override the security policies of third-party projects.

## 6. Coordinated Disclosure

Please keep vulnerability details confidential while the issue is being assessed and, where appropriate, addressed.

The project maintainer may coordinate with the reporter regarding disclosure, mitigation, and publication of relevant security information.

No specific disclosure date or remediation deadline is guaranteed.

## 7. Repository Ownership and Security Decisions

BizDiag is independently maintained.

The project maintainer retains sole authority over security assessments, prioritization, corrective changes, releases, and security-related decisions concerning the official repository.

Submitting a security report does not grant repository access, write permissions, administrative privileges, or decision-making authority.

Security reports and suggested fixes are evaluated independently by the maintainer. Any changes to the official repository are made under the maintainer's control.

## 8. No Bug Bounty Program

BizDiag does not currently operate a formal bug bounty or vulnerability reward program.

Submitting a security report does not imply eligibility for financial compensation or other rewards.

## 9. Responsible Security Research

Security research and responsible vulnerability reporting are appreciated.

Please avoid activities that could compromise the confidentiality, integrity, or availability of systems or data belonging to others.

Do not access, modify, delete, or disclose information without authorization.

---

Copyright © 2026 Ebrahim Pak

For general contribution and project communication guidelines, please refer to [CONTRIBUTING.md](CONTRIBUTING.md).
