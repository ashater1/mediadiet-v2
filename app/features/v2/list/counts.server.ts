import { db } from "~/db.server";

export async function getEntryListCounts() {
  const [movieCount, bookCount, tvCount] = await db.$transaction([
    db.user.findFirstOrThrow({
      where: {
        username: "adam",
      },
      include: {
        _count: {
          select: {
            Review: {
              where: {
                MediaItem: {
                  mediaType: "MOVIE",
                },
              },
            },
          },
        },
      },
    }),
    db.user.findFirstOrThrow({
      where: {
        username: "adam",
      },
      include: {
        _count: {
          select: {
            Review: {
              where: {
                MediaItem: {
                  mediaType: "BOOK",
                },
              },
            },
          },
        },
      },
    }),
    db.user.findFirstOrThrow({
      where: {
        username: "adam",
      },
      include: {
        _count: {
          select: {
            Review: {
              where: {
                MediaItem: {
                  mediaType: "TV",
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    movieCount: movieCount._count.Review,
    bookCount: bookCount._count.Review,
    tvCount: tvCount._count.Review,
  };
}