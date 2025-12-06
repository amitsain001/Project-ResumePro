const Resume = require ("../models/resume.js") ;

module.exports.renderresume = ( req , res ) => {
    res.render ( "./layouts/boilerplate.ejs") ;
}

module.exports.rendermyresumeroute = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.render("../views/showresumes/myresume.ejs", { resumes }); // render UI page
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while fetching resumes.");
  }
}

module.exports.viewresume = async (req, res) => {

  const templateMap = {
    creative: 'CreativeView',         // views/resume/creative.ejs
    modern: 'ModernView',             // views/resume/modern.ejs
    classic: 'ClassicView',       // views/resume/ClassicView.ejs  <-- example
    simple: 'SimpleView',
    designed: 'DesignedView'
  };

  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      req.flash('error', 'Resume not found');
      return res.redirect('/myresume');
    }
    if (String(resume.user) !== String(req.user._id)) {
      return res.status(403).send('Forbidden');
    }

    const t = resume.templateType;
    const viewName = templateMap[t];
    if (!viewName) {
      return res.status(400).send('Invalid template type.');
    }

    return res.render(`resume/${viewName}`, { resume });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while fetching resume.');
  }
}

module.exports.editresume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      req.flash && req.flash('error', 'Resume not found');
      return res.redirect('/myresume');
    }
    // ownership check
    if (String(resume.user) !== String(req.user._id)) {
      req.flash && req.flash('error', 'You are not authorized to edit this resume');
      return res.redirect('/myresume');
    }

    // small template map if you want pretty names in select
    const templateMap = {
      creative: 'creative',
      modern: 'modern',
      classic: 'classic',
      designed: 'designed',
      simple: 'simple'
    };

    return res.render('showresumes/editResume', { resume, templateMap });
  } catch (err) {
    console.error('GET edit error:', err);
    req.flash && req.flash('error', 'Server error');
    return res.redirect('/myresume');
  }
}

module.exports.updateresume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      req.flash && req.flash('error', 'Resume not found');
      return res.redirect('/myresume');
    }

    if (String(resume.user) !== String(req.user._id)) {
      req.flash && req.flash('error', 'Not authorized');
      return res.redirect('/myresume');
    }

    // whitelist allowed fields to update
    const allowed = ['fullName', 'email', 'phone', 'summary', 'templateType'];
    const updates = {};

    if (req.file) {
      updates.profileImage = req.file.secure_url || req.file.url || req.file.path || req.file.filename || '';
    }

    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    // skills as comma separated string -> array
    if (req.body.skills !== undefined) {
      updates.skills = String(req.body.skills).split(',').map(s => s.trim()).filter(Boolean);
    }

    // Accept JSON for arrays (education/experience/projects) — optional
    if (req.body.education) {
      try { updates.education = JSON.parse(req.body.education); } catch (e) { /* ignore parse error */ }
    }
    if (req.body.experience) {
      try { updates.experience = JSON.parse(req.body.experience); } catch (e) {}
    }
    if (req.body.projects) {
      try { updates.projects = JSON.parse(req.body.projects); } catch (e) {}
    }

    updates.updatedAt = new Date();

    await Resume.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    req.flash && req.flash('success', 'Resume updated');
    return res.redirect(`/resumes/${req.params.id}`);

  } catch (err) {

    console.error('POST update error:', err);
    req.flash && req.flash('error', 'Server error while updating');
    return res.redirect('/myresume');

  }
}

module.exports.singledestroy = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      req.flash && req.flash('error', 'Resume not found');
      return res.redirect('/myresume');
    }
    if (String(resume.user) !== String(req.user._id)) {
      return res.status(403).send('Forbidden');
    }

    await Resume.findByIdAndDelete(req.params.id);

    // TODO: also delete any files on disk if you stored PDFs or images
    req.flash && req.flash('success', 'Resume deleted successfully');
    res.redirect('/myresume');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

module.exports.alldestroy = async (req, res) => {
  try {
    // optional extra check: require confirmText === 'DELETE' (server-side too)
    const confirmText = (req.body.confirmText || '').trim().toUpperCase();
    if (confirmText !== 'DELETE') {
      // keep user on page with a message if you use flash; otherwise simple redirect
      req.flash && req.flash('error', 'Delete confirmation missing or incorrect.');
      return res.redirect('/myresume');
    }

    // delete only this user's resumes
    const result = await Resume.deleteMany({ user: req.user._id });

    // if you store files on disk, delete files for this user here (see note below)

    req.flash && req.flash('success', `Deleted ${result.deletedCount} resumes.`);
    return res.redirect('/myresume');
  } catch (err) {
    console.error('Error deleting all resumes:', err);
    req.flash && req.flash('error', 'Server error while deleting resumes.');
    res.status(500).redirect('/myresume');
  }
}