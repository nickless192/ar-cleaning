import React, { useState } from 'react';

const AddService = () => {
    const [formData, setFormData] = useState({
        serviceName: '',
        description: '',
        serviceCost: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        if (formData.serviceName && formData.description && formData.serviceCost) {
            const body = {
                name: formData.serviceName,
                description: formData.description,
                serviceCost: formData.serviceCost
            };
            fetch(`${process.env.PORT}/api/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
                .then(response => {
                    if (response.ok) {
                        console.log(response);
                        console.log('Service added!');
                        response.json()
                            .then(data => {
                                console.log(data);
                                alert(`Service ${data.name} added!`);
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
            <h2>Add Service</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="serviceName">Service Name:</label>
                    <input
                        type="text"
                        id="serviceName"
                        name="serviceName"
                        value={formData.serviceName}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="serviceCost">Cost per Quantity:</label>
                    <input
                        type="text"
                        id="serviceCost"
                        name="serviceCost"
                        value={formData.serviceCost}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Add Service</button>
            </form>
        </div>
    );
};

export default AddService;
