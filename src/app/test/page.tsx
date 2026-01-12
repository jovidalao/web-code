"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

function Page() {
  const [isLoading, setIsLoading] = useState(false);

  const handleBlocking2 = async () => {
    setIsLoading(true);
    await fetch("/api/demo/blocking2", {
      method: "POST",
    });
    setIsLoading(false);
  };

  const handleBackground = async () => {
    setIsLoading(true);
    await fetch("/api/demo/background", {
      method: "POST",
    });
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <Button onClick={handleBlocking2} disabled={isLoading}>
        {isLoading ? "Loading..." : "Blocking2"}
      </Button>
      <Button onClick={handleBackground} disabled={isLoading}>
        {isLoading ? "Loading..." : "Background"}
      </Button>
    </div>
  );
}

export default Page;
