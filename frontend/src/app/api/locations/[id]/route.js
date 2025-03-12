import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    const deletedLocation = await prisma.location.delete({
      where: { id }
    });
    return new Response(JSON.stringify(deletedLocation), { status: 200 });
  } catch (error) {
    console.error("Error deleting location:", error);
    return new Response(JSON.stringify({ message: "Error deleting location" }), { status: 500 });
  }
}
