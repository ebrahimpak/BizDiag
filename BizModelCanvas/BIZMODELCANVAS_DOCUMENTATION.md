# BizModelCanvas Module

## Purpose

BizModelCanvas is a bilingual set of jArchi tools for inspecting Business Model Canvas (BMC) content in an Archi model,
analyzing value-proposition structures, and translating between BMC and ArchiMate-oriented views. Its scope is
model-level analysis and transformation; it does not determine whether an organization's business model is viable or
complete.

## Research basis

The module's BMC-to-ArchiMate transformation is informed by the Open Group white paper, which demonstrates how BMC
building blocks can be represented with ArchiMate business-layer concepts and with strategy and motivation concepts,
and illustrates views such as Value Proposition, Customer Interaction, and Core Capability [1]. The quantitative
alignment study by Engelsman et al. describes a different, more specific method: connecting quantified e3value business
models with ArchiMate enterprise architectures to derive workload requirements and relate architecture costs and
investments to business value [2]. BizModelCanvas does not implement that e3value method; the study provides research
context for relating business models and architecture quantitatively, not a description of this module's algorithms.

The BMC itself organizes a business model into nine interrelated building blocks [3]. BizDiag's detection rules,
relationship heuristics, analyses, and generated layouts are software implementation choices informed by the cited
modeling work; they should not be read as a verbatim or exhaustive implementation of either paper.

## Main capabilities

- **Inspect and diagnose value propositions:** analyze value-related elements and relationships, identify structural
  conditions for review, examine duplicate or inconsistently typed value propositions, and report cleanup candidates.
- **Create an enhanced value view:** assemble value propositions and related business concepts and relationships into
  an ArchiMate-oriented view.
- **Transform a BMC to ArchiMate:** detect a view named as a Business Model Canvas/BMC, extract its nine blocks and
  modeled connections, and generate semantic Value Proposition, Customer Interaction, and Core Capability views.
  The mapping uses ArchiMate business concepts and relationship heuristics informed by [1].
- **Generate a BMC draft from an ArchiMate model:** collect selected business-layer concepts and organize them into
  BMC blocks. The generated content is heuristic and requires business-owner review.
- **Draw and export a BMC graphic:** render BMC content from model elements as a graphic for review or editing.

The English and Persian GUI launchers provide access to the analysis, view-creation, conversion, and testing scripts.
Individual scripts are also available in `scripts/`; mapping and generation helpers are in `lib/`.

## Use and interpretation

Run the scripts inside Archi with jArchi and an open model. For BMC-to-ArchiMate conversion, name the source view so it
includes “Business Model Canvas” or “BMC”; the detector uses the view name to avoid matching unrelated diagrams.
Inspect the generated views and any diagnostic or cleanup suggestions before using them as architectural or business
decisions. In particular, generated model content is a structured starting point, not an automatically validated
business model.

## References

[1] E. Walters, “Modeling the Business Model Canvas with the ArchiMate® Specification: Using the ArchiMate 3.1
Specification to Model the Building Blocks of the Business Model Canvas,” The Open Group, Feb. 2020. [Online].
Available: https://publications.opengroup.org/w195.

[2] W. Engelsman, J. Gordijn, T. Haaker, M. van Sinderen, and R. Wieringa, “Quantitative Alignment of Enterprise
Architectures with the Business Model,” in *Conceptual Modeling: 40th International Conference, ER 2021*, Lecture
Notes in Computer Science, vol. 13011, pp. 189–198. Cham, Switzerland: Springer, 2021, doi:
10.1007/978-3-030-89022-3_16.

[3] A. Osterwalder and Y. Pigneur, *Business Model Generation: A Handbook for Visionaries, Game Changers, and
Challengers*. Hoboken, NJ, USA: John Wiley & Sons, 2010.
