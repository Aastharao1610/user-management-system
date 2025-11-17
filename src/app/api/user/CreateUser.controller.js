import prisma from "@/config/db";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import sendMail from "@/utils/mailler";
import { verifyToken } from "../verifyToken/verifyToken";
import { checkPermission } from "../permissions/CheckPermission";
import { logAction } from "../helper/logAction";

export async function POST(request) {
  try {
    const { success, user, error } = await verifyToken(request);
    if (!success) return NextResponse.json({ error }, { status: 401 });

    const permissionCheck = await checkPermission(request, "Users", "CREATE");
    if (permissionCheck instanceof NextResponse) return permissionCheck;

    const { name, email, roleId, permissionIds = [] } = await request.json();
    if (!name || !email || !roleId)
      return NextResponse.json(
        { error: "Name, email, and roleId are required" },
        { status: 400 }
      );

    // 🔹 Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );

    const randomPassword = uuidv4().slice(0, 8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isFirstLogin: true,
        role: { connect: { id: parseInt(roleId) } },
      },
      include: { role: true },
    });

    if (permissionIds.length > 0) {
      await prisma.userPermission.createMany({
        data: permissionIds.map((pid) => ({
          userId: newUser.id,
          permissionId: pid,
        })),
        skipDuplicates: true,
      });
    }

    try {
      await sendMail(
        email,
        "Your Account Credentials",
        `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #4F46E5; text-align: center;">Welcome to Our Platform</h2>
            <p style="font-size: 15px;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 15px;">Your account has been successfully created by the admin. Below are your login credentials:</p>
            <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Password:</strong> ${randomPassword}</p>
            </div>
            <p style="font-size: 15px;">Please login and reset your password immediately for security reasons.</p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}/login"
                 style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                 Login to Your Account
              </a>
            </div>
            <p style="font-size: 13px; color: #666; margin-top: 30px; text-align: center;">
              If you did not request this account, please ignore this email.
            </p>
          </div>
        </div>
        `
      );
      console.log("Email sent successfully to", email);
    } catch (mailError) {
      console.error("Failed to send email:", mailError);
    }
    await logAction({
      actionType: "CREATE",
      entityType: "User",
      entityId: newUser.id,
      performedById: user.id,
      performedByName: user.name || user.email,
      description: `${user.name || user.email} created a new user "${
        newUser.name
      }" with email "${newUser.email}" and role "${newUser.role.name}"`,
    });

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
