// server/src/utils/sendEmail.ts

export const sendEmail = async (to: string, subject: string, html: string) => {
  // در محیط توسعه فقط لاگ می‌گیریم
  console.log("📧 ===== EMAIL WOULD BE SENT ===== 📧");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("HTML:", html);
  console.log("📧 ============================== 📧");

  // در محیط واقعی، nodemailer رو اینجا فعال کن
  return true;
};
