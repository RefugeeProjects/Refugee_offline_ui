const jose = require('jose')
// const crypto = require('crypto')

export const decryptAsymJwe = async (jwe) => {
    const privateKey = await jose.importPKCS8(process.env.REACT_APP_PRIVATE.replace(/\\n/g, '\n'), 'RSA-OAEP-256')
    const options = {
        contentEncryptionAlgorithms: ["A256GCM"],
        keyManagementAlgorithms: ["RSA-OAEP-256"],
        
    };
    return jose.jwtDecrypt(jwe, privateKey, options);
}

// //export functions ------------------------------------
// module.exports.decryptAsymJwe = decryptAsymJwe