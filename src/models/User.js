const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['Admin', 'Doctor', 'Receptionist', 'Patient'],
        required: true
    },
    subscriptionPlan: {
        type: String,
        enum: ['Free', 'Basic', 'Pro'],
        default: 'Free'
    },
    status: {
        type: String,
        enum: ['active', 'blocked', 'suspended', 'deleted'],
        default: 'active'
    },
    specialization: { type: String }, // For doctors
    phone: { type: String },
    address: { type: String },
    profileImage: { type: String },
    statusUpdatedAt: { type: Date },
    statusUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastLogin: { type: Date }
}, { timestamps: true });

// Pre-save middleware to hash passwords
userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
