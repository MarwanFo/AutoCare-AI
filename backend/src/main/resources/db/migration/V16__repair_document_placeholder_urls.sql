-- V16: Repair fake placeholder document URLs with real working PDF samples
-- Updates any document that has the old 'autocare.ai/templates' placeholder URL.
-- Uses CASE-based title matching to assign an appropriate real sample PDF.

UPDATE user_documents
SET url = CASE
    WHEN lower(title) LIKE '%owner%' OR lower(title) LIKE '%manual%'
        THEN 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf'
    WHEN lower(title) LIKE '%warranty%'
        THEN 'https://www.orimi.com/pdf-test.pdf'
    WHEN lower(title) LIKE '%emergency%' OR lower(title) LIKE '%roadside%'
        THEN 'https://www.unm.edu/~tbeach/terms/PDFsample.pdf'
    ELSE
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
END
WHERE url LIKE 'https://autocare.ai/templates/%';
