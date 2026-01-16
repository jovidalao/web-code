import { generateText } from "ai";
import { inngest } from "./client";
import { opencode } from "ai-sdk-provider-opencode-sdk";

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ step }) => {
    await step.run("generate-text", async () => {
      const { text } = await generateText({
        model: opencode("opencode/glm-4.7-free"),
        prompt: "Hello, tell me a short joke.",
      });
      return text;
    });
  }
);

export const demoError = inngest.createFunction(
  { id: "demo-error" },
  { event: "demo/error" },
  async ({ step }) => {
    await step.run("fail", async () => {
      throw new Error("Inngest error: Background job failed!");
    });
  }
);
