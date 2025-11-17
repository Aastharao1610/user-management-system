import prisma from "@/config/db";
import sendMail from "@/utils/mailler";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    return NextResponse.json(
      { error: "User does not exist " },
      { status: 404 }
    );
  }
  const token = generateResetToken(user.id);
  await prisma.user.findupdate({
    where: {
      email,
    },
    data: {
      resetToken: token,
      resetTokenExpiry: Date.now() + 3600,
    },
  });
  await sendMail(email, token);
  return NextResponse.json({ message: "Restet Link sent to email " });
}
