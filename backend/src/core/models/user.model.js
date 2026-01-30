const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../../config');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    immutable: true, // Email cannot be changed after creation
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  preferences: {
    assets: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          // Require at least one asset after onboarding
          return !this.onboardingCompleted || v.length > 0;
        },
        message: 'At least one asset is required'
      }
    },
    investorType: {
      type: String,
      enum: {
        values: ['hodler', 'dayTrader', 'nftCollector', null],
        message: '{VALUE} is not a valid investor type'
      },
      default: null
    },
    contentTypes: {
      type: [String],
      enum: {
        values: ['news', 'charts', 'social', 'fun'],
        message: '{VALUE} is not a valid content type'
      },
      default: []
    }
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  tokenVersion: {
    type: Number,
    default: 0 // Increment to invalidate all tokens
  }
}, {
  timestamps: true
});

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const rounds = config.security?.bcryptRounds || 12;
  const salt = await bcrypt.genSalt(rounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Invalidate all tokens by incrementing tokenVersion
userSchema.methods.invalidateTokens = async function() {
  this.tokenVersion += 1;
  await this.save();
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.tokenVersion;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
