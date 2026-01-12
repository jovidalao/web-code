import { opencode } from "ai-sdk-provider-opencode-sdk";
import { generateText } from "ai";

export async function POST() {
  const { text } = await generateText({
    model: opencode("opencode/glm-4.7-free"),
    prompt: "输出出师表全文",
  });
  return Response.json({ text });
}
