const adminCollection = require("../models/schema/admin_Schema")
const userCollection = require("../models/schema/user-Schema")

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Types } = require("mongoose");

module.exports = {
  postLogin: async (req, res) => {
    let userSignUpp = {
      Status: false,
      message: null,
      token: null,
      name: null,
    };
    const { enteredEmail, enteredPassword } = req.body;
    let Admin = await adminCollection.find({ email: enteredEmail });
    if (Admin.length !== 0) {
      bcrypt.compare(
        enteredPassword,
        Admin[0].password,
        function (error, isMatch) {
          if (error) {
            userSignUpp.Status = false;
            userSignUpp.message = error;
            res.send({ userSignUpp });
          } else if (isMatch) {
            userSignUpp.Status = true;
            userSignUpp.name = Admin[0].Name;
            const Adminname = Admin[0].Name;
            let Admintoken = jwt.sign({ id: Admin[0]._id }, "secretCode", {
              expiresIn: "24h",
            });
            userSignUpp.token = Admintoken;
            let obj = {
              Admintoken,
              Adminname,
            };
            res
              .cookie("jwt", obj, {
                httpOnly: false,
                maxAge: 6000 * 1000,
              })
              .status(200)
              .send({ userSignUpp });
          } else {
            userSignUpp.message = "Password is wrong";
            userSignUpp.Status = false;
            res.send({ userSignUpp });
          }
        }
      );
    } else {
      userSignUpp.message = "your Email wrong";
      userSignUpp.Status = false;
      res.send({ userSignUpp });
    }
  },
  getUserDetails: (req, res) => {
    const jwtToken = jwt.verify(req.cookies.jwt.Admintoken, "secretCode");
    if (jwtToken) {
      const User = userCollection
        .find()
        .then((data) => {
          res.send({ data });
        })
        .catch(() => {
          res.status(500).send({ erroe: "no user" });
        });
    }
  },
  DeleteUser: (req, res) => {
    const jwtToken = jwt.verify(req.cookies.jwt.Admintoken, "secretCode");
    if (jwtToken) {
      userCollection.deleteOne({ _id: req.params.id }).then(() => {
        res.status(200);
      });
    }
  },
  EditeUser: async (req, res) => {
    console.log('njan ividethi contorller')
    let obj = {
      message: null,
      EditeUser: null,
    };
    const jwtToken = jwt.verify(req.cookies.jwt.Admintoken, "secretCode");
    if (jwtToken) {
      console.log('ifinte ullil keri')
      console.log(req.body,"this is body")
      const { UserEditeEmail, UserEditeName, userID } = req.body;
      let user = await userCollection.find({ email: UserEditeEmail });
      console.log(user[0],"userdeta")
      if (user[0]?._id == userID || user?.length === 0) {
        console.log('user undo if')
        userCollection
          .updateOne(
            { _id: userID },
            {
              $set: {
                Name: UserEditeName,
                email: UserEditeEmail,
              },
            }
          )
          .then(() => {
       
            obj.EditeUser = true;
            res.status(200).send(obj);
          });
      } else {
       
        obj.message = "email already exists";
        obj.EditeUser = false;
        res.status(200).send(obj);
      }
    }
  },
  createUser: async (req, res) => {
      console.log("hey i'm here");
      let userSignUpp = {
        Status: false,
        message: null,
      };
      const { enteredEmail, enteredname } = req.body;
      let { enteredPassword } = req.body;
      let user = await userCollection.find({ email: enteredEmail });
      if (user.length === 0) {
        enteredPassword = await bcrypt.hash(enteredPassword, 10);
        userCollection
          .create({
            Name: enteredname,
            email: enteredEmail,
            password: enteredPassword,
          })
          .then((data) => {
            userSignUpp.Status = true;
            res.send({ userSignUpp });
          });
      } else {
        userSignUpp.message = "email already exists try login with this email";
        res.send({ userSignUpp });
      }
  }
};