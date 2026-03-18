/**
 * ScanStateContext.jsx
 *
 * Global context that holds in-flight and completed scan state for every
 * scanner page (URL, File, IDS, RAG).
 *
 * WHY: React component state is destroyed when the component unmounts
 * (i.e. when the user navigates away). By moving both the API calls AND
 * their resulting state here, everything survives navigation.  The HTTP
 * request keeps running in the background, and when it finishes it writes
 * the result into context — so the page shows the result the moment the
 * user comes back.
 */

import React, { createContext, useContext, useState } from "react";
import { scanUrl } from "../api/urlscan.js";
import apiClient from "../api/config.js";

const ScanStateContext = createContext(null);

/* ── default shapes ─────────────────────────────────────────────────── */
const initialUrlState  = { url: "",   isLoading: false, result: null, error: null };
const initialFileState = { fileName: null, isLoading: false, result: null, error: null };
const initialIdsState  = { isLoading: false, result: null, error: "" };
const initialRagState  = { isLoading: false, result: null, error: null };

/* ── provider ────────────────────────────────────────────────────────── */
export const ScanStateProvider = ({ children }) => {
  const [urlState,  setUrlState]  = useState(initialUrlState);
  const [fileState, setFileState] = useState(initialFileState);
  const [idsState,  setIdsState]  = useState(initialIdsState);
  const [ragState,  setRagState]  = useState(initialRagState);

  /* ---- URL Scanner -------------------------------------------------- */
  const startUrlScan = async (url) => {
    setUrlState({ url, isLoading: true, result: null, error: null });
    try {
      const data = await scanUrl(url);
      setUrlState({ url, isLoading: false, result: data, error: null });
    } catch (err) {
      setUrlState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.detail || "Scanning failed.",
      }));
    }
  };

  const clearUrlState = () => setUrlState(initialUrlState);

  /* ---- File Scanner ------------------------------------------------- */
  const startFileScan = async (file) => {
    setFileState({ fileName: file.name, isLoading: true, result: null, error: null });
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiClient.post("/filescan/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFileState(prev => ({ ...prev, isLoading: false, result: res.data }));
    } catch (err) {
      setFileState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.detail || "File scan failed.",
      }));
    }
  };

  const clearFileState = () => setFileState(initialFileState);

  /* ---- IDS Analyzer ------------------------------------------------- */
  const startIdsScan = async (formData) => {
    setIdsState({ isLoading: true, result: null, error: "" });
    try {
      const res = await apiClient.post("/ids/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIdsState({ isLoading: false, result: res.data, error: "" });
    } catch (err) {
      setIdsState({
        isLoading: false,
        result: null,
        error: err.response?.data?.detail || "IDS Scan Failed",
      });
    }
  };

  const clearIdsState = () => setIdsState(initialIdsState);

  /* ---- RAG Explain -------------------------------------------------- */
  const startRagExplain = async (threatType, contextData) => {
    setRagState({ isLoading: true, result: null, error: null });
    try {
      const res = await apiClient.post("/rag/explain", {
        threat_type: threatType,
        context_data: contextData,
      });
      setRagState({ isLoading: false, result: res.data, error: null });
    } catch (err) {
      setRagState({
        isLoading: false,
        result: null,
        error:
          err.response?.data?.detail ||
          "AI Explanation Failed due to a server or network issue.",
      });
    }
  };

  const clearRagState = () => setRagState(initialRagState);

  return (
    <ScanStateContext.Provider
      value={{
        urlState,  startUrlScan,    clearUrlState,
        fileState, startFileScan,   clearFileState,
        idsState,  startIdsScan,    clearIdsState,
        ragState,  startRagExplain, clearRagState,
      }}
    >
      {children}
    </ScanStateContext.Provider>
  );
};

export const useScanState = () => useContext(ScanStateContext);
