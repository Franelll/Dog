"use client";

import { useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

export default function MapaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Loguje prawdziwy błąd do konsoli przeglądarki
    // (ułatwia debugowanie gdy Next pokazuje tylko "Something went wrong")
    console.error("Mapa error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card className="border border-danger-200 bg-danger-50/50 dark:bg-danger-950/20">
        <CardBody className="p-6 flex flex-col gap-4">
          <div>
            <p className="font-semibold text-lg">Coś poszło nie tak z mapą</p>
            <p className="text-sm text-default-600">Poniżej jest konkretny błąd (pomaga naprawić problem).</p>
          </div>

          <pre className="text-xs bg-background/60 rounded-lg p-3 overflow-auto border border-default-200">
{error?.message}
{error?.digest ? `\n\nDigest: ${error.digest}` : ""}
          </pre>

          <div className="flex gap-2">
            <Button color="primary" onPress={reset}>
              Spróbuj ponownie
            </Button>
            <Button variant="flat" onPress={() => window.location.reload()}>
              Odśwież stronę
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
