const Resume = require ("../models/resume.js") ;
const puppeteer = require("puppeteer");
const path = require("path") ;

module.exports.renderbuild = ( req , res ) => {
    res.render ( "./resume/build.ejs" ) ;
}

module.exports.renderspecifictemplate = async (req, res) => {

  const { templateType } = req.params;
  const userId = req.user ? req.user._id : null; // depends on your auth setup

  let resume = await Resume.findOne({ user: userId, templateType });

  // If no resume found, create a temporary one (so EJS always gets 'resume')
  if (!resume) {
    resume = {
      fullName: "John Doe",
      email: "johndoe@gmail.com",
      phone: "9876543210",
      summary: "A passionate developer with strong problem-solving skills.",
      education: [],
      experience: [],
      skills: [],
      projects: [],
      templateType,
    };
  }

  // ✅ Pass 'resume' to EJS
  res.render(`./resume/${templateType}`, { resume });
}

module.exports.viewbuildresume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).send("Resume not found");
    }

    // ✅ Build absolute URL for image (important for PDF)
    if (resume.profileImage && !resume.profileImage.startsWith("http")) {
      resume.profileImage = `${req.protocol}://${req.get("host")}${resume.profileImage}`;
    }

    // Dynamically choose EJS file based on templateType
    const templateMap = {
      simple: "SimpleView",
      modern: "ModernView",
      classic: "ClassicView",
      creative: "CreativeView",
      designed: "DesignedView",
    };

    // Fallback to a default template if type not found
    const templateName = templateMap[resume.templateType] || "SimpleView";

    // Render the correct EJS file
    res.render(`./resume/${templateName}`, { resume });

  } catch (err) {

    console.error("❌ Error viewing resume:", err);
    res.status(500).send("Error retrieving resume");

  }

}

module.exports.savepostroute = async (req, res) => {

  try {
    const { fullName, email, phone, summary, education , experience , skills , projects , role, templateType } = req.body;

    const newResume = new Resume({
      user: req.user._id, // from session/passport
      fullName,
      email,
      phone,
      summary,
      education,
      experience,
      skills, 
      projects,
      role,
      templateType,
    });

    // Save image path if uploaded
    if (req.file) {
      newResume.profileImage = req.file.secure_url || req.file.url || req.file.path || req.file.filename || '';
    }

    await newResume.save();

    console.log("File uploaded:", req.file);
    console.log("✅ Resume saved successfully:", newResume);
    req.flash( "success" , "Resume saved successfully" ) ;

    res.redirect(`/resume/view/${newResume._id}`);
  } catch (error) {
    console.error(error);

    const template = req.body.templateType || "classic";

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log("Validation errors (will be flashed):", messages);

      // store each message as its own flash entry
      messages.forEach(msg => req.flash("error", msg));

      // DEBUG: inspect raw connect-flash storage in the session (this does NOT consume)
      console.log("RAW session flash AFTER setting:", req.session && req.session.flash);

      return res.redirect(`/build/${template}`);
    }
    req.flash("error", "Something went wrong while saving the resume.");
    return res.redirect(`/build/${template}`);
  }
}

module.exports.downloadresume = async (req, res) => {

  try {

    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).send("Resume not found");
    }

    // Map template type to EJS view file
    const templateMap = {
      simple: "SimpleView",
      modern: "ModernView",
      classic: "ClassicView",
      creative: "CreativeView",
      designed: "DesignedView",
    };

    const templateName = templateMap[resume.templateType] || "SimpleView" ;

     // ✅ Convert relative image path to absolute file:// URL for Puppeteer

    if (resume.profileImage && !resume.profileImage.startsWith("http")) {
      resume.profileImage = `${req.protocol}://${req.get("host")}${resume.profileImage}`;
    }

    console.log("🖼️  Profile Image Path for Puppeteer:", resume.profileImage);

    // Render EJS into HTML string (use Promise-based version)
    const html = await new Promise((resolve, reject) => {
      res.render(`./resume/${templateName}`, { resume }, (err, html) => {
        if (err) reject(err);
        else resolve(html);
      });
    });

    // ✅ Launch Puppeteer (Render / Docker friendly)
    const browser = await puppeteer.launch({
      headless: true, // or "new" for latest puppeteer versions
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, // set in Dockerfile
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    // ✅ Load HTML content
    await page.setContent(html, { waitUntil: "networkidle0" });

    // ✅ Apply CSS file dynamically
    const cssPath = path.join(__dirname, ".." , "public", "CSS", `${resume.templateType}.css`);
    try {
      await page.addStyleTag({ path: cssPath });
    } catch (err) {
      console.warn("⚠️ CSS file not found for template:", resume.templateType);
    }

    // ✅ Generate the PDF
    const pdfBuffer = await page.pdf({
      format: 'A4' ,
      printBackground: true,
      preferCSSPageSize: true, // use your CSS size
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    await browser.close();

    // ✅ Send the file as a download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.fullName}_Resume.pdf"`,
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
}