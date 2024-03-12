export function generatePaginationLinks(currentPage: number, totalPages: number): string {
  const links = [];

  if (currentPage > 1) {
    links.push(`<a href="?page=${currentPage - 1}">Previous</a>`);
  }
  for (let page = 1; page <= totalPages; page++) {
    if (page === currentPage) {
      links.push(`<span class="active">${page}</span>`);
    } else {
      links.push(`<a href="?page=${page}">${page}</a>`);
    }
  }
  if (currentPage < totalPages) {
    links.push(`<a href="?page=${currentPage + 1}">Next</a>`);
  }

  return links.join(' ');
}
