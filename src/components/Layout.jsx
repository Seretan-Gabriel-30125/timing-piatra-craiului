import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
return (
<div className="flex flex-col min-h-screen w-full">
<Header />
<main className="flex-grow w-full">{children}</main>
<Footer />
</div>
);
}