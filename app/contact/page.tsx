// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Mail, Phone, MapPin } from "lucide-react";

// export default function ContactPage() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     subject: "",
//     message: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setStatus(null);

//     try {
//       const response = await fetch("/api/contact", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       // const result = await response.json();

//       if (response.ok) {
//         setStatus("Your message has been sent successfully!");
//         setFormData({ name: "", email: "", subject: "", message: "" });
//       } else {
//         setStatus("Failed to send your message. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setStatus("An error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-20">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center mb-16"
//         >
//           <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Get in touch with us for any inquiries or support.
//           </p>
//         </motion.div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8 }}
//           >
//             <div className="bg-white rounded-lg p-8 shadow-lg">
//               <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
//               <form onSubmit={handleSubmit}>
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-medium mb-2">
//                       Your Name
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
//                       value={formData.name}
//                       onChange={(e) =>
//                         setFormData({ ...formData, name: e.target.value })
//                       }
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-2">
//                       Email Address
//                     </label>
//                     <input
//                       type="email"
//                       required
//                       className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
//                       value={formData.email}
//                       onChange={(e) =>
//                         setFormData({ ...formData, email: e.target.value })
//                       }
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-2">
//                       Subject
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
//                       value={formData.subject}
//                       onChange={(e) =>
//                         setFormData({ ...formData, subject: e.target.value })
//                       }
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-2">
//                       Message
//                     </label>
//                     <textarea
//                       required
//                       rows={4}
//                       className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
//                       value={formData.message}
//                       onChange={(e) =>
//                         setFormData({ ...formData, message: e.target.value })
//                       }
//                     />
//                   </div>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className={`w-full bg-primary text-white px-6 py-3 rounded-full ${
//                       loading
//                         ? "opacity-50 cursor-not-allowed"
//                         : "hover:bg-primary/90"
//                     }`}
//                   >
//                     {loading ? "Sending..." : "Send Message"}
//                   </button>
//                   {status && (
//                     <p
//                       className={`mt-4 text-center ${
//                         status.includes("successfully")
//                           ? "text-green-500"
//                           : "text-red-500"
//                       }`}
//                     >
//                       {status}
//                     </p>
//                   )}
//                 </div>
//               </form>
//             </div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8 }}
//           >
//             <div className="bg-white rounded-lg p-8 shadow-lg">
//               <h2 className="text-2xl font-semibold mb-6">
//                 Contact Information
//               </h2>
//               <div className="space-y-6">
//                 <div className="flex items-start gap-4">
//                   <MapPin className="w-6 h-6 text-primary mt-1" />
//                   <div>
//                     <h3 className="font-medium">Address</h3>
//                     <p className="text-gray-600">
//                       No. 128, Mani Nagar 2nd Street, Sivanandhapuram,
//                       Saravanampatti,
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-4">
//                   <Phone className="w-6 h-6 text-primary mt-1" />
//                   <div>
//                     <h3 className="font-medium">Phone</h3>
//                     <p className="text-gray-600">+91 99445 34098</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-4">
//                   <Mail className="w-6 h-6 text-primary mt-1" />
//                   <div>
//                     <h3 className="font-medium">Email</h3>
//                     <p className="text-gray-600">
//                       noreply@srivisawacharitabletrust.com
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "johndoe@example.com",
          message: "Hello, this is a test message!",
        }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border rounded w-full p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border rounded w-full p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="border rounded w-full p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </form>
      {status === "success" && (
        <p className="text-green-500 mt-4">Thank you for your message!</p>
      )}
      {status === "error" && (
        <p className="text-red-500 mt-4">
          There was an error. Please try again.
        </p>
      )}
    </div>
  );
}
