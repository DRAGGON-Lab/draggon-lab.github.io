# Content model and validation

## Draft behavior

Production includes published content only. Production has no draft nodes, no edges to draft nodes, and published content referencing draft content fails validation.

Preview/development may include drafts. Draft nodes include draft: true. Draft-related edges include draft: true. Published-to-draft references warn, not fail.

## Site graph model

Nodes represent published content objects such as research areas, tools, publications, Lab Notes, teaching resources, teaching modules, workflows, datasets, project directions, and people.

Edges represent typed relationships such as supports, uses, describes, authored_by, related_to, cites, produces, teaches, and enables.

Allowed node types: research, tool, publication, lab-note, teaching-resource, teaching-module, workflow, dataset, project-direction, person.

Allowed relationships: supports, uses, describes, authored_by, related_to, cites, produces, teaches, enables.

## Teaching Resource rules

Every Teaching Resource requires at least one link and exactly one primary: true link.

When has_detail_page: true, the resource also requires learning_outcomes, prerequisites, estimated_time, and at least one usable artifact link. "No prerequisites" is valid for beginner resources.

Optional citation and license_note fields are supported. license_note replaces the default reuse text on detail pages when present.

## Validation code ranges

- DRG001-DRG019: Reference and draft-safety checks
- DRG020-DRG039: Site graph schema and relationship checks
- DRG040-DRG059: Required metadata and general content quality checks
- DRG060-DRG079: Publication and citation checks
- DRG080-DRG099: Teaching resource checks
- DRG100-DRG119: Tool, workflow, and dataset metadata checks
- DRG120-DRG139: People, authorship, and profile-link checks
- DRG140-DRG159: Accessibility and image metadata checks
- DRG160-DRG179: SEO, sitemap, robots, and canonical URL checks
- DRG180-DRG199: Analytics and privacy checks
- DRG200-DRG219: Redirects and slug-permanence checks
- DRG220-DRG239: Navigation, routing, and page-visibility checks
- DRG240-DRG259: Homepage and curated-content checks
- DRG260-DRG279: Filters, tags, and URL-state checks
- DRG280-DRG299: External links and outbound-resource checks
- DRG300-DRG319: Build environment and deployment checks
- DRG320-DRG339: Documentation and contributor-guidance checks
- DRG340-DRG359: Licensing and repository governance checks
- DRG360-DRG379: Performance and asset checks
- DRG380-DRG399: Future reserved range

## Example validation codes

DRG001 means a referenced slug does not exist. Common fixes: check for a typo, add the missing file, or remove the reference.

DRG002 means published content references draft content in production. Common fixes: publish the target, remove the reference, or keep it for preview only.

DRG003 means an invalid site graph relationship was used.

DRG004 means an invalid site graph node type was used.

DRG005 means required metadata is missing.

DRG010 is an orphan published node warning. Orphans warn only; they do not fail builds in Version 1.
