const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../frontend/public/images/users')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".jpg")
    }
})

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../frontend/public/images/products')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

const uploadDis = multer({ storage: storage })
const uploadProd = multer({ storage: storage2 })

exports.uploadDis = uploadDis
exports.uploadProd = uploadProd

