const {GiftCard} = require('../models/giftCardModel');
const { isValidObjectId, sanitizeMongoUpdate } = require('../utils/mongoSafety');

const giftCardControllers = {

    getGiftCards(req, res) {
        GiftCard.find({})
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbGiftCardData => res.json(dbGiftCardData))
            .catch(err => res.status(400).json(err));
    },
    getGiftCardById({ params }, res) {
        if (!isValidObjectId(params.id)) {
            return res.status(400).json({ message: 'Invalid gift card id' });
        }

        GiftCard.findOne({ _id: params.id })
            .select('-__v')
            .then(dbGiftCardData => {
                if (!dbGiftCardData) {
                    res.status(404).json({ message: 'No gift card found with this id' });
                    return;
                }
                res.json(dbGiftCardData);
            })
            .catch(err => res.status(500).json(err));
    },
    async createGiftCard({ body }, res) {
        GiftCard.create(body).
            then(dbGiftCardData => {
                console.log(dbGiftCardData);
                res.status(200).json(dbGiftCardData);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },
    updateGiftCard({ params, body }, res) {
        if (!isValidObjectId(params.id)) {
            return res.status(400).json({ message: 'Invalid gift card id' });
        }

        const safeUpdate = sanitizeMongoUpdate(body);
        GiftCard.findByIdAndUpdate(params.id,
            { $set: safeUpdate },
            { new: true })
            .select('-__v')
            .then(dbGiftCardData => {
                if (!dbGiftCardData) {
                    res.status(404).json({ message: 'No gift card found with this id' });
                    return;
                }
                res.json(dbGiftCardData);
            })
            .catch(err => res.status(500).json(err));
    }
};

module.exports = giftCardControllers;
