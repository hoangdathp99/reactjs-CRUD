// const mysql = require("mysql");
const Sequelize = require('sequelize')
const TodoModel = require('./models/todo')

const sequelize = new Sequelize('neli', 'root', 'root',{
  host: 'localhost',
  dialect: 'mysql',
  port: 52000,
  pool: {

    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

const Todo = TodoModel(sequelize, Sequelize)

sequelize.sync()
module.exports = {
  Todo
}

