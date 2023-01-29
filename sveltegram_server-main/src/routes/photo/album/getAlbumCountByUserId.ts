import album from '../../../models/photo/album';
import User from '../../../models/user';



module.exports = async (req, res , next) => {
    album.find()
    res.json({
        
        owned!: album;
        shared!: User.;
        sharing!: User;

    })
}  
    

//number