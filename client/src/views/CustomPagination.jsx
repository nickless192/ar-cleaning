import React from 'react';
import { Pagination } from 'react-bootstrap';

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageItems = [];

  // Generate page numbers dynamically (show max 5 pages)
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(startPage + 4, totalPages);

  for (let number = startPage; number <= endPage; number++) {
    pageItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => onPageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <Pagination className="justify-content-center">
      <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
      <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
      {pageItems}
      <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
      <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
    </Pagination>
  );
};

export default CustomPagination;
