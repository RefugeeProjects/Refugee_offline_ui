import React, { useEffect, useState, useContext } from "react";
import { appContext } from "../context/appContext";

const SystemWatermark = () => {
//   const user = appInfo?.user;
    const { user } = useContext(appContext);

console.log("WM USER:", user);

  const [serverTime, setServerTime] = useState("");

  useEffect(() => {
    // وقت السيرفر (مؤقتاً local – تربطه لاحقاً بالـ backend)
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    setServerTime(now);
  }, []);
  if (!user) return null;
  

const text = `${user.username} | ${new Date().toLocaleString()}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0.08,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gridAutoRows: "200px",
        transform: "rotate(-20deg)",
      }}
    >
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
      ))}
    </div>
  );
};

export default SystemWatermark;
