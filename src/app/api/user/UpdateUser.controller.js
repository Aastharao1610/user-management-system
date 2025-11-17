import prisma from "@/config/db";
import sendMail from "@/utils/mailler";
import { NextResponse } from "next/server";
import { verifyToken } from "../verifyToken/verifyToken";
import { checkPermission } from "../permissions/CheckPermission";
import { logAction } from "../helper/logAction";

export async function PUT(request) {
  try {
    const { user, error } = await verifyToken(request);
    if (error) return NextResponse.json({ error }, { status: 401 });

    const permissionCheck = await checkPermission(request, "Users", "UPDATE");
    if (permissionCheck instanceof NextResponse) return permissionCheck;

    const { email, newEmail, name, roleId, roleName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required to identify the user" },
        { status: 400 }
      );
    }

    // Find existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData = {};
    if (name && name !== existingUser.name) updateData.name = name;
    if (newEmail && newEmail !== existingUser.email)
      updateData.email = newEmail;

    if (roleId) {
      updateData.role = { connect: { id: roleId } };
    } else if (roleName) {
      const foundRole = await prisma.role.findUnique({
        where: { name: roleName },
      });
      if (!foundRole)
        return NextResponse.json(
          { error: "Invalid role name" },
          { status: 400 }
        );
      updateData.role = { connect: { id: foundRole.id } };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No changes detected", user: existingUser },
        { status: 200 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: updateData,
      include: { role: true },
    });

    try {
      const shouldNotify =
        (newEmail && newEmail !== existingUser.email) ||
        name ||
        roleId ||
        roleName;

      if (shouldNotify) {
        await sendMail({
          to: updatedUser.email, // always send to current email
          subject: "Your account details have been updated",
          html: `
            <p>Hello ${updatedUser.name},</p>
            <p>Your account information has been updated by the Admin.</p>
            ${
              name
                ? `<p><strong>New Name:</strong> ${updatedUser.name}</p>`
                : ""
            }
            ${
              newEmail
                ? `<p><strong>New Email:</strong> ${updatedUser.email}</p>`
                : ""
            }
            ${
              updatedUser.role
                ? `<p><strong>Role:</strong> ${updatedUser.role.name}</p>`
                : ""
            }
            <br/>
            <p>If this wasn’t you, please contact support immediately.</p>
            <p>Regards,<br/>User Management System Team</p>
          `,
        });
      }
    } catch (mailErr) {
      console.error("Error sending email:", mailErr);
    }
    await logAction({
      actionType: "UPDATE",
      entityType: "User",
      entityId: updatedUser.id,
      performedById: user.id,
      performedByName: user.name || user.email,
      description: `${user.name || user.email} created a new user "${
        updatedUser.name
      }" with email "${updatedUser.email}" and role "${updatedUser.role.name}"`,
    });

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
