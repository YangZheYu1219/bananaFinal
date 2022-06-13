const Sequelize = require('sequelize'); 

const database = new Sequelize('bananaFinal', 'root', '12345678', {
    dialect: 'mysql', 
    host: 'localhost'
});

module.exports = database;