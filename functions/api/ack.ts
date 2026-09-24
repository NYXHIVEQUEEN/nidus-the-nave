// Cloudflare Pages: POST /api/ack. Off until PLAY_SA_EMAIL and PLAY_SA_KEY are set as encrypted variables.
import { handleAck, type AckEnv } from "../../src/server/playAck";

export const onRequest = (ctx: { request: Request; env: AckEnv }): Promise<Response> => handleAck(ctx.request, ctx.env);
