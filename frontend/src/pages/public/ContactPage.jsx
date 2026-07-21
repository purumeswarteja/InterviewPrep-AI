import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Mail, MessageSquare, Phone, MapPin, Send } from "lucide-react";
import toast from "react-hot-toast";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import { Button } from "../../components/ui";
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };
  const contactInfo = [
    { icon: Mail, label: "Email", value: "hello@interprep.ai" },
    { icon: Phone, label: "Phone", value: "+1 (555) 012-3456" },
    { icon: MapPin, label: "Office", value: "San Francisco, CA" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-ink-50", children: [
    /* @__PURE__ */ jsx(PublicNavbar, {}),
    /* @__PURE__ */ jsxs("section", { className: "pt-32 pb-16 bg-white relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 mesh-bg opacity-50" }),
      /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-brand-600 uppercase tracking-wider", children: "Contact" }),
        /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-4xl sm:text-5xl text-ink-950 mt-2 leading-tight", children: "We'd love to hear from you" }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg text-ink-600 max-w-2xl mx-auto", children: "Questions, feedback, or just want to say hello? Drop us a message and we'll respond within 24 hours." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "py-16", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        contactInfo.map((c) => /* @__PURE__ */ jsxs("div", { className: "card-surface p-5 flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(c.icon, { className: "w-6 h-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500", children: c.label }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-ink-900", children: c.value })
          ] })
        ] }, c.label)),
        /* @__PURE__ */ jsxs("div", { className: "card-surface p-6", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "w-8 h-8 text-brand-500 mb-3" }),
          /* @__PURE__ */ jsx("h3", { className: "font-display font-semibold text-ink-900", children: "Help Center" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-500 mt-1", children: "Browse our knowledge base for quick answers to common questions." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "card-surface p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                required: true,
                value: form.name,
                onChange: (e) => setForm({ ...form, name: e.target.value }),
                className: "w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all",
                placeholder: "Jane Doe"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                required: true,
                type: "email",
                value: form.email,
                onChange: (e) => setForm({ ...form, email: e.target.value }),
                className: "w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all",
                placeholder: "jane@example.com"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Subject" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              required: true,
              value: form.subject,
              onChange: (e) => setForm({ ...form, subject: e.target.value }),
              className: "w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all",
              placeholder: "How can we help?"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink-700 mb-1.5", children: "Message" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              required: true,
              rows: 6,
              value: form.message,
              onChange: (e) => setForm({ ...form, message: e.target.value }),
              className: "w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all resize-none",
              placeholder: "Tell us more\u2026"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: sending, className: "mt-6 w-full sm:w-auto", children: sending ? /* @__PURE__ */ jsx(Fragment, { children: "Sending\u2026" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
          "Send Message"
        ] }) })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  ContactPage as default
};
