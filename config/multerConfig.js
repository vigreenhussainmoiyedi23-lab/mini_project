const multer=require('multer');
const path=require('path');
const crypto=require('crypto');

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./public/images/uploads');
    },
    filename:(req,file,cb)=>{
        const hash=crypto.randomBytes(16).toString('hex');
        const filename=`${hash}${path.extname(file.originalname)}`;
        cb(null,filename);
    }
})

module.exports=multer({storage});