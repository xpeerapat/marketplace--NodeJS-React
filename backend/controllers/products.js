const User = require('../models/User')
const Product = require('../models/Product')
const Category = require('../models/Category')
const { slugify } = require('../utils/stringUtil')

let a = new Date(Date.now())
let dateUTC = a.toUTCString().slice(0, 16)

module.exports.addProduct = async (req, res) => {

    try {

        if (!req.body) throw 'data is required'
        const data = await req.body
        if (!data.name) throw 'name is required'
        if (!data.price) throw 'price is required'
        if (!data.category) throw 'category is required'
        if (!data.condition) throw 'condition is required'
        if (!data.desc) throw 'desc is required'
        if (req.files == '') throw 'image is required'

        let images = []
        for (i of req.files) {
            let path = i.destination.slice(18,) + '/' + i.filename
            images.push(path)
        }
        const user = await User.findOne({ email: req.user.email })
        const addProduct = new Product({
            name: data.name,
            desc: data.desc,
            price: data.price,
            category: data.category,
            condition: data.condition,
            date: dateUTC,
            images: images
        })

        // tagged to product 
        let categoryExists = await Category.findOne({ name: data.category })
        if (categoryExists) {
            categoryExists.categorized.push(addProduct)
            categoryExists.save()
        } else {
            let newCategory = await new Category({ name: data.category })
            newCategory.categorized.push(addProduct)
            newCategory.save()
        }

        // name + last 4 char of _id to making slug
        addProduct.slug = slugify(addProduct.name, addProduct._id)
        addProduct.owner = user._id
        addProduct.save()

        // user own this product
        user.list.push(addProduct)
        user.save()

        res.status(201).json({ status: "ok", slug: addProduct.slug })

    } catch (err) {
        res.status(404).json({ err: err })
    }

}
module.exports.getRandom = async (req, res) => {
    try {
        //get all user  
        User.find((err, user) => {
            if (user) {
                for (i of user) { // i => each USER 
                    Product.find({ owner: i._id }, (err, data) => {
                        if (data == "") { }
                        else res.json(data)
                    })
                }
            }
            else throw 'errz'
        })
    } catch (err) {
        res.status(404).json({ err: err })
    }
}
module.exports.getListByUser = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.params.slug })
        if (!user) throw 'No such user found'

        const list = await Product.find({ owner: user._id })
 
        user.password = undefined
        return res.status(200).json({ status: 'ok', list: list, user: user })

    } catch (err) {
        res.json({ err: err })
    }
}

module.exports.getSingleProduct = async (req, res) => {
    try {
        // const user = await User.findOne({ email: req.user.email })
        const product = await Product.findOne({ slug: req.params.slug })
        if (!product) throw 'no item'

        const user = await User.findOne({ _id: product.owner }).select('name').select('avatar')
        res.json({ status: 'ok', product: product, user: user })

    } catch (err) {
        res.json({ err: err })
    }
}

module.exports.updateProduct = async (req, res) => {

    try {

        const data = req.body
        const slug = req.params.slug;
        if (!data) throw 'Field is required'

        // get req data        
        const product = await Product.findOne({ slug: slug })
        if (!product) throw 'No such item found'

        // verify user 
        const user = await User.findOne({ email: req.user.email })
        if ((user._id).toString() != product.owner) {
            res.status(403);
            throw 'You must be the owner to modify this product'
        }

        //store new data to newvar
        const name = data.name ? data.name : product.name
        const desc = data.desc ? data.desc : product.desc
        const price = data.price ? data.price : product.price
        const category = data.category ? data.category : product.category
        const condition = data.condition ? data.condition : product.condition
        const newSlug = slugify(name, product._id)

        let imagesDb = product.images
        let delImages = data.delImages
        let updateImages = product.images

        if (delImages) {

            if (delImages.length > 10) { delImages = [data.delImages] }
            updateImages = []
            // db = [1,2,3,4]               del = [2,3]    
            updateImages = imagesDb.filter(value => !delImages.includes(value))
            if (updateImages == '') throw 'image is required'
            // delete&put file in localfolder
            const fs = require('fs');
            for (img of delImages) {
                try {
                    let filePath = `../frontend/public/${img}`
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.log(err);
                }
            }
        }

        if (req.files) {
            for (img of req.files) {
                let path = img.destination.slice(18,) + '/' + img.filename
                updateImages.push(path)
            }
        }

        Product.findOneAndUpdate({ slug: slug },
            {
                name: name, desc: desc, price: price, slug: newSlug,
                images: updateImages, category: category,
                condition: condition, data: dateUTC
            },
            { new: true }, (err, data) => {
                if (!err) return res.json({ status: "ok", slug: newSlug })
                else throw 'error'

            })

    } catch (err) {
        res.json({ err: err })
    }
}

module.exports.delProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
        if (!product) throw 'Not found product to delete.'
        //verify user
        const user = await User.findOne({ email: req.user.email })
        if ((user._id).toString() != product.owner) {
            res.status(403)
            throw 'You must be the owner to delete this product'
        }

        // delete product in category 
        let myCategory = await Category.findOne({ name: product.category })
        let thisCategory = myCategory.categorized
        let index = thisCategory.indexOf(product._id.toString())
        thisCategory.splice(index)
        myCategory.save()

        // delete product in User
        if (product.owner == user._id.toString()) { // compare prod and owner
            let userList = user.list.toString().split(",") // array of list in User
            let index = userList.indexOf(product._id.toString())
            console.log('index', index);
            user.list.splice(index)
            user.save()
            console.log('save');
        }

        // delete file in folder
        let fs = require('fs');
        try {
            for (p of product.images) {
                let filePath = `../frontend/public/${p}`
                fs.unlinkSync(filePath);
            }
        }
        catch (err) {
            console.log(err);
        }

        // delete product
        Product.findOneAndDelete({ slug: req.params.slug }, (err, data) => {
            if (!err) res.json({ status: "ok", message: "Delete succesful!" })
            else throw 'not found item'
        })

    } catch (err) {
        res.json({ err: err })
    }
}

