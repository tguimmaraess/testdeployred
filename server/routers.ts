import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { PDFParse } from "pdf-parse";

// Initialize Stripe (will be null if no API key)
const stripe = ENV.stripeSecretKey
  ? new Stripe(ENV.stripeSecretKey)
  : null;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Contract analysis router
  contract: router({
    // Extract text from PDF
    extractPdf: publicProcedure
      .input(
        z.object({
          pdfBase64: z.string().min(1, "PDF data is required"),
        })
      )
      .mutation(async ({ input }) => {
        const { pdfBase64 } = input;

        try {
          // Convert base64 to buffer
          const pdfBuffer = Buffer.from(pdfBase64, "base64");
          
          // Extract text from PDF
          const pdfParser = new PDFParse({ data: pdfBuffer });
          const textResult = await pdfParser.getText();
          const data = { text: textResult.text };
          
          if (!data.text || data.text.trim().length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Could not extract text from PDF. The file may be scanned or image-based.",
            });
          }

          return { text: data.text };
        } catch (error) {
          console.error("Error extracting PDF:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to extract text from PDF. Please try again or paste the text directly.",
          });
        }
      }),

    analyze: publicProcedure
      .input(
        z.object({
          contractText: z.string().min(1, "Contract text is required"),
        })
      )
      .mutation(async ({ input }) => {
        const { contractText } = input;

        const prompt = `You are a contract risk assistant for non-lawyers.

Analyze the contract text below and:
1. Identify potential red flags or risky clauses.
2. Explain each risk in simple, non-legal language.
3. Use bullet points.
4. Be concise.
5. Do NOT provide legal advice.
6. If the contract seems safe, say so clearly.

Contract:
${contractText}`;

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful contract analysis assistant that identifies potential risks in contracts for non-lawyers. Always use bullet points and plain language.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          const content = response.choices[0]?.message?.content;
          let analysis: string;
          
          if (typeof content === "string") {
            analysis = content;
          } else if (Array.isArray(content)) {
            // Extract text from content array
            analysis = content
              .filter((item): item is { type: "text"; text: string } => item.type === "text")
              .map((item) => item.text)
              .join("\n") || "Unable to analyze the contract. Please try again.";
          } else {
            analysis = "Unable to analyze the contract. Please try again.";
          }

          return { analysis };
        } catch (error) {
          console.error("Error analyzing contract:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to analyze contract. Please try again.",
          });
        }
      }),
  }),

  // Payment router
  payment: router({
    createCheckout: publicProcedure.mutation(async ({ ctx }) => {
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment system is not configured.",
        });
      }

      try {
        // Get the origin from the request
        const origin =
          ctx.req.headers.origin ||
          `${ctx.req.protocol}://${ctx.req.headers.host}`;

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "ContractRedFlag – Contract Analysis",
                  description:
                    "Unlock the full contract analysis with all identified red flags and risks.",
                },
                unit_amount: 900, // $9.00 in cents
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${origin}/?success=true`,
          cancel_url: `${origin}/`,
        });

        return { url: session.url };
      } catch (error) {
        console.error("Error creating checkout session:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session. Please try again.",
        });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
