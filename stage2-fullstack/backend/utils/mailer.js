const nodemailer = require('nodemailer');

const sendStatusUpdateEmail = async (studentEmail, complaintId, oldStatus, newStatus, remarks) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log(`[Email Mocked] To: ${studentEmail || 'Anonymous'}. Complaint ${complaintId} status changed from ${oldStatus} to ${newStatus}. Remarks: ${remarks || 'None'}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      }
    });

    const mailOptions = {
      from: `"Grievance360 | Vel Tech" <${user}>`,
      to: studentEmail,
      subject: `[Update] Grievance ${complaintId} status changed to ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0c2340; border-bottom: 2px solid #f2a900; padding-bottom: 10px;">Grievance360 Status Update</h2>
          <p>Dear Student,</p>
          <p>The status of your complaint <strong>${complaintId}</strong> has been updated by the administration.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold; width: 30%;">Previous Status:</td>
              <td style="padding: 10px;">${oldStatus}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; width: 30%;">Current Status:</td>
              <td style="padding: 10px; font-weight: bold; color: #1d70b8;">${newStatus}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold; width: 30%;">Admin Remarks:</td>
              <td style="padding: 10px;">${remarks || 'No remarks provided yet.'}</td>
            </tr>
          </table>

          <p>You can track the live progress of your complaint at any time on the track page using your unique ID.</p>
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0 15px 0;" />
          <p style="font-size: 0.8rem; color: #777777; text-align: center;">This is an automated notification. Please do not reply directly to this email.<br/>Designed & Developed by Varshith G S</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email notification sent: ${info.messageId}`);
  } catch (error) {
    console.error(`Failed to send email notification: ${error.message}`);
  }
};

module.exports = { sendStatusUpdateEmail };
