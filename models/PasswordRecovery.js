import mongoose from 'mongoose'

const PasswordRecoverySchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    resendAfter: {
      type: Date,
      required: true,
    },
    resetTokenHash: {
      type: String,
      default: null,
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// Expiry time পেরোলেই MongoDB record পরিষ্কার করতে পারবে।
PasswordRecoverySchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)

export default mongoose.models.PasswordRecovery ||
  mongoose.model('PasswordRecovery', PasswordRecoverySchema)