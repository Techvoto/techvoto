# Source provenance

- Frontend source is the supplied full frontend archive, with the reviewed authentication/session changes and the separate payment lifecycle patch integrated into one working source tree.
- Backend source is reconstructed from the latest user-attached `bundle.txt` export dated 2026-11-02. It supersedes the earlier backend export used for the prior handoff.
- The newer backend migrations are preserved, including `assessments/0004_quizattempt_ordinal_and_more.py` and `payments/0003_alter_payment_refund_status_alter_payment_status_and_more.py`.
- The backend export's `note.txt` says an assessment deadline patch is yet to be added. That note is stale: `QuizSubmitView` contains the attempt deadline/grace guard and `AssignmentViewSet.submit` checks `due_at`/`allow_late`. The quiz deadline regression test exists. No separate assignment deadline regression test was found in the supplied assessment tests.
- The export's `.env`, SQLite database, Jitsi private-key file, nested bundle and generated pytest/Python caches are not included.
- No Git history or remote was available in the source handoff, and no production deployment was performed.
