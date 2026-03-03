import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./providers/auth";
import View from "./pages";
import { Toaster } from "react-hot-toast";
import { NavigatorProvider } from "./providers/navigator";
import { Analytics } from "@vercel/analytics/react";

// import { Cloudinary } from "@cloudinary/url-gen";
// import { auto } from "@cloudinary/url-gen/actions/resize";
// import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
// import { AdvancedImage } from "@cloudinary/react";

// const App = () => {
//   const cld = new Cloudinary({ cloud: { cloudName: "daobntyyx" } });

//   // Use this sample image or upload your own via the Media Library
//   const img = cld
//     .image("cld-sample-5")
//     .format("auto") // Optimize delivery by resizing and applying auto-format and auto-quality
//     .quality("auto")
//     .resize(auto().gravity(autoGravity()).width(500).height(500)); // Transform the image: auto-crop to square aspect_ratio

//   return <AdvancedImage cldImg={img} />;
// };

// export default App;

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AuthProvider>
        <NavigatorProvider>
          <Navbar />
          <View />
          <Footer />
          <Toaster />
        </NavigatorProvider>
      </AuthProvider>
      <Analytics />
    </div>
  );
};

export default App;
