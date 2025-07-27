const Category = require('../models/Category');

module.exports = {
    // Fetch all categories
    getCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            res.json(categories);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    // Create a new category
    createCategory: async (req, res) => {
        const { key, labelKey, type, descriptionKey } = req.body;
        try {
            const newCategory = new Category({ key, labelKey, type, descriptionKey });
            await newCategory.save();
            res.status(201).json(newCategory);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    // Update an existing category
    updateCategory: async (req, res) => {
        const { id } = req.params;
        const { key, labelKey, type, descriptionKey } = req.body;
        try {
            const updatedCategory = await Category.findByIdAndUpdate(id, { key, labelKey, type, descriptionKey }, { new: true });
            if (!updatedCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json(updatedCategory);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    // Delete a category
    deleteCategory: async (req, res) => {
        const { id } = req.params;
        try {
            const deletedCategory = await Category.findByIdAndDelete(id);
            if (!deletedCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json({ message: 'Category deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};
