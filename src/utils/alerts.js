// دالة للرسائل الحمراء (خطأ)
export const DangerMsg = (title, message) => {
  // هنا تستعمل مكتبتك (مثلاً SweetAlert أو Toast) أو مجرد alert
  alert(`❌ ${title}: ${message}`);
};

// دالة للرسائل الخضراء (نجاح)
export const SuccessMsg = (title, message) => {
  alert(`✅ ${title}: ${message}`);
};
