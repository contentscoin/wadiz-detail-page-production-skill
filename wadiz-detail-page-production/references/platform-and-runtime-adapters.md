# Platform And Runtime Adapters

Use this reference when the same `wadiz-detail-page-production` skill pack is shared across Hermes, Codex/OpenAI, Cursor/Claude, or plain local CLI environments.

The repository is a shared skill pack. Keep the core production rules portable; treat platform integrations as adapters.

## Shared Core

The shared core is always valid regardless of runtime:

- produce cut-based marketplace/detail-page assets rather than substituting a homepage or generic landing page;
- separate verified product/service facts from Wadiz-style persuasion patterns;
- keep internal QA labels, pack state, cut numbers, and source notes out of customer-facing images;
- distinguish `concept`, `publication_review_required`, and `publication_ready`;
- run practical QA for Korean copy, mobile readability, image fit, logo/asset truth, and risky claims;
- use OpenCrab/Wadiz packs only when the active environment can actually query or verify them.

## Codex / OpenAI Adapter

The Codex adapter is declared in `agents/openai.yaml`. When this skill is loaded by Codex/OpenAI:

1. Do not assume a Hermes profile, Hermes memory, Telegram gateway, private OpenCrab owner project, local MCP URL, or local filesystem path exists.
2. Treat OpenCrab as optional and externally configured. If unavailable, mark pack evidence as not live-verified and continue only with planning skeletons or user-approved concept work.
3. Use `$imagegen` or the environment's image tool only when the user explicitly requests visual generation and facts/assets are sufficient for the allowed mode.
4. Keep delivery instructions generic: provide file paths, ZIPs, or repo artifacts supported by the current environment. Do not emit Hermes/Telegram `MEDIA:` tags unless the runtime explicitly intercepts them.
5. If FableCodex or another gate plugin is installed, use it as a soft dependency only; the skill must remain usable without it.

## Hermes Adapter

When running inside Hermes and the required profile tools are available:

1. Load this skill through the active Hermes profile's skill tree.
2. Use Hermes tools for source inspection, browser QA, image analysis, terminal builds, file packaging, and profile-local OpenCrab MCP queries when configured.
3. Use profile/company/private OpenCrab projects only when the active profile policy permits it. Never require private owner IDs for public users.
4. For Telegram or gateway delivery, use platform-native attachment conventions only in messaging contexts; in CLI contexts, report plain file paths.
5. Keep Hermes-specific memory, session, gateway, and profile assumptions out of the shared `SKILL.md` unless guarded by "when running inside Hermes" language.

## Cursor / Claude / Other Agents

When the pack is used by other agents:

- map the shared gates to that agent's available tools;
- if a required tool is missing, downgrade output mode instead of pretending the gate passed;
- do not copy runtime-specific commands from Hermes or Codex unless the environment supports them;
- preserve the same completion standard: inspectable artifact, fact separation, claim risk handling, and attempted visual/runtime QA.

## Public Repository Rule

Before pushing updates to a shared public repo:

- keep root README/package files portable;
- put runtime-specific notes in this adapter reference or another clearly named adapter file;
- avoid private profile names, local paths, tokens, private URLs, and company-specific facts unless presented as anonymized reusable patterns;
- make `agents/openai.yaml` conservative so Codex does not inherit Hermes-only assumptions.
