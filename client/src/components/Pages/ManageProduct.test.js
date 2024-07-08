import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import ManageProduct from './ManageProduct';

describe('ManageProduct', () => {
  test('renders the component', () => {
    render(<ManageProduct />);
    // Add your assertions here
  });

  test('adds a new product', async () => {
    render(<ManageProduct />);
    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText('Product Name'), { target: { value: 'New Product' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Product Description' } });
    fireEvent.change(screen.getByPlaceholderText('Cost per Quantity'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('Quantity at Hand'), { target: { value: '100' } });

    // Submit the form
    fireEvent.click(screen.getByText('Add Product'));

    // Wait for the API call to complete
    await waitFor(() => {
      // Add your assertions here
    });
  });

  test('edits a product', async () => {
    render(<ManageProduct />);
    // Find the product you want to edit
    const productCard = screen.getByText('Product Name');

    // Click the edit button
    fireEvent.click(screen.getByText('Edit'));

    // Modify the product details
    fireEvent.change(screen.getByPlaceholderText('Product Name'), { target: { value: 'Updated Product' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Updated Description' } });
    fireEvent.change(screen.getByPlaceholderText('Cost per Quantity'), { target: { value: '20' } });
    fireEvent.change(screen.getByPlaceholderText('Quantity at Hand'), { target: { value: '200' } });

    // Save the changes
    fireEvent.click(screen.getByText('Save'));

    // Wait for the API call to complete
    await waitFor(() => {
      // Add your assertions here
    });
  });

  test('deletes a product', async () => {
    render(<ManageProduct />);
    // Find the product you want to delete
    const productCard = screen.getByText('Product Name');

    // Click the edit button
    fireEvent.click(screen.getByText('Edit'));

    // Click the delete button
    fireEvent.click(screen.getByText('Delete'));

    // Wait for the API call to complete
    await waitFor(() => {
      // Add your assertions here
    });
  });
});