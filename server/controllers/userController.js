const ApiError = require('../error/apiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const {User, Basket} = require('../models/models')


generateJWT = (user) => { 
    const {id, email,role} = user
    return jwt.sign(
    {id, email, role }, 
    process.env.SECRET_KEY, 
    {expiresIn:'24h'})}
class UserController{

    async registration(req, res, next){
        const {email, password, role} = req.body

        if (!email || !password) 
            return next(ApiError.badRequest('UserController registration invalid Email or Password'))

        const candidate = await User.findOne({where:{email}})
        if (candidate)
            return next(ApiError.badRequest('UserController registration User with such email has been exist'))
        
        const hashPassword = await bcrypt.hash(password, 5)

        const user = await User.create({
            email, role, password: hashPassword
        })
        
        const basket = await Basket.create({userId: user.id})
        const token = generateJWT(user)
        
        return res.json(token)
    }

    async login(req, res, next){
        console.log('you have just tried to login')
        const {email, password} = req.body
        const user = await User.findOne({where:{email}})
        if (!user) 
            return next(ApiError.badRequest('UserController login User has not found'))
        let isCompared = bcrypt.compareSync(password, user.password)
        if (!isCompared) 
            return next(ApiError.badRequest('UserController login password is not valid'))
        const token = generateJWT(user)
        return res.json(token)
    }

    async check(req, res, next){        
        const token = generateJWT(req.user)
        return res.json(token)
    }
    
}

module.exports = new UserController()