import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply theme respecting saved preference while defaulting to sophisticated dark grey
const savedTheme = localStorage.getItem('theme');
document.documentElement.classList.toggle('dark', savedTheme ? savedTheme === 'dark' : true);

createRoot(document.getElementById("root")!).render(<App />);
