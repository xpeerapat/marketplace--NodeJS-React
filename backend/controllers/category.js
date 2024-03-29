const Product = require('../models/Product')
const Category = require('../models/Category')

module.exports.getSingleCategory = async (req, res) => {
    try {
        const category = await Category.findOne({ name: req.params.slug })
        if (!category) throw 'not-found'
        const ids = category.categorized
        const lists = []

        if (ids != '') {
            for (item in ids) {
                let product = await Product.findOne({ _id: ids[item] })
                if (product !== null) lists.push(product)

            }
        }
        res.json({ status: 'ok', lists: lists })

    } catch (err) {
        res.status(422).json({ err: err })
    }
}


