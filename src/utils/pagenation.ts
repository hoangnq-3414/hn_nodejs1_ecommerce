export function generatePaginationLinks(currentPage: number, totalPages: number): string {
  const links = [];

  if (currentPage > 1) {
    links.push(`<a style="color: rgb(201, 197, 197)" class="page-node" href="?page=${currentPage - 1}"><span><</span></a>`);
  }
  for (let page = 1; page <= totalPages; page++) {
    if (page === currentPage) {
      links.push(`<span class="page-node active-node"><span>${page}</span></span>`);
    } else {
      links.push(`<a style="color: #333333;" class="page-node none-active-node" href="?page=${page}"><span>${page}</span></a>`);
    }
  }
  if (currentPage < totalPages) {
    links.push(`<a style="color: rgb(201, 197, 197)" class="page-node page-nav" href="?page=${currentPage + 1}"><span>></span></a>`);
  }

  return links.join(' ');
}
