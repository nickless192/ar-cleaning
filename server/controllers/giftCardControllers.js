const {GiftCard} = require('../models/giftCardModel');

const giftCardControllers = {

    getGiftCards(req, res) {
        GiftCard.find({})
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbGiftCardData => res.json(dbGiftCardData))
            .catch(err => res.status(400).json(err));
    },
    getGiftCardById({ params }, res) {
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
        GiftCard.findByIdAndUpdate({ _id: params.id },
            body,
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