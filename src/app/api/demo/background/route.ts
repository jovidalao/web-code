import { inngest } from "@/inngest/client";

export async function POST() {
  await inngest.send({
    name: "demo/generate",
    data: {
      prompt: "输出出师表全文",
    },
  });
  return Response.json({ status: "started" });
}
