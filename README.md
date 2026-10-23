# BEU CSE Semester 4 Exam Tracker

A free, mobile-first Progressive Web App (PWA) to help Bihar Engineering University B.Tech Computer Science students plan study sessions, track syllabus topics, practise questions and check recall ahead of semester exams.

## Features
- First-run planner: choose 4, 6, 8 or 12 study hours/day and Balanced, Marks-focused or Crash-course preparation.
- Unit-wise checklist for COA (105401), FLAT (105402), DAA (105403), DBMS (105404), ETC (105405) and Computer Networks (105406).
- Topic states: Not started, Learning, Practiced, Recall passed, Exam-ready and Needs revision; visible subject and overall progress.
- Exam schedule transcribed from the supplied routine (29 Oct–7 Nov 2026, 2–5 PM; verify later university/college notices).
- MCQs with explanations, short definition questions, long-answer outlines, quiz mode, notes and mistake log.
- ChatGPT study links, charcoal theme, mobile navigation, installable PWA and offline app shell.
- Local-first progress with JSON backup export/import; no login or backend dependency.
- SEO metadata, social preview tags, schema.org JSON-LD, robots.txt and sitemap.xml.

## Run locally
Serve the repository root over HTTP (service workers do not run from file URLs). Run `python -m http.server 8080` and open http://localhost:8080. Test installation/offline support on localhost or HTTPS.

## Privacy and persistence
Preferences, topic progress, daily checklist state, notes, mistakes and quiz results are saved in browser localStorage using the stable key `beu-cse-sem4-tracker-local-v1`. Normal app deployments do not clear this key. Data is specific to the current browser/profile/device; it does not sync between devices. Clearing site data or switching browsers/devices can remove it. Export a JSON backup from Settings before clearing or moving devices.

## Content integrity
The topic map is condensed from the supplied B.Tech CSE Semester 4 syllabus PDF. Dates and codes are transcribed from the supplied exam routine; verify later university/college notices. Priority levels are mentor guidance, not official BEU marks weightage or a promise about exam questions. Practice-question wording is not represented as verbatim past-paper text unless explicitly identified as such. Refer to faculty and official materials for final preparation.

## Deployment
This is a static site; deploy the repository root. Netlify configuration is included in `netlify.toml`. For continuous deployment, connect this GitHub repository in the hosting provider and use the root directory as the publish directory.

## License
Add a license if you intend to grant specific reuse or contribution rights. Public visibility alone does not automatically grant a software license.
