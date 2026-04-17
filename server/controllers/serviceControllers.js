const { Service } = require('../models');
const {
    assertNoOperatorKeys,
    pickAllowedFields,
    validateObjectId,
} = require('../utils/mongoSafety');

const SERVICE_FIELDS = [
    'categoryKey',
    'serviceId',
    'name',
    'nameKey',
    'descriptionKey',
    'cost',
    'isActive',
    'options',
    'order',
    'isVisible',
];

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
        try {
            assertNoOperatorKeys(body);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid service payload' });
        }

        const createData = pickAllowedFields(body, SERVICE_FIELDS);
        Service.create(createData).
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
        if (!validateObjectId(params.serviceId)) {
            return res.status(400).json({ message: 'Invalid service ID' });
        }
        try {
            assertNoOperatorKeys(body);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid service payload' });
        }

        const updateData = pickAllowedFields(body, SERVICE_FIELDS);
        Service.findByIdAndUpdate(params.serviceId, updateData, { new: true, runValidators: true })
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
        if (!validateObjectId(params.serviceId)) {
            return res.status(400).json({ message: 'Invalid service ID' });
        }
        Service.findByIdAndDelete(params.serviceId)
            .then(dbServiceData => {
                if (!dbServiceData) {
                    res.status(404).json({ message: 'No service found by this name' });
                    return;
                }
                res.json(dbServiceData);
            })
            .catch(err => res.status(400).json(err));
    },
    duplicateService({params, body}, res) {
        if (!validateObjectId(params.serviceId)) {
            return res.status(400).json({ message: 'Invalid service ID' });
        }
        Service.findById(params.serviceId)
        .then(originalService => {
            if (!originalService) {
                return res.status(404).json({ message: 'No service found to duplicate' });
            }

            // Clone the service data
            const duplicatedData = originalService.toObject();
            delete duplicatedData._id;
            delete duplicatedData.serviceId;
            delete duplicatedData.createdAt;
            delete duplicatedData.updatedAt;
            delete duplicatedData.__v;

            // Update the name or append (Copy)
            duplicatedData.name = body?.name || `${originalService.name} (Copy)`;

            return Service.create(duplicatedData);
        })
        .then(duplicatedService => res.status(201).json(duplicatedService))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to duplicate service', error: err });
        });
    }
}

module.exports = serviceControllers;
