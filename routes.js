'use strict'

const authController      = require('./src/controllers/AuthController')
const profileController   = require('./src/controllers/ProfileController')
const userController      = require('./src/controllers/UserController')

const authMiddleware  = require('./src/middlewares/AuthMiddleware')

module.exports = function (app, opts) {
  // Setup routes, middleware, and handlers
  app.get('/', async (req, res) => {
    return res.json({
      status  : 200,
      message   : 'Welcome to my API',
      author  : 'Boy Boni Panjaitan'
    })
  })

  app.post('/auth/sign-in', authController.loginValidation, authController.login)
  app.post('/auth/register', authController.registerValidation, authController.register)

  app.use('/profile', authMiddleware.verifyToken)
  app.get('/profile', profileController.detail)
  app.post('/profile', profileController.updateValidation, profileController.update)

  app.use('/users', authMiddleware.verifyToken)
  app.get('/users', userController.getAllUsers)
  app.post('/users', userController.addUserValidation, userController.addUser)
  app.put('/users/:id', userController.updateUserValidation, userController.updateUser)
  app.get('/users/:id', userController.getUser)
  app.delete('/users/:id', userController.deleteUser)
}
