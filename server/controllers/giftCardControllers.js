const {GiftCard} = require('../models/giftCardModel');
const {
    assertNoOperatorKeys,
    pickAllowedFields,
    validateObjectId,
} = require('../utils/mongoSafety');

const GIFT_CARD_FIELDS = [
    'code',
    'balance',
    'initialBalance',
    'recipientName',
    'recipientEmail',
    'senderName',
    'message',
    'expiresAt',
    'isActive',
];

const giftCardControllers = {

    getGiftCards(req, res) {
        GiftCard.find({})
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbGiftCardData => res.json(dbGiftCardData))
            .catch(err => res.status(400).json(err));
    },
    getGiftCardById({ params }, res) {
        if (!validateObjectId(params.id)) {
            return res.status(400).json({ message: 'Invalid gift card ID' });
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
        try {
            assertNoOperatorKeys(body);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid gift card payload' });
        }
        const createData = pickAllowedFields(body, GIFT_CARD_FIELDS);
        GiftCard.create(createData).
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
        if (!validateObjectId(params.id)) {
            return res.status(400).json({ message: 'Invalid gift card ID' });
        }
        try {
            assertNoOperatorKeys(body);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid gift card payload' });
        }
        const updateData = pickAllowedFields(body, GIFT_CARD_FIELDS);
        GiftCard.findByIdAndUpdate(params.id,
            updateData,
            { new: true, runValidators: true })
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
