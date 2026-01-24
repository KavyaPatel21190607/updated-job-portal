const mongoose = require('mongoose');

/**
 * Application Schema
 * Tracks job applications from job seekers to jobs
 */
const applicationSchema = new mongoose.Schema(
  {
    // References
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    jobSeeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Application Status
    status: {
      type: String,
      enum: ['pending', 'viewed', 'shortlisted', 'interview', 'hired', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    
    // Resume & Documents
    resume: {
      filename: String,
      path: String,
      uploadedAt: Date,
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    additionalDocuments: [{
      filename: String,
      path: String,
      uploadedAt: Date,
    }],
    
    // Interview Details
    interview: {
      scheduled: {
        type: Boolean,
        default: false,
      },
      date: Date,
      time: String,
      mode: {
        type: String,
        enum: ['video', 'phone', 'in-person'],
      },
      location: String,
      meetingLink: String,
      notes: String,
    },
    
    // Employer Actions
    viewedAt: Date,
    shortlistedAt: Date,
    rejectedAt: Date,
    hiredAt: Date,
    
    // Employer Notes
    employerNotes: {
      type: String,
      trim: true,
    },
    
    // ATS Score (calculated based on skills match)
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    
    // Timeline tracking
    timeline: [{
      status: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      note: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for queries
applicationSchema.index({ job: 1, jobSeeker: 1 }, { unique: true }); // One application per job per seeker
applicationSchema.index({ jobSeeker: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

/**
 * Add status to timeline before saving
 */
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

/**
 * Update status timestamps
 */
applicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'viewed':
        this.viewedAt = now;
        break;
      case 'shortlisted':
        this.shortlistedAt = now;
        break;
      case 'rejected':
        this.rejectedAt = now;
        break;
      case 'hired':
        this.hiredAt = now;
        break;
    }
  }
  next();
});

/**
 * Calculate ATS score based on skills match
 */
applicationSchema.methods.calculateATSScore = async function () {
  try {
    await this.populate('job jobSeeker');
    
    const jobSkills = this.job.requiredSkills || [];
    const seekerSkills = this.jobSeeker.skills || [];
    
    if (jobSkills.length === 0) {
      this.atsScore = 50; // Default score
      return 50;
    }
    
    // Calculate match percentage
    const matchedSkills = jobSkills.filter(skill =>
      seekerSkills.some(seekerSkill =>
        seekerSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    const score = Math.round((matchedSkills.length / jobSkills.length) * 100);
    this.atsScore = score;
    
    return score;
  } catch (error) {
    console.error('ATS Score calculation error:', error);
    return 0;
  }
};

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
