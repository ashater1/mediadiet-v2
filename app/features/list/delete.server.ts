import { z } from "zod";
import { db } from "~/db.server";

export const deleteSchema = z.object({
  id: z.string(),
  userId: z.string(),
});

export async function deleteEntry({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  try {
    const { mediaItem } = await db.review.delete({
      where: { id: id, userId: userId },
      select: {
        mediaItem: {
          select: {
            mediaType: true,
            title: true,
            TvSeries: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    const title =
      mediaItem.mediaType === "TV"
        ? `${mediaItem.TvSeries?.title}${
            mediaItem.title ? ` - ${mediaItem.title}` : ""
          }`
        : mediaItem.title;

    return { success: true, title };
  } catch (e) {
    return { success: false, error: e };
  }
}
