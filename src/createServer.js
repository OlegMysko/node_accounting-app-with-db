'use strict';

const { models } = require('../src/models/models');
const express = require('express');

function createServer() {
  const app = express();

  app.get('/users', async (req, res) => {
    try {
      const users = await models.User.findAll();

      if (users.length === 0) {
        res.statusCode = 200;
        res.json([]);

        return;
      }

      const plainUsers = users.map((u) => u.toJSON());

      res.json(plainUsers);
    } catch (error) {
      res.sendStatus(500);
    }
  });

  app.get('/users/:id', async (req, res) => {
    const { id } = req.params;

    if (!Number.isFinite(Number(id))) {
      res.sendStatus(400);

      return;
    }

    const user = await models.User.findByPk(id);

    if (!user) {
      res.sendStatus(404);

      return;
    }
    res.json(user.toJSON());
  });

  app.post('/users', express.json(), async (req, res) => {
    const { name } = req.body;

    if (typeof name !== 'string') {
      res.sendStatus(400);

      return;
    }

    try {
      const newUser = await models.User.create({
        name,
      });

      res.status(201).json(newUser.toJSON());
    } catch {
      res.sendStatus(500);
    }
  });

  app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    if (!Number.isFinite(Number(id))) {
      res.sendStatus(400);

      return;
    }

    const deleteCount = await models.User.destroy({ where: { id } });

    if (deleteCount === 0) {
      res.sendStatus(404);

      return;
    }

    res.sendStatus(204);
  });

  app.patch('/users/:id', express.json(), async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (
      !Number.isFinite(Number(id)) ||
      typeof name !== 'string' ||
      name === undefined
    ) {
      res.sendStatus(400);

      return;
    }

    const [updateCount] = await models.User.update({ name }, { where: { id } });

    if (updateCount === 0) {
      res.sendStatus(404);

      return;
    }

    const updateUser = await models.User.findByPk(id);

    res.statusCode = 200;
    res.send(updateUser);
  });

  // Use express to create a server
  // Add a routes to the server
  // Return the server (express app)
  app.get('/expenses', async (req, res) => {
    const { userId, categories, from, to, amount } = req.query;

    let filtered = await models.Expense.findAll();

    // userId
    if (userId !== undefined) {
      filtered = filtered.filter((e) => e.userId === Number(userId));
    }

    
    if (categories !== undefined) {
      const categoryList = Array.isArray(categories)
        ? categories
        : categories.split(',');

      filtered = filtered.filter((e) => categoryList.includes(e.category));
    }

    let fromTime, toTime;

    if (from !== undefined) {
      fromTime = new Date(from).getTime();
    }

    if (to !== undefined) {
      toTime = new Date(to).getTime();
    }

    if (fromTime !== undefined) {
      filtered = filtered.filter(
        (e) => new Date(e.spentAt).getTime() >= fromTime,
      );
    }

    if (toTime !== undefined) {
      filtered = filtered.filter(
        (e) => new Date(e.spentAt).getTime() <= toTime,
      );
    }


    if (amount !== undefined) {
      filtered = filtered.filter((e) => e.amount === Number(amount));
    }

    res.status(200).send(filtered);
  });

  app.post('/expenses', express.json(), async (req, res) => {
    const { userId, spentAt, title, amount, category, note } = req.body;
    const users = await models.User.findAll();
    const findUser = users.find((person) => person.id === +userId);

    if (!findUser || !spentAt || !title || !amount || !userId) {
      res.sendStatus(400);

      return;
    }

    try {
      const newExpenses = await models.Expense.create({
        userId: +userId,
        spentAt: spentAt,
        title: title,
        amount: amount,
        category: category || '',
        note: note || null,
      });

      res.status(201).json(newExpenses.toJSON());
    } catch {
      res.sendStatus(500);
    }
  });

  app.get('/expenses/:id', async (req, res) => {
    const { id } = req.params;

    if (!Number.isFinite(Number(id))) {
      res.sendStatus(400);

      return;
    }

    const findExpenses = await models.Expense.findByPk(id);

    if (!findExpenses) {
      res.sendStatus(404);

      return;
    }
    res.send(findExpenses.toJSON());
  });

  app.delete('/expenses/:id', async (req, res) => {
    const { id } = req.params;

    if (!Number.isFinite(Number(id))) {
      res.sendStatus(400);

      return;
    }

    const newExpenses = await models.Expense.destroy({ where: { id } });

    if (newExpenses === 0) {
      res.sendStatus(404);

      return;
    }

    res.sendStatus(204);
  });

  app.patch('/expenses/:id', express.json(), async (req, res) => {
    const { id } = req.params;

    if (!Number.isFinite(Number(id))) {
      res.sendStatus(400);

      return;
    }

    const { spentAt, title, amount, category, note } = req.body;

    const [updateCount] = await models.Expense.update(
      {
        spentAt,
        title,
        amount,
        category,
        note,
      },
      { where: { id } },
    );

    if (updateCount === 0) {
      res.sendStatus(404);

      return;
    }

    const updatExpense = await models.Expense.findByPk(id);

    res.statusCode = 200;
    res.send(updatExpense.toJSON());
  });

  return app;
}

module.exports = {
  createServer,
};
