# Contributing to BizDiag

Thank you for your interest in **BizDiag — Intelligent Enterprise Architecture & Digital Strategy Automation**.

Users are welcome to explore the project, report technical issues, ask questions, and communicate suggestions for improvement. This document explains the project's contribution policy, development considerations, and procedures for communicating proposed changes.

## 1. Project Ownership and Contribution Policy

BizDiag is an independently maintained open-source project. Its ownership, administration, technical direction, development roadmap, and official repository management remain under the exclusive control of its creator and maintainer, Ebrahim Pak.

Public access to the repository does not grant permission to modify its contents directly, commit changes, or exercise administrative control over the project.

**All changes to the official BizDiag repository are exclusively managed and committed by the project maintainer.**

External users may report issues, communicate suggestions, ask questions, and submit proposals for consideration. However, all proposed changes must first be communicated directly to the project maintainer by email.

The project maintainer independently evaluates every proposal and retains exclusive authority to decide whether to implement, modify, postpone, or reject it.

No external contributor is granted repository write access, commit privileges, administrative privileges, or decision-making authority.

Submitting a suggestion, proposal, patch, or other material does not create any obligation for the maintainer to implement or incorporate it.

## 2. Ways to Participate

Users may participate in the BizDiag community in the following ways:

- **Bug Reports:** Identifying and reporting defects in existing scripts, applications, and modules.
- **Suggestions:** Recommending improvements to existing functionality or proposing new capabilities.
- **Technical Discussions:** Asking questions and discussing Enterprise Architecture, automation, and related technical subjects.
- **jArchi and ArchiMate:** Suggesting new scripts and model automation capabilities.
- **Java Applications:** Recommending Java-based utilities, services, and supporting applications.
- **Architecture Analysis:** Proposing algorithms and techniques for Enterprise Architecture analysis, assessment, and diagnostics.
- **Business–IT Alignment:** Suggesting improvements to business–IT alignment analysis.
- **Capability-Based Planning:** Recommending improvements to capability assessment, planning, and transformation-support functionality.
- **Business Model Analysis:** Suggesting tools and transformations for business model analysis.
- **AI Integrations:** Proposing AI-assisted architecture analysis, documentation, and decision-support capabilities.
- **Documentation:** Identifying inaccuracies and suggesting improvements to technical documentation.
- **Performance and Reliability:** Reporting performance issues and recommending optimizations.

These activities do not grant participants authority to modify the official repository.

## 3. Communicating Proposed Changes

**All proposals concerning changes to BizDiag must be communicated directly to the project maintainer by email.**

Before developing or preparing a substantial change, users should first describe their proposal and its intended purpose in an email.

A proposal should, where applicable, include:

- A description of the proposed change.
- Its purpose and expected benefits.
- The affected BizDiag module or component.
- The technical approach being considered.
- Relevant references, examples, or supporting materials.
- Potential dependencies or compatibility considerations.

The maintainer will independently evaluate the proposal and may request additional information or clarification.

Submitting a proposal does not constitute approval to proceed with its implementation or guarantee that the proposed functionality will be incorporated into BizDiag.

## 4. Development Environment

BizDiag incorporates multiple technologies and development environments. The prerequisites depend on the particular module being considered.

The principal technologies used across the project include:

| Technology | Purpose |
|---|---|
| Archi | Enterprise Architecture modeling environment |
| ArchiMate | Enterprise Architecture modeling language |
| jArchi | Scripting and automation within Archi |
| GraalVM / GraalJS | JavaScript execution and Java interoperability |
| Java | Supporting applications, services, and infrastructure |
| H2 Database | Relational data persistence where required |
| JSON / JSONL | Data exchange, storage, and logging |
| Ollama | Local AI model integration and experimentation |

### 4.1 jArchi Development

Proposals involving jArchi scripts should take into account the Archi environment and the scripting capabilities provided by jArchi.

Relevant technical considerations include:

- Use the APIs and scripting conventions supported by the project's target jArchi environment.
- Follow the existing organization and naming conventions of the relevant module.
- Consider the ArchiMate element types, relationships, and model structures involved.
- Avoid unintended modifications to existing models.
- Validate scripts against representative ArchiMate models.
- Document required model structures, input data, and execution prerequisites.

Scripts should be designed to operate predictably within the Archi environment and avoid unnecessary dependencies.

### 4.2 Java Development

Java-related proposals should take into account the existing implementation style and architectural conventions of the relevant module.

In particular:

- Prefer clear, maintainable, and modular implementations.
- Avoid introducing unnecessary frameworks or dependencies.
- Use standard Java APIs where they adequately address the requirement.
- Use `java.util.logging` when logging is required; do not introduce SLF4J dependencies or APIs.
- Handle exceptions explicitly and appropriately.
- Avoid unnecessarily broad exception declarations.
- Document non-obvious implementation decisions and important interfaces.

Where a Java application interacts with jArchi, GraalJS, databases, or external services, its integration requirements should be clearly documented.

### 4.3 AI Integrations

AI-related proposals should distinguish between experimental functionality and functionality intended for regular use.

Relevant considerations include:

- Document the required AI runtime, model, and configuration.
- Identify external services and dependencies.
- Avoid embedding API keys, passwords, tokens, or other credentials in source code.
- Prefer environment variables or appropriate local configuration mechanisms for sensitive values.
- Document model limitations and relevant operational requirements.
- Preserve human review and control over consequential model or architecture modifications.

Where practical, local execution and data privacy should be considered when designing AI-assisted functionality.

## 5. Repository Structure and Organization

BizDiag is organized into modules addressing different aspects of Enterprise Architecture automation and intelligence.

Anyone proposing a new module or modification should familiarize themselves with the existing repository structure.

Proposed changes should, where applicable:

- Place new modules in appropriate locations according to their functionality.
- Follow existing naming and organizational conventions.
- Keep module-specific resources together where practical.
- Avoid duplicating functionality already provided by another module.
- Include documentation explaining the module's purpose, prerequisites, and usage.
- Identify dependencies on other BizDiag modules or external components.

Changes to shared libraries and infrastructure components require particular consideration because their behavior may affect multiple modules.

## 6. Coding and Documentation Guidelines

Proposed implementations should prioritize clarity, consistency, maintainability, and compatibility with the existing project.

### 6.1 General Guidelines

- Use meaningful names for variables, functions, classes, and files.
- Keep implementations focused on their intended responsibilities.
- Avoid unnecessary complexity and duplication.
- Follow the conventions already established in the relevant module.
- Remove unused code, temporary debugging statements, and unnecessary files.
- Include comments where they clarify non-obvious logic or important design decisions.
- Avoid comments that merely repeat what the code already expresses.
- Avoid unrelated modifications.

### 6.2 Documentation

Where applicable, proposed changes should include updates to relevant documentation, such as:

- Module descriptions and usage instructions.
- Installation and configuration requirements.
- Script execution procedures.
- Input and output specifications.
- Data structures and interfaces.
- Dependencies and integration requirements.
- Examples and expected results.
- Known limitations and compatibility considerations.

### 6.3 Research-Based Functionality

BizDiag incorporates concepts and techniques from Enterprise Architecture, business–IT alignment, capability-based planning, business model analysis, and related research areas.

Proposals implementing research-based methods should, where applicable:

- Identify the underlying methodology or theoretical foundation.
- Provide appropriate references to original publications or authoritative sources.
- Distinguish established methods from adaptations and newly proposed approaches.
- Explain important assumptions, assessment criteria, and analytical procedures.
- Avoid presenting experimental results or unvalidated assumptions as established findings.

Academic and professional attribution should be preserved when incorporating ideas, methods, or materials from external sources.

## 7. Testing and Validation

Proposed changes should be validated before being submitted for consideration.

Testing requirements depend on the nature of the proposed change.

Examples include:

- **jArchi scripts:** Execute scripts in the relevant Archi environment using representative ArchiMate models.
- **Java applications:** Verify compilation, execution, and relevant application behavior.
- **Architecture analysis algorithms:** Validate calculations, assessment criteria, and analytical outputs using appropriate test cases.
- **Data transformations:** Check input handling, output correctness, and data integrity.
- **Database functionality:** Verify persistence, queries, and expected database behavior.
- **AI integrations:** Test configuration, model interaction, error handling, and expected outputs.
- **Documentation:** Check technical accuracy, formatting, links, and consistency with the implementation.

When submitting a proposal, describe the validation performed.

If a change has not been tested in a particular environment, explicitly state that limitation.

## 8. Reporting Issues

Users are welcome to report bugs, unexpected behavior, and other technical problems through the repository's GitHub issue tracker.

Where applicable, include:

- A clear and descriptive title.
- The affected BizDiag module or component.
- Relevant software versions and development environment.
- Steps required to reproduce the problem.
- Expected behavior.
- Actual behavior.
- Relevant error messages or logs.
- A minimal example or model structure demonstrating the problem, if possible.

Issue reports are intended for identifying and discussing problems. They do not constitute authorization to modify the official repository.

Please avoid including passwords, API keys, personal information, confidential business data, or other sensitive information in publicly accessible issues.

## 9. Submission and Integration of Changes

BizDiag does not accept external commits or direct modifications to its official repository.

**The project maintainer is the sole person authorized to commit changes to the official BizDiag repository.**

The procedure for proposing a change is as follows:

1. Contact the project maintainer by email.
2. Describe the proposed change and its intended purpose.
3. Wait for the maintainer's response before proceeding with substantial implementation work.
4. If requested, provide supporting materials, source code, documentation, patches, or other relevant files by email.
5. Allow the maintainer to independently review and evaluate the submitted material.
6. Respond to any requests for clarification or additional information.
7. Wait for the maintainer's final decision.

The maintainer may independently:

- Accept or reject a proposal.
- Request clarification or additional material.
- Modify a proposed implementation.
- Implement the proposed functionality independently.
- Incorporate only selected parts of the submitted material.
- Postpone consideration of a proposal.
- Decline a proposal without providing detailed justification.

External pull requests are not part of the official BizDiag contribution and integration process. Contributors should not expect changes submitted through GitHub pull requests to be reviewed or incorporated.

### 9.1 Official Repository Management

All official modifications, additions, deletions, and updates are performed and committed exclusively by the project maintainer.

External users must not be granted or assume commit privileges, repository write permissions, or administrative access.

The maintainer alone determines the timing, scope, content, and manner of changes incorporated into the official repository.

### 9.2 Communication of Decisions

The project maintainer will communicate decisions concerning submitted proposals directly to the relevant contributor by email, where appropriate.

Submission of a proposal does not guarantee a response within a particular timeframe, acceptance, implementation, or incorporation into an upcoming release.

## 10. Licensing and Attribution

BizDiag is released under the **CeCILL-B Free Software License**.

All materials considered for incorporation into the official BizDiag project must be compatible with the project's licensing terms.

Anyone submitting material for consideration must:

- Ensure that they have the necessary rights to submit the code, documentation, and other materials.
- Identify themselves as the authors of their original contributions and indicate the date of creation, as required by Article 5.2 of the CeCILL-B License.
- Preserve existing copyright, intellectual property, and licensing notices.
- Retain applicable third-party notices and attributions.
- Identify externally sourced code, assets, libraries, and other materials, together with their applicable licenses.
- Avoid submitting materials whose licensing terms are incompatible with the project's distribution requirements.

### 10.1 Ownership of Contributions

Contributors retain the intellectual property rights in their original contributions, in accordance with Article 6.2 of the CeCILL-B License.

Submitting material for consideration does not transfer ownership or copyright to the project maintainer.

Any authorization required for incorporating, reproducing, modifying, and distributing submitted material as part of BizDiag must be appropriately established before its incorporation.

The applicable CeCILL-B licensing and attribution requirements remain in force.

### 10.2 Review and Acceptance

All proposed contributions are subject to the independent review and approval of the project maintainer.

The project maintainer retains exclusive authority to determine whether submitted material is accepted, modified, implemented, or rejected for inclusion in the official BizDiag repository.

Submitting material does not grant repository write access, commit privileges, administrative privileges, or decision-making authority over the project.

### 10.3 Research and Professional Attribution

For research, academic work, technical documentation, presentations, publications, and other works that make substantial use of BizDiag, citation of the project and its author is requested as a matter of scholarly and professional attribution.

The repository includes a `CITATION.cff` file containing the preferred citation metadata. GitHub's **Cite this repository** functionality can also be used to obtain the project's citation information.

For further information, consult the repository's `LICENSE` and `LICENSE-FR` files.

## 11. Security Considerations

Please do not report security vulnerabilities through publicly accessible GitHub issues.

Use GitHub's private vulnerability reporting mechanism, if enabled for the repository, or follow the instructions in `SECURITY.md`.

Proposed changes should also avoid introducing:

- Hardcoded credentials or API keys.
- Unnecessary exposure of sensitive model or business data.
- Insecure handling of external inputs.
- Unnecessary network access or data transmission.
- Unintended modifications to local files or architecture models.

Security and data privacy should be considered throughout the development and integration process.

## 12. Questions and Technical Discussions

Questions, suggestions, and technical discussions concerning BizDiag are welcome.

For general questions and technical discussions, use the repository's GitHub Discussions feature if enabled, or open an appropriate issue.

**All proposals for changes to the official project, however, must be communicated directly to the project maintainer by email: graaljs@mailfence.com **

---

Thank you for your interest in BizDiag.

**BizDiag — Intelligent Enterprise Architecture & Digital Strategy Automation**

Copyright © 2026 Ebrahim Pak.
