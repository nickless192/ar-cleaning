import React, { useState } from 'react';

const AddProduct = () => {
    const [productData, setProductData] = useState({
        productName: '',
        productDescription: '',
        productCost: '',
        quantityAtHand: ''
    });

    const handleChange = (e) => {
        setProductData({
            ...productData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(productData);
        if (productData.productName && productData.productDescription && productData.productCost) {
            const body = {
                name: productData.productName,
                description: productData.productDescription,
                productCost: productData.productCost,
                quantityAtHand: productData.quantityAtHand
            };
            fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
                .then(response => {
                    if (response.ok) {
                        console.log(response);
                        console.log('Product added!');
                        response.json()
                            .then(data => {
                                console.log(data);
                                alert(`Product ${data.name} added!`);
                            });
                    } else {
                        alert(response.statusText);
                    }
                })
                .catch(err => console.log(err));
        }
    };

    return (
        <div>
            <h2>Add Product</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="productName">Product Name:</label>
                    <input
                        type="text"
                        id="productName"
                        name="productName"
                        value={productData.productName}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="productDescription">Description:</label>
                    <textarea
                        id="productDescription"
                        name="productDescription"
                        value={productData.productDescription}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="productCost">Cost per Quantity:</label>
                    <input
                        type="text"
                        id="productCost"
                        name="productCost"
                        value={productData.productCost}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="quantityAtHand">Quantity at Hand:</label>
                    <input
                        type="text"
                        id="quantityAtHand"
                        name="quantityAtHand"
                        value={productData.quantityAtHand}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Add Product</button>
            </form>
        </div>
    );
};

export default AddProduct;
