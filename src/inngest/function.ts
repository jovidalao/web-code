import { generateText } from "ai";
import { inngest } from "./client";
import { opencode } from "ai-sdk-provider-opencode-sdk";

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ event, step }) => {
    await step.run("generate-text", async () => {
      const { text } = await generateText({
        model: opencode("opencode/glm-4.7-free"),
        prompt: "输出出师表全文",
      });
      return text;
    });
  }
);
