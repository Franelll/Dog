"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://psiarze-backend.onrender.com/api";

export default function TestConnectionPage() {
  const [status, setStatus] = useState<string>("Sprawdzanie połączenia...");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const [manualUrl, setManualUrl] = useState<string>(DEFAULT_API_URL);

  useEffect(() => {
    checkConnection(DEFAULT_API_URL);
  }, []);

  const checkConnection = async (urlOverride?: string) => {
    setStatus("Sprawdzanie połączenia...");
    setError(null);
    setData(null);

    try {
      // Bierzemy URL z inputa lub domyślnego (wartość env jest wstrzykiwana przy buildzie)
      const apiUrl = urlOverride || DEFAULT_API_URL;
      // Usuwamy /api z końca, jeśli jest, żeby dostać się do /health
      const baseUrl = apiUrl.replace(/\/api\/?$/, ""); 
      
      console.log("Testing connection to:", `${baseUrl}/health`);

      const response = await fetch(`${baseUrl}/health`);
      
      if (!response.ok) {
          throw new Error(`Błąd HTTP: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setStatus("Połączono z backendem!");
      setData(result);
    } catch (err: any) {
      console.error(err);
      setStatus("Błąd połączenia");
      setError(err.message || "Nieznany błąd");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Połączenia z Backendem</h1>
      
      <div className="mb-6 p-4 bg-gray-50 rounded border">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adres API (możesz edytować):
        </label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="https://..."
          />
          <button 
            onClick={() => checkConnection(manualUrl)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sprawdź
          </button>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <p className={`text-lg font-semibold ${error ? 'text-red-700' : 'text-green-700'}`}>
          Status: {status}
        </p>
        
        {error && (
          <div className="mt-2 text-red-600">
            <p>Szczegóły błędu: {error}</p>
            <div className="text-sm mt-2 text-gray-600">
              Upewnij się, że:
              <ul className="list-disc ml-5 mt-1">
                <li>Backend na Renderze jest "Live"</li>
                <li>Adres w .env.local jest poprawny (musi być https)</li>
                <li>Zrestartowałeś serwer frontendowy (npm run dev) po zmianie .env.local</li>
              </ul>
            </div>
          </div>
        )}

        {data && (
          <div className="mt-4">
            <p className="font-semibold text-green-800">Odpowiedź z serwera:</p>
            <pre className="bg-white p-2 rounded mt-2 text-sm overflow-auto border border-green-100">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Konfiguracja:</h2>
        <p className="text-gray-600">
          API URL: <code className="bg-gray-100 px-2 py-1 rounded">{manualUrl}</code>
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Raw Env: {process.env.NEXT_PUBLIC_API_URL ? `"${process.env.NEXT_PUBLIC_API_URL}"` : "(undefined/empty)"}
        </p>
      </div>
    </div>
  );
}
