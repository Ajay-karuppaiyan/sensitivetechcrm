const Preview = require("../models/Preview");
const sendEmail = require("../utils/sendEmail");

// ================= SAVE PREVIEW =================
const savePreview = async (req, res) => {
  try {
    const { clientInfo, requirements } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!requirements || Object.keys(requirements).length === 0) {
      return res.status(400).json({ error: "Requirements are required" });
    }

    if (!clientInfo?.name || !clientInfo?.phone || !clientInfo?.email) {
      return res.status(400).json({
        error: "Client name, phone and email are required",
      });
    }

    /* ---------- SAVE TO DB ---------- */
    const newPreview = new Preview({ clientInfo, requirements });
    await newPreview.save();

    /* ---------- HELPER: FORMAT ANY VALUE (RECURSIVE) ---------- */
    const formatValue = (value) => {
      if (value === undefined || value === null || value === "") return "N/A";
      if (Array.isArray(value)) return value.length ? value.join(", ") : "N/A";
      if (typeof value === "object") {
        // Convert nested objects to HTML list
        let html = "<ul>";
        Object.entries(value).forEach(([k, v]) => {
          html += `<li><b>${k}:</b> ${formatValue(v)}</li>`;
        });
        html += "</ul>";
        return html;
      }
      return value;
    };

    /* ---------- BUILD EMAIL HTML ---------- */
    let html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6">
        <h2>📌 Project Requirement Preview</h2>
        <hr/>
        <h3>👤 Client Information</h3>
        <p><b>Name:</b> ${clientInfo.name}</p>
        <p><b>Phone:</b> ${clientInfo.phone}</p>
        <p><b>Email:</b> ${clientInfo.email}</p>
        <p><b>Company:</b> ${clientInfo.company || "N/A"}</p>
        <p><b>Notes:</b> ${clientInfo.notes || "N/A"}</p>
        <hr/>
    `;

    /* ---------- RENDER STEPS 1–4 ---------- */
    Object.entries(requirements).forEach(([stepTitle, stepData]) => {
      if (stepTitle.includes("Step 5")) return; // skip Step 5 here

      html += `<h3>${stepTitle}</h3><ul>`;

      if (typeof stepData === "object" && !Array.isArray(stepData)) {
        Object.entries(stepData).forEach(([label, value]) => {
          html += `<li><b>${label}:</b> ${formatValue(value)}</li>`;
        });
      } else {
        html += `<li>${formatValue(stepData)}</li>`;
      }

      html += `</ul>`;
    });

    /* ================= STEP 5 – USER FLOW TABLE ================= */
    const step5 = requirements["Step 5 – User Flow Table"];
    html += `<h3>Step 5 – User Flow Table</h3>`;

    if (Array.isArray(step5) && step5.length > 0) {
      step5.forEach((table, i) => {
        html += `
          <h4>Table ${i + 1}</h4>
          <table border="1" cellpadding="6" cellspacing="0" width="100%" style="border-collapse:collapse">
            <tr style="background:#f1f5f9">
              <th>User Type</th>
              <th>Platform</th>
              <th>Operations</th>
              <th>Use Cases</th>
            </tr>
        `;
        table.forEach((row) => {
          html += `
            <tr>
              <td>${row.userType || "-"}</td>
              <td>${row.platform || "-"}</td>
              <td>${row.operations || "-"}</td>
              <td>${row.useCases || "-"}</td>
            </tr>
          `;
        });
        html += `</table><br/>`;
      });
    } else {
      html += `<p>No user flow data provided</p>`;
    }

    html += `</div>`;

    /* ---------- SEND EMAILS ---------- */
    await sendEmail({
      to: process.env.OFFICE_EMAIL,
      subject: "📌 New Project Requirement Submitted",
      html,
    });

    await sendEmail({
      to: clientInfo.email,
      subject: "📌 Your Project Requirement Details",
      html,
    });

    res.status(201).json({
      message: "Preview saved & emails sent successfully",
      data: newPreview,
    });

  } catch (err) {
    console.error("Preview Save Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================= GET ALL PREVIEWS =================
const getAllPreviews = async (req, res) => {
  try {
    const previews = await Preview.find().sort({ createdAt: -1 });
    res.status(200).json(previews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================= GET PREVIEW BY ID =================
const getPreviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const preview = await Preview.findById(id);

    if (!preview) {
      return res.status(404).json({
        error: "Preview not found",
      });
    }

    res.status(200).json(preview);
  } catch (err) {
    console.error("Get Preview By ID Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================= DELETE PREVIEW =================
const deletePreview = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Preview.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        error: "Preview not found",
      });
    }

    res.status(200).json({
      message: "Preview deleted successfully",
    });
  } catch (err) {
    console.error("Delete Preview Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = {
  savePreview,
  getAllPreviews,
  getPreviewById,
  deletePreview,
};
