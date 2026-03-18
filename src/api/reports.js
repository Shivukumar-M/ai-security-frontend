// frontend/src/api/reports.js
import apiClient from "./config.js";

// -----------------------------------------------------------
// Helper: Trigger "Save As" dialog in browser
// -----------------------------------------------------------
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename; // forces browser save dialog

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  window.URL.revokeObjectURL(url);
};

// -----------------------------------------------------------
// Executive Summary PDF
// -----------------------------------------------------------
export const downloadPDFReport = async () => {
  const response = await apiClient.get(`/reports/generate/pdf`, {
    responseType: "blob",
  });

  const filename = `executive_security_report_${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;

  downloadBlob(response.data, filename);
};

// -----------------------------------------------------------
// Single Scan PDF (URL / File / IDS)
// -----------------------------------------------------------
export const downloadScanPDF = async (scanType, scanId) => {
  const response = await apiClient.get(`/reports/generate/pdf/scan`, {
    params: { scan_type: scanType, scan_id: scanId },
    responseType: "blob",
  });

  // clean filename
  const date = new Date().toISOString().slice(0, 10);
  const filename = `${scanType}_scan_report_${scanId}_${date}.pdf`;

  downloadBlob(response.data, filename);
};

// -----------------------------------------------------------
// Autocomplete lookup for scans
// -----------------------------------------------------------
export const lookupScans = async (q, kind) => {
  const res = await apiClient.get("/reports/lookup", {
    params: { q, kind },
  });

  return res.data;
};
