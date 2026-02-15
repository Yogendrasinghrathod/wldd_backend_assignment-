// GET /api/tasks → List tasks for the logged-in user
// POST /api/tasks → Create a new task
// PUT /api/tasks/:id → Update a task
// DELETE /api/tasks/:id → Delete a task
import {Router} from 'express'
import { createTask, deleteTask, getTask, updateTask } from '../controllers/taskController'
import authMiddleware from '../middlewares/authMiddleware'

const router=Router()
//app.use('/api/tasks',)
router.get('/',authMiddleware,getTask) // list task
router.post('/',authMiddleware,createTask)  //cretae task
router.put('/:id',authMiddleware ,updateTask)  //update task
router.delete('/:id',authMiddleware ,deleteTask)  //delete task




export default router