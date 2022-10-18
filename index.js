const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const express = require('express')
const cors = require('cors');
const fs = require('fs').promises
const fileName = "./todo.json";
const port =3000;
const fetchUrl =`http://localhost:${port}/todos`;
const initialTodos = [
    {
        id: 1,
        title: 'Throw garbage',
        completed: false
    },
    {
        id: 2,
        title: 'Wash the dishes',
        completed: false
    }
];
const store = {

    async read() {
        try {
            await fs.access(fileName);
            this.todos = JSON.parse((await fs.readFile(fileName)).toString());
        } catch (e) {
            this.todos = initialTodos;
        }
        return this.todos;
    },
    async save() {
        await fs.writeFile(fileName, JSON.stringify(this.todos));
    },
    async getIndexById(id) {
        try {
            const todos = await this.read();
            console.log(todos);
            return todos.findIndex(todo => todo.id === +id);
        } catch (e) {
            console.log(e);
        }
    },
    async getNextTodoId() {
        let maxId = 1;
        const todos = await this.read();
        if (todos.length > 0) {
            todos.forEach(todo => {
                if (todo.id > maxId) maxId = todo.id;
            });
            maxId = maxId + 1;
        }
        return maxId;

    },
    todos: []
}
const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get('/todos', async (req, res) => {
    res.json(await store.read());
});

app.post('/todos', async (req, res) => {
    const todo = req.body;
    todo.id =parseInt( await store.getNextTodoId());
    store.todos.push(todo);
    await store.save();
    res.json('ok');
});

app.get('/todos/:id', async (req, res) => {
    const index = await store.getIndexById(req.params.id);
    if (index != -1) {
        res.json(store.todos[index] );
    } else {
        res.json('no');
    }
});
app.put('/todos/:id', async (req, res) => {
    const index = await store.getIndexById(req.params.id);
    if (index != -1) {
        store.todos[index] = req.body;
        store.todos[index].id = req.params.id
        await store.save();
        res.json('ok');
    } else {
        res.json('no');
    }
});
app.delete('/todos/:id', async (req, res) => {
    const index = await store.getIndexById(req.params.id);
    if (index != -1) {
        store.todos.splice(index, 1);
        await store.save();
        res.json('ok');
    } else {
        res.json('no');
    }
});
app.get('/testGet', async (req, res) => {
    const fetchResp = await fetch(fetchUrl);
    const json = await fetchResp.json();
    res.send(json);
});
app.listen(3000, () => {
    console.log(`Listening App    http://localhost:${port}`)
});
