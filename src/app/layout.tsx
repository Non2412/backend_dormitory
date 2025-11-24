import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backend Dormitory API",
  description: "RESTful API for dormitory management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
