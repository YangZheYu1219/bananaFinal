// 第三方套件
const express = require('express')
const path = require('path')  
const history = require('connect-history-api-fallback');
const app = express();
const bodyParser = require('body-parser');// 解析後端資料
const Sequelize = require('sequelize'); // 藉由ORM操作資料庫
const bcryptjs = require('bcryptjs'); // 加密使用者密碼
const session = require('express-session');// 設置登入登出狀態


// 自己建立的module
const bananaProducts = require("./jsons/bananaProductsJSON.json") //json
const color = require("./jsons/colorJSON.json")
const productEntry = require("./jsons/productEntryJSON.json")
const url = require("./jsons/urlJSON.json")
const category = require("./jsons/categoryJSON.json")

const User = require("./models/user.js") // 使用資料庫
const Category = require("./models/category.js")
const BananaProduct = require("./models/products.js")
const Color = require("./models/color.js")
const ImgUrl = require("./models/imgurl.js")
const ProductEntry = require("./models/productEntry.js")
const Cart = require("./models/cart.js")
const CartItem = require("./models/cartItem.js")

const isLogin = require('./AuthGuard/islogin');// 路由守衛

const homeRoutes = require('./routes/product'); // 路由
const authRoutes = require('./routes/auth');
const elseRoutes = require('./routes/else'); 
const editUser = require('./routes/editUser.js')
const addCart = require('./routes/addCart.js')
const removeCartItem = require('./routes/removeCartItem.js')

const categoryApi = require('./apis/categoryApi.js') //api
const productsAllApi = require('./apis/productsAllApi.js') //api
const productApi = require('./apis/productApi.js') //api
const userInformationApi = require('./apis/userInformationApi.js') //api
const userCartApi = require('./apis/userCartApi.js')

const database = require("./utils/database.js")// 連接database


// middleware
app.use(express.static(path.join(__dirname, '/dist'))); // 為了讓server能夠讀取dist資料夾內的靜態檔案ex: css、js
app.use(bodyParser.urlencoded({ extended: false })); //讓網站可以解析post資料的內容 
app.use(bodyParser.json()); // 讓網站可以解析post資料的內容 == 沒有使用form就要加入這行

// 設定session
app.use(session({ 
	secret: 'sessionToken',  // 加密用的字串
	resave: false,   // 沒變更內容是否強制回存
	name: 'user', // optional
	saveUninitialized: false ,  // 新 session 未變更內容是否儲存
	cookie: {
		maxAge: 1000*60*60*24, // session 狀態儲存多久？單位為毫秒,
		//cors solution
		httpOnly: false,
	}
})); 

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findByPk(req.session.user.id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => {
            console.log('custom middleware - findUserBySession error: ', err);
        })
});

// 路由
app.use(homeRoutes);
app.use(authRoutes);
app.use(editUser);
app.use(addCart);
app.use(removeCartItem);

// api
// 產品api
app.use(categoryApi)
app.use(productsAllApi)
app.use(productApi)
// user api
app.use(userInformationApi)
app.use(userCartApi)

// 其他沒有設定的路由
app.use(elseRoutes);

// 資料庫關係
// 一對一關係
User.hasOne(Cart);
Cart.belongsTo(User)

// 一對多關係
Category.hasMany(BananaProduct)
BananaProduct.belongsTo(Category)


// 多對多關係
BananaProduct.belongsToMany(Color, {
    through: {
        model: ProductEntry,
        unique: false,
    },
    foreignKey: 'bananaproductId', 
    constraints: false
})

Color.belongsToMany(BananaProduct, {
    through: {
        model: ProductEntry,
        unique: false,
    },
    foreignKey: 'colorId',
})

BananaProduct.belongsToMany(ImgUrl, {
    through: {
        model: ProductEntry,
        unique: false,
    },
    foreignKey: 'bananaproductId',
    constraints: false
})

ImgUrl.belongsToMany(BananaProduct, {
    through: {
        model: ProductEntry,
        unique: false,
    },
    foreignKey: 'imgurlId',
})
BananaProduct.hasMany(ProductEntry)
ProductEntry.belongsTo(BananaProduct)


Cart.belongsToMany(ProductEntry, {
    through: {
        model: CartItem,
        unique: false,
    }
})

ProductEntry.belongsToMany(Cart, {
    through: {
        model: CartItem,
        // 設為false id才能重複
        unique: false,
    }
})

// 確保 Web Server 運行之前，與資料庫的連接已完成
database
  // 清空資料庫 == 有關聯式資料庫語法 
  // .query("SET FOREIGN_KEY_CHECKS = 0")
  // .then(()=>{
  //     database.sync({ force: true})
  //     .then(()=>{
  //       database.query("SET FOREIGN_KEY_CHECKS = 1")
  //     })
  // })
  .sync({ force: false})
	.then((result) => {
		// 輸入產品資料庫
    Category.bulkCreate(category)
    BananaProduct.bulkCreate(bananaProducts)
    Color.bulkCreate(color)
    ImgUrl.bulkCreate(url)
    ProductEntry.bulkCreate(productEntry)		
		app.listen(3000, () => {
			console.log('Web Server is running on port 3000');
		});
	})
	.catch((err) => {
		console.log('create web server error: ', err);
	});


