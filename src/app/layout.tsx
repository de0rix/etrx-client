import { useId } from "react";
import Navbar from "./components/navbar";
import { Sidebar } from "./components/sidebar";
import "./globals.css";

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
    const sidebarId = useId();
    
    return (
        <html lang="en">
            <title>ETRX</title>
            <body>
                <Sidebar sidebarId={sidebarId}/>
                <Navbar/>
                {children}
            </body>
        </html>
    );
}
