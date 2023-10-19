import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { LoaderFunctionArgs, SerializeFrom, json } from "@vercel/remix";
import classNames from "classnames";
import React, { useMemo } from "react";
import invariant from "tiny-invariant";
import { FallbackAvatar } from "~/components/avatar";
import { useAddNewContext } from "~/features/add/context";
import { getUserDetails } from "~/features/auth/auth.server";
import ListUserHeaderBar from "~/features/list/components/listUserHeaderBar";
import { getUserEntriesAndCounts } from "~/features/list/db/entries";
import { usePendingDeletions } from "~/features/list/hooks/useGetPendingDeletions";
import {
  BookIcon,
  FavoriteHeart,
  MehThumb,
  MovieIcon,
  ReviewIcon,
  StarsDisplay,
  ThumbsDown,
  ThumbsUp,
  TvShowIcon,
} from "~/features/list/icons/icons";
import { MediaType } from "~/features/list/types";

type UserData = SerializeFrom<typeof loader>;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const response = new Response();
  //   Get username from URL and fetch the users entries and counts
  const username = params.username;
  invariant(username, "userId is required");

  //   Get the data for the user's page & throw if user not found
  const [data, user] = await Promise.all([
    getUserEntriesAndCounts({ username }),
    getUserDetails({ request, response }),
  ]);

  if (!data.userFound) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const isSelf = user?.username === username;

  //   Check if url has filters & filter data if it does
  const url = new URL(request.url);
  const filterTypes = url.searchParams.getAll("type");

  if (filterTypes.length && filterTypes.length !== 3) {
    const filteredEntries = data.entries.filter((d) =>
      filterTypes.includes(d.mediaType)
    );

    return json({
      counts: data.counts,
      entries: filteredEntries,
      isSelf,
      user: data.userInfo,
    });
  }

  return json({
    counts: data.counts,
    entries: data.entries,
    isSelf,
    user: data.userInfo,
  });
}

export default function UserIndex() {
  const data = useLoaderData<typeof loader>();

  const columns: ColumnDef<UserData["entries"]>[] = useMemo(
    () => [
      {
        accessorKey: "consumedDate",
        header: "Date",
        cell: (props) => (
          <div className="flex h-full w-full items-center justify-center text-xs md:text-base">
            {`${props.getValue()}`}
          </div>
        ),
      },
      {
        accessorKey: "mediaType",
        header: "Type",
        cell: (props) => (
          <div className="flex h-full w-full items-center justify-center">
            {props.getValue() === "book" ? (
              <BookIcon />
            ) : props.getValue() === "movie" ? (
              <MovieIcon />
            ) : props.getValue() === "tv" ? (
              <TvShowIcon />
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: (props) => {
          const showDot =
            props.row.getValue("creators") && props.row.getValue("releaseYear");

          return (
            <div className="flex items-center gap-x-5">
              <div className="flex flex-shrink-0 items-center justify-center md:hidden">
                {props.row.getValue("mediaType") === "book" ? (
                  <BookIcon />
                ) : props.row.getValue("mediaType") === "movie" ? (
                  <MovieIcon />
                ) : props.row.getValue("mediaType") === "tv" ? (
                  <TvShowIcon />
                ) : null}
              </div>

              <div className="flex flex-col">
                <div className="text-sm font-semibold line-clamp-2 md:text-base">
                  {props.getValue() as string}
                </div>

                <div className="flex items-center gap-x-2">
                  <div className="mt-0.5 text-xs text-gray-500 line-clamp-2 md:text-sm">
                    {props.row.getValue("creators")}
                  </div>
                </div>
              </div>

              <div className="ml-auto inline-flex flex-shrink-0 items-center gap-2 md:hidden">
                {props.row.getValue("hasReview") ? <ReviewIcon isOn /> : null}

                {props.row.getValue("favorited") ? (
                  <FavoriteHeart isOn />
                ) : null}

                {props.row.getValue("rating") === "liked" ? (
                  <ThumbsUp isOn />
                ) : props.row.getValue("rating") === "disliked" ? (
                  <ThumbsDown isOn />
                ) : props.row.getValue("rating") === "meh" ? (
                  <MehThumb isOn />
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "releaseYear",
        header: "Year",
        cell: (props) => (
          <div className="flex h-full w-full items-center justify-center">
            {`${props.getValue()}`}
          </div>
        ),
      },
      { accessorKey: "creators", header: "Creators" },
      {
        accessorKey: "stars",
        header: "Rating",
        cell: (props) => {
          const stars = props.getValue();
          if (typeof stars === "number") {
            return (
              <div className="flex items-center">
                <StarsDisplay stars={stars} />
              </div>
            );
          }
        },
      },
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "favorited",
        header: "Favorited",
        cell: (props) => (
          <div className="flex h-full w-full items-center justify-center">
            {props.getValue() ? <FavoriteHeart isOn /> : null}
          </div>
        ),
      },
      {
        accessorKey: "hasReview",
        header: "Review",
        cell: (props) => (
          <div className="flex h-full w-full items-center justify-center">
            {props.getValue() ? <ReviewIcon isOn /> : null}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: data.entries as any,
    columns,
    groupedColumnMode: "remove",
    initialState: {
      columnVisibility: {
        creators: false,
        id: false,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="flex w-full flex-col">
      <div className="relative flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <div className="hidden h-16 w-16 overflow-hidden rounded-full bg-gray-100 md:block">
          {data.user.avatar ? (
            <img className="h-full w-full" src={data.user.avatar} />
          ) : (
            <FallbackAvatar />
          )}
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {data.user.firstName
              ? data.user.firstName + " " + data.user.lastName
              : `${data.user.username}`}
          </h2>

          {data.user.firstName && (
            <span className="text-sm text-gray-500">
              @ {data.user.username}
            </span>
          )}
        </div>

        <ListUserHeaderBar
          movieCount={data.counts.movies}
          bookCount={data.counts.books}
          tvCount={data.counts.tv}
        />
      </div>

      <div className="mt-3 border-b border-b-slate-400 md:mt-6" />

      <div className="mt-4 md:mt-4">
        {data.entries.length ? (
          <table className="w-full" key="table">
            <thead className="sr-only md:not-sr-only">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        className={classNames(
                          header.id !== "title" ? "hidden md:table-cell" : null,
                          "px-3 py-2"
                        )}
                        key={header.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    isSelf={data.isSelf}
                    mediaType={row.getValue("mediaType")}
                    reviewId={row.getValue("id")}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          className={classNames(
                            !["title", "consumedDate"].includes(
                              cell.column.id
                            ) && "hidden md:table-cell",
                            cell.column.id === "title" && "w-full",
                            "px-2 py-3 align-middle md:px-5 md:py-6	"
                          )}
                          {...{
                            key: cell.id,
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </TableRow>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState
            isSelf={data.isSelf}
            name={data.user.firstName ?? data.user.username}
          />
        )}
      </div>
    </div>
  );
}

function TableRow({
  isSelf,
  mediaType,
  reviewId,
  children,
}: React.HTMLProps<HTMLTableRowElement> & {
  isSelf: boolean;
  mediaType: MediaType;
  reviewId: string;
}) {
  const pendingDeletions = usePendingDeletions();
  const isBeingDeleted = pendingDeletions.includes(reviewId);

  const { submit } = useFetcher();
  const onDeleteClick = () => {
    submit(
      { id: reviewId },
      { method: "post", action: `/list/${mediaType}/delete` }
    );
  };

  return isSelf ? (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <Link to={`${reviewId}`} className="contents">
          <tr className={classNames(isBeingDeleted && "pulse opacity-25")}>
            {children}
          </tr>
        </Link>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          alignOffset={5}
          className="min-w-[220px] overflow-hidden rounded-md bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
        >
          <ContextMenuItem onClick={onDeleteClick} className="gap-3">
            <TrashIcon className="h-5 w-5 stroke-1" />
            <span>Delete</span>
          </ContextMenuItem>

          <Link to={`${reviewId}/edit`}>
            <ContextMenuItem className="gap-3">
              <PencilSquareIcon className="h-5 w-5 stroke-1" />
              <span>Edit</span>
            </ContextMenuItem>
          </Link>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  ) : (
    <Link to={`${reviewId}`} className="contents">
      <tr className={classNames(isBeingDeleted && "pulse opacity-25")}>
        {children}
      </tr>
    </Link>
  );
}

export function ContextMenuItem({
  className,
  children,
  onClick,
}: React.HTMLProps<HTMLDivElement>) {
  return (
    <ContextMenu.Item
      onClick={onClick && onClick}
      className={classNames(
        "group relative flex select-none items-center stroke-black px-3 py-2 text-sm text-black data-[highlighted]:bg-indigo-700 data-[highlighted]:stroke-slate-500 data-[highlighted]:text-slate-200 ",
        className && className
      )}
    >
      {children}
    </ContextMenu.Item>
  );
}

type EmptyStateProps =
  | {
      isSelf: false;
      name: string;
    }
  | { isSelf: true; name?: string };

function EmptyState({
  isSelf,
  name,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & EmptyStateProps) {
  const { openModal } = useAddNewContext();

  return (
    <div {...props} className="mx-auto flex max-w-lg flex-col gap-4">
      <div className="flex justify-center gap-6">
        <MovieIcon className="stroke-1 md:h-10 md:w-10" />
        <BookIcon className="stroke-1 md:h-10 md:w-10" />
        <TvShowIcon className="stroke-1 md:h-10 md:w-10" />
      </div>

      <div className="flex flex-col items-center gap-5">
        <div className="text-center">
          <h2 className="mt-2 text-base font-semibold leading-6 text-gray-900">
            {isSelf
              ? "You don't have anything in your list yet"
              : `${name} doesn't have anything on their list yet`}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {isSelf
              ? "Start adding to your list so you can show others what you've been watching & reading, and start building your year-end list!"
              : "Check back later to see if they've starting adding things!"}
          </p>
        </div>

        {isSelf && (
          <button
            onClick={openModal}
            type="button"
            className="flex h-10 items-center justify-center rounded border px-3 text-sm font-medium text-gray-500 hover:bg-indigo-500 hover:text-gray-50"
          >
            <PlusIcon className="stroke-4 h-5 w-5" />
            <span className="ml-2">Start adding to your list</span>
          </button>
        )}
      </div>
    </div>
  );
}