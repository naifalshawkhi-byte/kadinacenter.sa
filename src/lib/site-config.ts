/** رقم العيادة الرسمي — يُعرض في كل أنحاء الموقع */
export const CLINIC_PHONE = "+966114555444";

/** رابط دخول الموظفين — غير ظاهر للزبائن */
export const STAFF_LOGIN_PATH = "/staff-portal";

export function formatPhoneDisplay(phone: string): string {
  return phone.trim() || CLINIC_PHONE;
}

export function phoneTelHref(phone: string): string {
  const digits = (phone || CLINIC_PHONE).replace(/\D/g, "");
  return `tel:+${digits.startsWith("966") ? digits : `966${digits.replace(/^0/, "")}`}`;
}
