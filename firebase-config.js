/* PBD Wallet — ค่าเชื่อมต่อ Firebase (ใช้ส่งแจ้งเตือน "เงินเข้าแล้ว")
 * ค่าในไฟล์นี้เปิดเผยได้ (เป็นค่าสาธารณะของเว็บแอป) — ห้ามใส่ไฟล์ service account ที่นี่
 * ได้จาก Firebase console › Project settings › General › Your apps (Web) › SDK setup and configuration › Config
 * vapidKey: Project settings › Cloud Messaging › Web Push certificates › Key pair
 * ยังไม่กรอก (null) = ปิดแจ้งเตือนบนหน้าจอ แต่เสียงในแอปยังทำงาน */
self.PBD_FIREBASE = null;
/* ตัวอย่างเมื่อกรอกแล้ว:
self.PBD_FIREBASE = {
  config: { apiKey: '...', authDomain: '....firebaseapp.com', projectId: '...', storageBucket: '....appspot.com', messagingSenderId: '...', appId: '...' },
  vapidKey: '...'
};
*/
/* เสียงแจ้งเตือน: วางไฟล์เสียงของคุณทับ sounds/cash.mp3
 * SOUND_SAYS_MONEY_IN = true ถ้าไฟล์เสียงพูดคำว่า "เงินเข้าแล้ว" อยู่แล้ว → ระบบพูดต่อแค่ "590 บาท" */
self.PBD_SOUND = { url: 'sounds/cash.mp3', SOUND_SAYS_MONEY_IN: true, speak: true };
