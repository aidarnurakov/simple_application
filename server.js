const express = require('express');
const { User } = require('./models');
const {Op, Sequelize} = require("sequelize");

const sequelize = new Sequelize('postgres://postgres:root@127.0.0.1:5432/simple_webapp')

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.patch('/updateBalance', async (req, res) => {
    const { userId, amount } = req.body;

    try {
        await sequelize.transaction(async (t) => {
        const user = await User.findOne({
            where: { id: userId },
            lock: t.LOCK.UPDATE,
            transaction: t
        });
        if (user.balance >= amount) {
            await user.decrement('balance', { by: amount, transaction: t });
            res.send("Успешное списание средств");
        } else {
            throw new Error('Недостаточно средств на балансе');
        }
    });
    } catch (error) {
        if (error.message === 'Недостаточно средств на балансе') {
            res.status(400).send(error.message);
        } else {
            console.error('Ошибка при выполнении транзакции:', error);
            res.status(500).send('Внутренняя ошибка сервера');
        }
    }
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
