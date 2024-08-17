const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started Successfully')
    })
  } catch (e) {
    console.log(`Db Error: '${e.message}'`)
    process.exit(1)
  }
}

intializeDbAndServer()

// GET todos API

app.get('/todos/', async (request, response) => {
  const {status = '', priority = '', search_q = ''} = request.query
  const statusLength = status.length
  const priorityLength = priority.length
  const todoLength = search_q.length
  const query = `SELECT
            * 
            FROM
            todo
            WHERE CASE
                    WHEN ${statusLength} > 0 AND ${priorityLength} = 0 THEN status = '${status}'
                    WHEN ${priorityLength} > 0 AND ${statusLength} = 0 THEN priority = '${priority}'
                    WHEN ${statusLength} > 0 AND ${priorityLength} > 0 priority = '${priority} AND status = '${status}'
                    WHEN ${todoLength} > 0 THEN todo = '%${search_q}%'
                  END;`
  const queryArray = await db.all(query)
  response.send(queryArray)
})

// GET todoId API

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoQuery = `
                    SELECT
                    *
                    FROM
                    todo
                    WHERE id = ${todoId}`
  const todoObject = await db.get(todoQuery)
  response.send(todoObject)
})

// POST todo API

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const addTodoQuery = `
                        INSERT INTO
                        todo(id,todo,priority,status)
                        VALUES
                        (${id},'${todo}','${priority}','${status}')
                        `
  await db.run(addTodoQuery)
  response.send('Todo Successfully Added')
})

// PUT todoId API

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  let updateColumn = ''
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'
      break
    case requestBody.priority !== undefined:
      updateColumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updateColumn = 'Todo'
      break
  }
  const previousTodoQuery = `SELECT * FROM todo WHERE id = '${todoId}'`
  const previousTodo = await database.get(previousTodoQuery)
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body

  const updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}' WHERE id = ${todoId};`
  await database.run(updateTodoQuery)
  response.send(`${updateColumn} Updated`)
})

//  DELETE todoId API

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
                          DELETE FROM
                          todo
                          WHERE id = ${todoId}`
  await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
