export async function POST(req) {
  const { token, newpassword } = await req.json();

  const user = await prisma.user.findfirst({
    where: {
      reset,
    },
  });
}
