// AiInterview.tsx
import { useEffect, useState } from "react";
import { useVapi } from "../hooks/useVapi";
import { getVapiConfig } from "../api/vapiService";

export default function AiInterview() {
  const [interviewConfig, setInterviewConfig] = useState(null);
  const [vapiKey, setVapiKey] = useState<string | null>(null);
  const { vapiClient, start, stop } = useVapi(vapiKey);

  const handleStartInterview = async () => {
    try {
      // 1. Ask backend for config
      const cfg = await getVapiConfig(interviewConfig);

      // 2. Save publicKey → this triggers useVapi to create the client
      setVapiKey(cfg.publicKey);

      // 3. Wait until client is created
      const waitForClient = () =>
        new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (vapiClient) {
              clearInterval(interval);
              resolve();
            }
          }, 50);
        });

      await waitForClient();

      // 4. Start the actual voice session
      await start(cfg.assistantId, cfg.overrides);

      console.log("Interview started!");
    } catch (err) {
      console.error("Failed to start interview:", err);
    }
  };

  return (
    <div>
      <button onClick={handleStartInterview}>Start Interview</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
