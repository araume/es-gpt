import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

const openai = new OpenAI({
  baseURL: "https://api.zukijourney.com/v1",
  apiKey: process.env.LLM_API,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  // Find or create a conversation for this user (for simplicity, one active conversation)
  let conversation = await prisma.conversation.findFirst({
    where: { user: { email: session.user.email } },
    orderBy: { createdAt: "desc" },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        user: { connect: { email: session.user.email } },
        messages: {
          create: [{ sender: "user", content: message }],
        },
      },
    });
  } else {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: "user",
        content: message,
      },
    });
  }

  // Use the OpenAI SDK to get a reply
  let aiReply = "Sorry, the AI service is unavailable.";
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1:online", // or your preferred model
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
    });
    aiReply = response.choices?.[0]?.message?.content?.trim() || aiReply;
  } catch (err) {
    // Optionally log error
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      sender: "ai",
      content: aiReply,
    },
  });

  return NextResponse.json({ reply: aiReply });
} 