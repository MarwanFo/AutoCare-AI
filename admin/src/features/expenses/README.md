# Expenses Feature Module
Logs receipts, processes OCR scans of invoices, and classifies vehicle-related transactions (fuel, insurance, repair).

## Directory Roles
- **components/**: ExpenseList.jsx, InvoiceScanPreview.jsx, and ExpenseForm.jsx.
- **hooks/**: Logic for scanning processes, receipt uploads, and financial aggregates (e.g., useExpenses, useScanInvoice).
- **services/**: Calls to the financial endpoint /api/v1/expenses/* and OCR endpoint /api/v1/ocr/*.
- **schemas/**: Strict validation for currency inputs, tax values, and invoice metadata.
- **stores/**: Filter states for financial year and vehicle filters.
