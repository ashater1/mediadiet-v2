import { MediaType } from "@prisma/client";
import { json, LoaderFunctionArgs } from "@vercel/remix";
import { apStyleTitleCase } from "ap-style-title-case";
import { ComboboxOption } from "~/features/search/SearchCombobox";
import { getSearchTerm } from "~/features/search/utils";
import { movieDb } from "~/features/works/tvAndMovies/api";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchTerm = getSearchTerm(request.url);
  if (!searchTerm) throw new Error("No search term provided");
  const tvShows = await movieDb.searchTv(searchTerm.trim());

  const data: ComboboxOption[] = tvShows.map((show) => {
    return {
      id: String(show.id),
      title: apStyleTitleCase(show.name) ?? "",
      firstAirYear: show.first_air_date?.slice(0, 4),
    };
  });

  return json({ data, mediaType: MediaType.TV });
}
