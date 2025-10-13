import * as jose from 'jose'
const { decryptAsymJwe } = require('./decrypt')
// const { ecryptAsyJwtToken } = require('./encrypt')
// require('dotenv').config()

//verify message ------------------------------------
const verifyMsg = (Verify, Msg, Token) => {
    const message = {
        verify: Verify,
        msg: Msg,
        token: Token
    }
    return message
}

// //get symmetric jwtToken -----------------------------------------
// const getToken = sub => {
//     const token = jwt.sign({ sub }, process.env.JWT_SECRET, {
//         algorithm: 'HS256',
//         expiresIn: "8h"
//     })
//     return token;
// }

// //get Aymmetric jweToken -----------------------------------------
// const getAsyJWEToken = (sub) => {
//     const token = getToken(sub)
//     const JweToken = ecryptAsyJwtToken(token)
//     return JweToken;
// }

// verify JWEToken
export const verifyJWEToken = async (eToken) => {

    const secret = new TextEncoder().encode(process.env.REACT_APP_JWT_SECRET)

    var verifiedToken
    var token
    // const headerToken = req.headers.authorization
    // if (!headerToken) return verifyMsg(false, "No token")
    // const bearerToken = headerToken.split(" ")
    // const eToken = bearerToken[1]
    try {
        const jToken = await decryptAsymJwe(eToken)
        token = jToken.payload.jws
        verifiedToken = await jose.jwtVerify(token, secret,{
            issuer: process.env.REACT_APP_TRAFFIC_ISSUER,
            audience: process.env.REACT_APP_TRAFFIC_ISSUER,
        }
        )
        
    } catch (error) {
        console.log("errorDecodeJoseJWE", error);
        // if (error instanceof jwt.JsonWebTokenError) {
        //     return verifyMsg(false, "Unauthorized token")
        // }
        return verifyMsg(false, "Invalid token")
    }
    return verifyMsg(true, verifiedToken.payload.sub, eToken)
}

// // verify JWEToken
// export const verifyJWEToken = async (req) => {
//     var payload
//     var token
//     const headerToken = req.headers.authorization
//     if (!headerToken) return verifyMsg(false, "No token")
//     const bearerToken = headerToken.split(" ")
//     const eToken = bearerToken[1]
 
//     try {
//         const jToken = await decryptAsymJwe(eToken)
//         token = jToken.payload.jws
//         // const claims = jose.decodeJwt(token)
//         payload = jose.decodeJwt(token)
//     } catch (error) {
//         console.log("errorDecodeJWE", error);
//         // if (error instanceof jwt.JsonWebTokenError) {
//         //     return verifyMsg(false, "Unauthorized token")
//         // }
//         return verifyMsg(false, "Invalid token")
//     }
//     return verifyMsg(true, payload.sub, eToken, token)
// }

//export functions ------------------------------------
// module.exports.getToken = getToken
// module.exports.getAsyJWEToken = getAsyJWEToken
// module.exports.verifyJWEToken = verifyJWEToken