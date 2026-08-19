const User = require("../models/User");
const bcrypt = require("bcryptjs");
const OTP = require("../models/OTP");
const { sendOTPEmail } = require("../utils/email");
const jwt = require('jsonwebtoken');


const generatetoken = (id , role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}


exports.registerUser = async (req, res) => {
    const { name, email, password} = req.body;

    let userexists = await User.findOne({ email });
    if (userexists) {
        return res.status(400).json({ error: "User already exists" });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    try{
        const user = await User.create({ name, email, password: hashedpassword, roler: 'user', isVerified: false });

        const otp = Math.floor(100000 + Math.random()*900000).toString();
        console.log(`OTP for ${email}: ${otp}`);
        await OTP.create({ email, otp, action: 'account_verification' });
        await sendOTPEmail(email, otp, 'account_verification');

        res.status(201).json({ 
            message: "User registered successfully. Please check your email for the OTP to verify your account.",
            email: user.email
         });

    
        

        
    } catch (error){
        res.status(500).json({ error: error.message });
    }
}


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: "Invalid credentials , please sign up" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    if(!user.isVerified && user.role === 'user'){
    const otp = Math.floor(100000 + Math.random()*900000).toString();
    await OTP.deleteMany({ email, action: 'account_verification' }); 
    await OTP.create({ email, otp, action: 'account_verification' });
    await sendOTPEmail(email, otp, 'account_verification');
    return res.status(400).json({ error: "Account not verified. Please check your email for the OTP to verify your account." });
    }
    res.json({
        message: "Login successful",
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generatetoken(user._id, user.role)
    })
   
    res.status(200).json({ message: "Login successful", user: { name: user.name, email: user.email, role: user.role, isVerified: user.isVerified } });
};



exports.verifyotp = async (req, res) => {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp, action: 'account_verification' });
    if (!otpRecord) {
        return res.status(400).json({ error: "Invalid OTP" });
    }
    const user = await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTP.deleteMany({ email, action: 'account_verification' }); 
    res.json({
         message: "Account verified successfully.  now you can log in ",
         _id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
         token: generatetoken(user._id, user.role)
 });
};
