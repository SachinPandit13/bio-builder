# BioCraft

A responsive HTML, CSS and vanilla JavaScript studio for marriage biodata and professional resumes. Each studio has a live preview, several layouts, and PDF or print export.

## Run locally

1. Extract the ZIP.
2. Open `index.html` in a modern browser, or use VS Code Live Server.
3. Use the **Biodata** and **Resume** tabs to switch studios. Edit the sample fields and choose a design or format.
4. Use **Download PDF** for direct export or **Print / Save PDF** to open the browser print dialog.

## Studios

- Biodata — seven marriage biodata templates, with an optional profile photo
- Resume — four professional formats: Classic, Modern, Compact, and Executive

## Files

- `index.html` — studio tabs, forms, layout pickers, and previews
- `styles.css` — responsive UI, biodata themes, resume formats, A4 print rules
- `app.js` — live data binding, photo upload, layout switching, PDF and print actions

## Notes

- Direct PDF download uses `html2pdf.js` from a CDN, so an internet connection is needed for that option.
- Print / Save PDF uses the browser's built-in print feature and does not require the PDF library.
- All data is handled locally in the page. Switching tabs keeps both forms. This project does not send details to a server or save them permanently.
- Replace the sample content with your own information before exporting.
- Browser PDF rendering can vary slightly. For the cleanest output, choose A4 portrait and enable background graphics in the print dialog if offered.
