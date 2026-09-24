// Vercel: POST /api/ack. Off until PLAY_SA_EMAIL and PLAY_SA_KEY are set in Project → Settings → Environment Variables.
import { handleAck } from "../src/server/playAck";

export const config = { runtime: "edge" };

export default function handler(req: Request): Promise<Response> {
  return handleAck(req, {
    PLAY_PACKAGE: process.env.PLAY_PACKAGE,
    PLAY_SA_EMAIL: process.env.PLAY_SA_EMAIL,
    PLAY_SA_KEY: process.env.PLAY_SA_KEY,
  });
}
