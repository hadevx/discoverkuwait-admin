import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Paginate = ({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: number;
  setPage: (p: number) => void;
}) => {
  if (pages <= 1) return null; // nothing to paginate

  return (
    <Pagination className="py-2">
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) setPage(page - 1);
            }}
          />
        </PaginationItem>

        {/* Numbers */}
        {[...Array(pages).keys()].map((x) => (
          <PaginationItem key={x + 1}>
            <PaginationLink
              href="#"
              isActive={page === x + 1}
              onClick={(e) => {
                e.preventDefault();
                setPage(x + 1);
              }}>
              {x + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < pages) setPage(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default Paginate;
