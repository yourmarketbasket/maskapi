const User = require('../models/user');
class AuthService {
    // login user by fetching the username
    static async loginUser(username) {
        try {
            const user = await User.findOne({ username });
            if(!user) {
                return {
                    success: false,
                    message: 'User not found.',
                };
            }
            return {
                success: true,
                username: user.username,
            };
        } catch (err) {
            console.error('Error logging in user:', err);
            return {
                success: false,
                message: 'Error logging in user.',
            };
        }
    }

    // save webauthn challenges
    
    
    

    
}

module.exports = AuthService;