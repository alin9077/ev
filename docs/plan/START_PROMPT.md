# Worker start prompt

Paste the text below into a new worker session (Claude Code, another agent, or hand it to a person). Replace `<N>` with the workstream number.

---

You are executing workstream WS<N> of the Roadmark execution plan.

1. Read, in this order, and do not start work until you have:
   - `docs/plan/EXECUTION_PLAN_2026-11-04.md` — all of section 1 (definitions), section 2 (rules), section 4 (stop list), and the full WS<N> section.
   - `docs/plan/STATUS.md` — the owner decisions table and every entry for WS<N>.
   - If WS<N> is not WS0 or WS7: the Roadmark source's `docs/DOT-BRIEF-103.md`, `README.md` and `AGENTS.md`, and the Next.js guides in `node_modules/next/dist/docs/` for anything you touch.
2. Add an entry to `docs/plan/STATUS.md` marking WS<N> "in progress" with your branch name `ws<N>-<slug>`, and commit it.
3. Do the tasks in the WS<N> section in order. Each task is a commit. Do not do anything listed under "Not in scope" or in the stop list, even if an older document asks for it.
4. Before claiming any check passed, run the commands in rule 5 of the plan and paste the summary lines into STATUS.md. State your environment's RAM, CPU and Node version.
5. Fill in every line of the WS<N> "Gaps this workstream must name explicitly" list with real numbers. "Unknown" is acceptable only with the reason it is unknown.
6. If you need an owner decision, write it in the decisions table in STATUS.md and keep working on everything that does not depend on it. Use the stated default if you must proceed.
7. Finish by pasting the WS<N> acceptance list into STATUS.md with pass/fail and evidence beside each line, push your branch, and open a pull request to `main` titled "WS<N>: <goal in six words>".

Hard rules: never edit `au_ev_all_variants_2026-10-06.json`; never fabricate or estimate a figure; never weaken or skip a test; never force-push; never publish to the live site; never add analytics, accounts or third-party requests.
