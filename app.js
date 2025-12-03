require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const userModel = require('./model/user');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const postModel = require('./model/post');
const upload = require('./config/multerConfig');
const path = require('path');
const { log } = require('console');

//----middleware----


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'ejs');

//----views routes----
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/login', (req, res) => {
    res.render('login');
});

//-----error rputes-----
app.get('/WentWrong', (req, res) => {
    res.send(`Something went Wrong! <a href="/">Go Back to register page</a>`);
});
app.get('/Unauthorized', (req, res) => {
    res.send(`You are not authorized to view this page! <a href="/login">Go Back to login page</a>`);
});

//----auth routes----
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let UserExists = await userModel.findOne({ email });
        if (UserExists) return res.redirect('/WentWrong');

        const hash = await bcrypt.hash(password, 10);

        const CreatedUser = await userModel.create({ username, email, password: hash });

        const token = jwt.sign({ email: CreatedUser.email }, process.env.JWT_SECRET);

        res.cookie('token', token);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/WentWrong');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email })
    if (!user) res.redirect('/WentWrong')
    const result = await bcrypt.compare(password, user.password)
    if (!result) return res.redirect('/WentWrong');
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET)
    res.cookie('token', token)
    res.redirect(`/`);
});


//-----post/Profile routes ----
app.get('/',authenticateToken ,async (req, res) => {
    res.render('profile', { user:req.user});
})
app.get('/UpdateProfile',authenticateToken ,async (req, res) => {
    res.render('updateProfile', { user:req.user});
})
app.post('/update/:id',upload.single('pfp'),authenticateToken,async (req, res) => {
req.user.username=req.body.username;
await req.user.save()
if(req.file){
    req.user.profilePicture=`/images/uploads/${req.file.filename}`
    await req.user.save()
}
    res.redirect("/")
})
app.post('/createPost',authenticateToken ,async (req, res) => {
    const { title, content } = req.body;
    const newPost = await postModel.create({ title, content, user: req.user._id });
    req.user.post.push(newPost._id);
    await req.user.save();
    res.redirect('/');
})
app.get("/edit/:id",authenticateToken ,async (req,res)=>{
    const post=await postModel.findOne({_id:req.params.id}).populate('user')
    const user=req.user
    res.render("edit",{post,user})
})
app.post("/update/:id",authenticateToken,async (req,res)=>{
    const post=await postModel.findOneAndUpdate({_id:req.params.id},{title:req.body.title,content:req.body.content})
    await post.save()
    res.redirect("/")
})
app.get("/postGallery",authenticateToken,async (req,res)=>{
    const posts=await postModel.find().populate('user')
    const user=req.user;
    
    res.render("postGallery",{posts,user})
})

app.get("/like/:id",authenticateToken ,async (req,res)=>{
    const post=await postModel.findOne({_id:req.params.id}).populate('user')
    const user=req.user
    post.Likes.indexOf(user._id)==-1?post.Likes.push(user._id):post.Likes.splice( post.Likes.indexOf(user._id),1)
    await post.save()
    res.redirect("/")
})
app.get("/all/like/:id",authenticateToken ,async (req,res)=>{
    const post=await postModel.findOne({_id:req.params.id}).populate('user')
    const user=req.user
    post.Likes.indexOf(user._id)==-1?post.Likes.push(user._id):post.Likes.splice( post.Likes.indexOf(user._id),1)
    await post.save()
    res.redirect("/postGallery")
})

async function authenticateToken(req, res, next) {
    const { token } =req.cookies;
    if (!token) return res.redirect('/login');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: decoded.email }).populate('post');
    if (!user) return res.redirect('/Unauthorized');   
    req.user = user;
    next()
}

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
 