import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "WorkComposer — Time tracking that runs quietly in the background",
  description:
    "WorkComposer runs quietly in the background, logging focused time, app usage, and idle gaps.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,

            style: {
              background: "#ffffff",
              color: "#111827",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: "500",
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
              maxWidth: "360px",
            },

            success: {
              style: {
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
              },
              iconTheme: {
                primary: "#16a34a",
                secondary: "#ffffff",
              },
            },

            error: {
              style: {
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
              },
              iconTheme: {
                primary: "#dc2626",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
