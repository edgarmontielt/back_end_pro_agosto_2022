const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { jwtSecret } = require("../config")

const Users = require("./users")

class Auth{

    async login(credentials){
        const {email,password} = credentials
        const userService = new Users()

        const user = await userService.getByEmail(email)

        if(user && this.compare(password,user.password)){
            delete user.password
            const token = this.createToken(user)

            return {
                success:true,
                data:user,
                token
            }
        }


        return {
            success:false,
            message:"Credenciales incorrectas. Verificar."
        }

    }

    async signup(credentials){
        console.log(credentials)
        const userService = new Users()
        credentials.password = await this.encrypt(credentials.password)
        const user = await userService.create(credentials)

        if(user){
            const token = this.createToken(user)
            
            console.log(token)
            return {
                success:true,
                data:user,
                token
            }
        }

        return {
            success:false,
            message:"Credenciales incorrectas. Verificar."
        }

    }


    validate(token){
        try {
            const data = jwt.verify(token,jwtSecret)
            return {
                success:true,
                data
            }
        } catch ({message}) {
            return {
                success:false,
                message
            }
        }
    }

    createToken(data){
        const token = jwt.sign(data,jwtSecret)

        return token
    }

    async encrypt(text){
        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hash(text,salt)
        return hash
    }

    async compare(text,hash){
        const result = await bcrypt.compare(text,hash)
        return result //true o false
    }
}


module.exports = Auth