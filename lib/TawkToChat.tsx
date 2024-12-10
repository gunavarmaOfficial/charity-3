"use client";

import { useEffect } from "react";

const TawkToChat = () => {
  useEffect(() => {
    const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
    const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

    if (!propertyId || !widgetId) {
      console.error("Tawk.to environment variables are missing.");
      return;
    }

    // Tawk.to widget script
    const tawkScript = document.createElement("script");
    tawkScript.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    tawkScript.async = true;
    tawkScript.charset = "UTF-8";
    tawkScript.setAttribute("crossorigin", "*");
    document.body.appendChild(tawkScript);

    // Cleanup script on component unmount
    return () => {
      document.body.removeChild(tawkScript);
    };
  }, []);

  return null; // No UI for this component
};

export default TawkToChat;
