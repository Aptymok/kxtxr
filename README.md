# KXTXR

KXTXR is a musical and audiovisual identity operated as a longitudinal system. The repository separates public representation, artistic experience, operational observation and machine-readable state.

```txt
CANON ≠ EXPERIMENT
PUBLICATION ≠ EVIDENCE
ENGAGEMENT ≠ CAUSALITY
KRY ≠ PLATFORM ALGORITHM
MISSING REMAINS MISSING
```

## Current public architecture

### `/` · Press Kit

The root route is the current public press surface.

It contains:

- INICIO
- MÚSICA
- LIVE
- PROYECTO
- ARCHIVO
- RIDER
- CONTACTO

The page may hydrate public state from `/grimoire/*.json`. If a source is unavailable, the UI must not synthesize replacement facts.

### `/artist/` · Signal Film

Interactive artist experience driven by 111, scroll/audio state, visual corpus and persistent identity routes.

The sticker surface builds a selection manifest only. It does not simulate payment or fulfilment.

### `/console/` · KXTXR Control Plane

Private/noindex operational surface above the QUE NO Representation Field.

The control plane separates two responsibilities:

- **KXTXR Control Plane**: objective, campaign, representation, platform action, observation and human decision.
- **SFI Evidence Plane**: structured result persistence, provenance, RETURN/contrast and later calibration boundaries.

Social networks are modeled as controllable/observable connectors only when a real connector is configured. Streaming services are modeled primarily as observable surfaces: catalog APIs where available and artist-analytics CSV/export ingestion where direct analytics APIs are not available.

Raw artist exports stay client-side in the initial implementation. Only sanitized summary measurements and provenance may be sent to SFI.

```txt
OBJECTIVE → CAMPAIGN → REPRESENTATION → PLATFORM ACTION
→ OBSERVATION → EVIDENCE → REGIME STATE → DECISION → RETURN
```

The SFI Regime Transition projection is **EXPERIMENTAL**. The console may preserve a candidate or missing variables; it cannot self-declare a calibrated regime transition.

```txt
REGIME CANDIDATE ≠ CALIBRATED TRANSITION
PLATFORM METRIC ≠ ARTISTIC VALUE
```

### `/edwing-registry/` · QUE NO Representation Field

Current local-first operator surface for the QUE NO pre-campaign series:

```txt
07/12 · MEMORY
08/12 · RETURN
09/12 · EMITTER
10/12 · EMBODIMENT
11/12 · INVOCATION
12/12 · APERTURA
```

Operator mode:

```txt
/edwing-registry/?mode=operator
```

The operator may record actual platform observations, responses and representation choices.

On ingest the interface:

1. stores the entry in the current browser;
2. calculates KRY when sufficient denominators exist;
3. downloads a JSON copy;
4. optionally sends a copy through the configured backend when the private token and email environment are valid.

None of those steps alone makes the entry canonical.

```txt
LOCAL ENTRY ≠ CANONICAL PERSISTENCE
```

### Historical REM618 registry

The original REM618 operator surface is preserved unchanged at:

```txt
/historical/rem618/edwing-registry.html
```

It remains historical and must not be used for QUE NO.

## Current temporal campaign state

As of 2026-09-29, the public runtime keeps **10/12** active until the scheduled **11/12 · INVOCATION** publication at **21:00 America/Mexico_City**.

The campaign definition separates schedule from evidence:

```txt
SCHEDULED ≠ PUBLISHED
PUBLISHED ≠ RETURN
```

The frontend may promote 11/12 when the scheduled timestamp is reached, but that clock transition does not itself establish platform publication, reception or RETURN.

## QUE NO representation definition

Machine-readable campaign definition:

```txt
/campaigns/que-no/representation-engine.json
```

The current internal comparison indicator is KRY (KXTXR Representation Yield).

KRY compares observed behavior per exposure across representations. It does not claim to reproduce or infer the recommendation algorithm of Instagram, TikTok, YouTube or any other platform.

## Grimoire / persistent data layer

The Grimoire is currently a machine-readable/public data layer, not the root UI.

```txt
grimoire/
├── ledger.json
├── experiment.json
├── logbook.json
├── snapshots.json
├── retrolongitudinal.json
├── questions.json
├── notes.json
├── story.json
├── artist-presence.json
├── discovery-mesh.json
└── kxtxr-grimoire-longitudinal-canon-v3.json
```

### Ledger

`/grimoire/ledger.json` is the public state ledger.

Current declared phase: **QUE NO / PRECAMPAIGN**.

### Discovery mesh

`/grimoire/discovery-mesh.json` resolves KXTXR consistently across human search, crawlers and AI systems.

Canonical direct identity edges currently include Spotify, Apple Music, YouTube and the source repository. Instagram and TikTok remain unresolved until direct profile URLs are verified.

## Identity boundary

- **KXTXR**: artist/system identity.
- **Edwing**: human operator / performer.
- **SFI**: external observation / provenance layer; not the artist.
- **AI**: assisted analysis / code / representation; not authorial authority.

Human operators retain release, acceptance, rejection, sequencing and publication authority.

## Historical preservation

REM618 remains preserved under `/historical/rem618/`.

Historical artifacts are not silently rewritten to match the current campaign.

## Current lineage

```txt
REM618
  ↓
111
  ↓
RETURN
  ↓
QUE NO
  ↓
07/12 → 08/12 → 09/12 → 10/12 → 11/12 → 12/12
```

The next representation is allowed to change only when the observed RETURN warrants it.


## KXTXR Music Field

The control console now includes a sanitized HIVE relational model derived from the 2026-09-28 album analysis.

Machine sources:

```txt
/data/music-field.json
/data/observation-schema.json
/data/knowledge-plane.json
/api/kxtxr-context
```

The music field contains eight observed new masters:

```txt
AELUDE
BLVCK
E.D.
ESPINAS
LUGAR LUNAR
ODIO DECIRTELO
REM3002 ACUSTICO
YNLPC
```

REM618, 111 and QUE NO remain reference objects. KYRIE | PHOSPHOROS remains NOT_OBSERVED in the HIVE analysis because no WAV was supplied.

KXTXR reconstructs knowledge through explicit provenance:

```txt
SOURCE → OBSERVATION → DERIVATION → INFERENCE
→ DECISION → ACTION → RETURN → CONTRAST
```

A pairwise audio distance is a relational measurement, not an artistic score. A representation hypothesis is not canonical meaning. An AI proposal is not human authority.


## KXTXR AI Field Curator

The operator console can host three governed AI roles when `OPENAI_API_KEY` is configured server-side:

- **AI Observer** — analyzes the current KXTXR context and local RETURN windows while preserving observed / derived / inferred / missing partitions.
- **Field Curator** — proposes ADD / UPDATE / SUSPEND / DEPRECATE / NO_CHANGE operations over the versioned observation schema.
- **Site Editor** — proposes the smallest reversible site mutation that increases information gain without claiming artistic authority.

Machine surfaces:

```txt
/data/ai-governance.json
/api/kxtxr-ai
/api/kxtxr-ai-pr
```

The draft-PR bridge can apply only allowlisted JSON-manifest add/replace operations. It requires explicit human approval and a server-side `GITHUB_KXTXR_TOKEN`. HTML/CSS/JS remain PLAN_ONLY. No AI-generated PR is auto-merged.
