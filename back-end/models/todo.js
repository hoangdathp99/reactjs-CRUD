module.exports = (sequelize, type) => {
    return sequelize.define('todo', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        description: {type: type.STRING, allowNull: false},
        isFinished: {type: type.BOOLEAN, defaultValue: false}
    })
}
