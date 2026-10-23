# BEU Exam Prep

BEU Exam Prep is an installable, mobile-first study PWA for students preparing for the BEU B.Tech CSE Semester 4 papers. V2 uses a student-first application structure and a professional green, white and coral UI with a floating pill navigation on mobile and a sidebar on desktop.

## Student features
- First-run setup for 4, 6, 8 or 12 study hours/day and Balanced, Marks-focused or Crash-course strategies.
- Dashboard, daily study plan, six theory-subject views, unit syllabus checklist and topic learning pages.
- Exam calendar for the schedule supplied by the user (29 Oct–7 Nov 2026, 2–5 PM); dates should be checked against later official notices.
- Filterable question bank, short-definition practice, MCQs with explanations, long-answer outlines, timed quiz sets, answer review and saved questions.
- Revision queue, active recall cards, personal notes and mistake log, session time log, subject progress and quiz accuracy analytics.
- Private in-browser PDF shelf with file listing, preview, download and delete.
- JSON backup export/import for study data. Original PDFs are stored separately in IndexedDB and should be backed up separately.
- Responsive layouts, keyboard focus states, reduced-motion preference, PWA manifest, app icons and an offline app shell.

## Academic content and provenance
The syllabus hierarchy is based on the syllabus compilation provided by the user; it is not represented as a university-hosted source. Topics carry study-guidance priority labels, not official marks weightage. The included MCQs, short definitions and long-answer structures form a curated practice seed. They are **not** a complete verbatim transcription of the all-subject PYQ PDF. That compilation includes papers with potentially different semester/course codes; questions should only be labelled as verified PYQs after checking the original paper, course code, year and page.

## Run locally
Serve the repository over HTTP (service workers do not work from a file URL):
```sh
python -m http.server 8080
```
Open http://localhost:8080. Test PWA install and offline behaviour on localhost or HTTPS.

## Local data and privacy
Small preferences, topic progress, study blocks, notes, mistakes, bookmarks, quiz results and study sessions are saved with localStorage under the stable key `beu-cse-sem4-tracker-local-v1`. PDF blobs are stored in IndexedDB. No account, backend, cloud sync or server upload is configured. Clearing this site's browser data may erase local records. Export the JSON backup regularly and keep original PDFs elsewhere.

## Scope decisions for V2
Student-facing experience only. No admin UI, account roles, shared-content editing or authentication is included. Offline support covers the cached application shell; PDFs are available offline only after they have been stored in the current browser and device. Hindi explanations and server-backed multi-semester content are future work.

## Deploy
The repository is connected to the Vercel project for this app. Changes merged to `main` are intended for production; verify deployment status and smoke-test the live URL after release.
