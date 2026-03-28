import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.model.js';

export const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.SERVER_URL || 'http://localhost:8000'}/api/auth/google/callback`,
                scope: ['profile', 'email'],
                passReqToCallback: true     // ← allows reading req.query.state
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    const avatar = profile.photos?.[0]?.value;
                    const name = profile.displayName;

                    if (!email) {
                        return done(new Error('No email from Google'), null);
                    }

                    // ─── Check if user exists by email ─────────
                    let user = await User.findOne({ email });

                    if (user) {
                        // ─── Update avatar/googleId if not set ───
                        if (!user.avatar && avatar) {
                            user.avatar = avatar;
                        }
                        if (!user.googleId) {
                            user.googleId = profile.id;
                        }
                        await user.save({ validateBeforeSave: false });
                        return done(null, user);
                    }

                    // ─── Read role from state param ───────────
                    const role = req.query.state === 'owner' ? 'owner' : 'customer';

                    // ─── Create new user ─────────────────────
                    user = await User.create({
                        name,
                        email,
                        avatar,
                        googleId: profile.id,
                        role,
                        password: `google_${profile.id}_${Date.now()}`,  // dummy password
                        isActive: true
                    });

                    return done(null, user);

                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
};