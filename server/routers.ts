import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

import { z } from "zod";
import * as crypto from "crypto";
import { credentials } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "./db";

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    session: publicProcedure.query(async ({ ctx }) => {
      // Check if user has a session cookie
      const sessionId = ctx.req.cookies?.['brunetto_session'];
      if (!sessionId) return null;
      
      const db = await getDb();
      if (!db) return null;
      
      const result = await db.select().from(credentials).where(eq(credentials.id, sessionId)).limit(1);
      if (result.length === 0) return null;
      
      const cred = result[0];
      return {
        id: cred.id,
        name: cred.name || cred.username,
        username: cred.username,
        email: cred.email,
        role: cred.role,
        organizationId: cred.organizationId,
      };
    }),
    
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.select().from(credentials).where(eq(credentials.username, input.username)).limit(1);
        if (result.length === 0) {
          throw new Error("Usuário ou senha inválidos");
        }
        
        const cred = result[0];
        const inputHash = hashPassword(input.password);
        
        if (inputHash !== cred.passwordHash) {
          throw new Error("Usuário ou senha inválidos");
        }
        
        // Set session cookie
        ctx.res.cookie('brunetto_session', cred.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        // Update last signed in
        await db.update(credentials)
          .set({ lastSignedIn: new Date() })
          .where(eq(credentials.id, cred.id));
        
        return {
          success: true,
          user: {
            id: cred.id,
            name: cred.name || cred.username,
            username: cred.username,
            role: cred.role,
          },
        };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie('brunetto_session');
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
