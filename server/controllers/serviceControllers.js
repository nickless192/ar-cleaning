const { Service } = require('../models');

const serviceControllers = {
    getServices(req, res) {
        Service.find({})
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbServiceData => res.json(dbServiceData))
            .catch(err => res.status(400).json(err));
    },
    getServiceById({ params }, res) {
        Service.findOne({ name: params.name })
            .select('-__v')
            .then(dbServiceData => {
                if (!dbServiceData) {
                    res.status(404).json({ message: 'No service found with this name' });
                    return;
                }
                res.json(dbServiceData);
            })
            .catch(err => res.status(500).json(err));
    },
    getServiceByName({ params }, res) {
        Service.findOne({ name: params.name })
            .select('-__v')
            .then(dbServiceData => {
                if (!dbServiceData) {
                    res.status(404).json({ message: 'No service found with this name' });
                    return;
                }
                res.json(dbServiceData);
            })
            .catch(err => res.status(500).json(err));
    },
    async createService({ body }, res) {
        Service.create(body).
            then(dbServiceData => {
                console.log(dbServiceData);
                res.status(200).json(dbServiceData);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },
    updateService({ params, body }, res) {
        Service.findByIdAndUpdate({ _id: params.serviceId }, body, { new: true })
            .select('-__v')
            .then(dbServiceData => {
                if (!dbServiceData) {
                    res.status(404).json({ message: 'No service found by this name' });
                    return;
                }
                res.json(dbServiceData);
            })
            .catch(err => res.status(500).json(err));
    },
    deleteService({ params }, res) {
        Service.findByIdAndDelete({ _id: params.serviceId })
            .then(dbServiceData => {
                if (!dbServiceData) {
                    res.status(404).json({ message: 'No service found by this name' });
                    return;
                }
                res.json(dbServiceData);
            })
            .catch(err => res.status(400).json(err));
    }
}

module.exports = serviceControllers;