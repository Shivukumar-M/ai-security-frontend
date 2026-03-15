import { useEffect, useRef } from "react";
import { getLiveIDSAlerts } from "../api/ids_realtime";

/*
  FINAL IDS GLOBAL WATCHER (STABLE)
  - No alerts while on /ids/live
  - Persists "seen" alerts via localStorage (No repeat alerts on refresh)
  - Redirects only from other pages
*/

const IDSGlobalWatcher = () => {
  const started = useRef(false);
  const lastAlertTime = useRef(0);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const interval = setInterval(async () => {
      // 1. EXIT if we are already on the Live IDS page
      // This stops alerts and redirects while you are looking at the dashboard
      if (window.location.pathname === "/ids/live") {
        return; 
      }

      try {
        const res = await getLiveIDSAlerts();
        const alerts = res?.alerts || [];
        const now = Date.now();

        // Prevent alert spam (5-second gap)
        if (now - lastAlertTime.current < 5000) return;

        // Load seen IDs from localStorage to handle page refreshes
        const storedSeen = JSON.parse(localStorage.getItem("seenIDS") || "[]");
        const seenSet = new Set(storedSeen);

        for (const alertObj of alerts) {
          const alertId = alertObj.timestamp; // Unique identifier

          // Skip if already seen in this session or previous sessions
          if (seenSet.has(alertId)) continue;

          // Mark as seen and save to localStorage
          seenSet.add(alertId);
          localStorage.setItem("seenIDS", JSON.stringify(Array.from(seenSet)));
          lastAlertTime.current = now;

          // Determine message
          let message = "🚨 New Intrusion Detected!";
          
          // Check if DDoS was already shown in localStorage
          const ddosAlreadyShown = localStorage.getItem("ddos_alert_fired") === "true";

          if (alertObj.attack_types?.includes("DDoS") && !ddosAlreadyShown) {
            message = "🚨 DDoS Attack Detected!\nSystem is under heavy traffic.";
            localStorage.setItem("ddos_alert_fired", "true");
          }

          // Trigger Alert & Redirect
          setTimeout(() => {
            alert(message);
            window.location.href = "/ids/live";
          }, 200);

          break; // Show only one alert per fetch cycle
        }
      } catch (err) {
        // silent catch
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      started.current = false;
    };
  }, []);

  return null;
};

export default IDSGlobalWatcher;