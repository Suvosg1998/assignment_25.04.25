const passport = require("passport");
const passportJWT = require("passport-jwt");
const users = require('../model/user.model');
const mongoose = require('mongoose');

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const params = {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromHeader('x-access-token'),
        ExtractJwt.fromHeader('token')
    ])
};

module.exports = () => {
    const strategy = new JwtStrategy(params, async (payload, done) => {
        try {
            const user = await users.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(payload.id),
                        isDeleted: false
                    }
                }
            ]);

            if (user.length > 0) {
                return done(null, user[0]);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    });

    passport.use(strategy);

    return {
        initialize: () => passport.initialize(),

        authenticate: (req, res, next) => {
            passport.authenticate("jwt", { session: false }, (err, user, info) => {
                if (err) return next(err);

                if (!user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }

                req.user = user;
                return next();
            })(req, res, next);
        },

        authorize: (roles) => (req, res, next) => {
            passport.authenticate("jwt", { session: false }, (err, user, info) => {
                if (err) return next(err);

                if (!user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }

                if (!roles.includes(user.role)) {
                    return res.status(403).json({ message: "Forbidden: You do not have access to this resource" });
                }

                req.user = user;
                return next();
            })(req, res, next);
        }
    };
};