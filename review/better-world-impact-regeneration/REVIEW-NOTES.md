# Better World & Impact — review notes (not part of the public design)

These notes go with the review prototype in this folder (`out/prototype.html`, screenshots in `screenshots/`). They
are editorial and approval items only. Nothing here appears on the page.

## Decisions needed before publication

1. **The three approach moments need their explanations.** Section 2 ("Our approach: impact built into the
   architecture of capital") shows the three moments, each with a labelled "Copy pending" placeholder:
   - *When capital is structured…*
   - *When capital is owned…*
   - *When capital is deployed…*

   The wireframe has no text for them, so none was written. The placeholders have no fixed height, so longer
   approved copy will fit without layout changes. The earlier page text for Structured, Owned and Deployed was
   removed with the old section. It is not reused.
2. **Financial Engine terminology and supporting copy need aligning.**
   - The section's explanatory copy is a placeholder marked "Awaiting alignment with the approved model".
   - The stage names are unchanged: Need → Architecture → Institution → Capital → Activity → Reinvestment.
     Regeneration is not shown as a stage.
   - The engine's stage descriptions and worked example are the existing ones from the current page and the
     Financial Engine page. They should be checked against the approved model.
   - **"Impact considered" tags removed.** The current page tags Architecture, Institution and Reinvestment
     "Impact considered". The prototype leaves them out because they map impact to stages, and the brief asks for
     no such mapping until it is aligned. Confirm whether they return.
3. **Leadership approval of the measurement commitment.** Section 5 commits, in the supplied wording, to measuring and
   reporting **all three returns** (financial, economic, regenerative). It also states that BWCI "will not make impact
   claims we cannot evidence". Leadership should approve both commitments before publication.

## Other points for the reviewer

- **The hero is unchanged, as the brief asked.** Its text still says finance designed "around productive, measurable
  outcomes". Check that this sits well with Section 5's "will not make impact claims we cannot evidence".
- **Small labels added.** These are design labels, not new claims; any can be removed:
  - eyebrows "Regeneration" and "Three returns";
  - the existing eyebrows "Our approach" and "Financial Engine", kept;
  - "In development" on the measurement panel.
- **Removed from the current page:**
  - "Our approach" (Structured / Owned / Deployed) and "How this connects to the Financial Engine", replaced by
    Sections 2 and 3;
  - the "Impact & Outcomes methodology will be published here" card, replaced by Section 5;
  - the empty Evidence and Case studies slots, which were already hidden while empty and are no longer in the
    markup.
- **No figures, percentages, charts, dates, downloads, case studies or outcome claims were added.** Section 4 keeps
  the "designed to" wording.
- **The "How the Financial Engine works →" link** uses the configured Financial Engine destination,
  `bwci_url_financial_engine` + `#fe-hero`, the same as today. The prototype has no Custom Values filled in, so this
  link and the header/footer links show as "Not yet available".
- **No wireframe file was received in the conversation.** The content and section order come from the written brief.

## Before this can go live (not done)

The prototype is a review build, not a GoHighLevel block. Publishing it would mean:

1. updating `ghl/pages/better-world-impact/_build/src/`;
2. deciding what happens to the `showMethodology`, `evidence` and `cases` settings;
3. rebuilding the regular and global blocks;
4. running the page QA;
5. re-pasting the page in GHL.

All of that needs separate approval.
