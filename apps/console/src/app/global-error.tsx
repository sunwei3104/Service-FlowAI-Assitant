'use client';

// Last-resort boundary (root layout failed): no providers/i18n/CSS are available here,
// so the text is static Thai and the markup is unstyled on purpose.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body>
        <main>
          <h1>เกิดข้อผิดพลาด</h1>
          <p>ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง</p>
          <button type="button" onClick={reset}>
            ลองอีกครั้ง
          </button>
        </main>
      </body>
    </html>
  );
}
