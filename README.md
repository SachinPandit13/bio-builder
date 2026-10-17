# Vivah — Marriage Biodata Builder

A responsive HTML, CSS and vanilla JavaScript marriage biodata builder with live preview, seven templates, profile photo upload, direct PDF download and browser print-to-PDF.

## Run locally

1. Extract the ZIP.
2. Open `index.html` in a modern browser, or use VS Code Live Server.
3. Edit the sample fields, upload a photo and choose a design.
4. Use **Download PDF** for direct export or **Print / Save PDF** to open the browser print dialog.

## Files

- `index.html` — form, template picker, and biodata preview
- `styles.css` — responsive UI, seven template themes, A4 print rules
- `app.js` — live data binding, photo upload, template switching, PDF and print actions

## Notes

- Direct PDF download uses `html2pdf.js` from a CDN, so an internet connection is needed for that option.
- Print / Save PDF uses the browser's built-in print feature and does not require the PDF library.
- All data is handled locally in the page. This starter project does not send biodata to a server or save it permanently.
- Replace the sample biodata with your own information before exporting.
- Browser PDF rendering can vary slightly. For the cleanest output, choose A4 portrait and enable background graphics in the print dialog if offered.
