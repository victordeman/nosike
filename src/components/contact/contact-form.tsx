"use client";

import { useRef, useState, type FormEvent } from "react";
import { ENQUIRY_TYPES, contactSchema, type EnquiryType } from "@/lib/contact-schema";
import { Button } from "@/components/ui";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "border-line bg-surface text-ink focus-visible:border-accent w-full rounded-md border px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
const labelClass = "text-ink mb-1 block text-sm font-medium";
const errorClass = "text-danger mt-1 text-sm";

export function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    organisation: "",
    enquiryType: "" as EnquiryType | "",
    message: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  // First-interaction timestamp for the server-side minimum-fill-time check.
  // Set on change events only (never during render, which prerendering forbids).
  const startedAtRef = useRef<number | null>(null);
  function markStart() {
    if (startedAtRef.current === null) startedAtRef.current = Date.now();
  }

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = contactSchema.safeParse({
      name: values.name,
      email: values.email,
      organisation: values.organisation,
      enquiryType: values.enquiryType,
      message: values.message,
      consent: values.consent,
      website: "",
      // No interaction at all (programmatic submit) → "now", which the server rejects as too fast.
      startedAt: startedAtRef.current ?? Date.now(),
    });
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fields[key]) fields[key] = issue.message;
      }
      setErrors(fields);
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        setStatus("success");
        setValues({ name: "", email: "", organisation: "", enquiryType: "" as EnquiryType | "", message: "", consent: false });
        return;
      }
      const body = (await res.json().catch(() => null)) as { fields?: Record<string, string> } | null;
      if (res.status === 400 && body?.fields && Object.keys(body.fields).length > 0) {
        setErrors(body.fields);
        setFormError("Please correct the highlighted fields and try again.");
      } else if (res.status === 429) {
        setFormError("Too many messages from this connection. Please try again later.");
      } else {
        setFormError("Your message could not be sent. Please try again in a moment.");
      }
      setStatus("error");
    } catch {
      setFormError("Your message could not be sent. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="border-line bg-surface rounded-card border p-6">
        <h2 className="text-xl font-semibold">Message sent</h2>
        <p className="text-ink-muted mt-2">
          Thank you for getting in touch. A member of the team will reply as soon as possible.
        </p>
        <Button className="mt-4" variant="secondary" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onChange={markStart} noValidate className="space-y-5">
      {formError ? (
        <p role="alert" className={`${errorClass} font-medium`}>
          {formError}
        </p>
      ) : null}

      {/* Honeypot: invisible to humans, filled by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value=""
          onChange={() => undefined}
        />
      </div>

      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className={inputClass}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name ? (
          <p id="contact-name-error" className={errorClass}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        {errors.email ? (
          <p id="contact-email-error" className={errorClass}>
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-organisation" className={labelClass}>
          Organisation <span className="text-ink-muted font-normal">(optional)</span>
        </label>
        <input
          id="contact-organisation"
          name="organisation"
          type="text"
          autoComplete="organization"
          className={inputClass}
          value={values.organisation}
          onChange={(e) => set("organisation", e.target.value)}
          aria-invalid={!!errors.organisation}
          aria-describedby={errors.organisation ? "contact-organisation-error" : undefined}
        />
        {errors.organisation ? (
          <p id="contact-organisation-error" className={errorClass}>
            {errors.organisation}
          </p>
        ) : null}
      </div>

      <fieldset>
        <legend className={labelClass}>Enquiry type</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ENQUIRY_TYPES.map((type) => (
            <label
              key={type}
              className={`border-line has-checked:border-accent has-checked:bg-accent/5 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                errors.enquiryType ? "border-danger" : ""
              }`}
            >
              <input
                type="radio"
                name="enquiryType"
                value={type}
                checked={values.enquiryType === type}
                onChange={() => set("enquiryType", type)}
                className="accent-accent"
              />
              {type}
            </label>
          ))}
        </div>
        {errors.enquiryType ? (
          <p className={errorClass}>{errors.enquiryType}</p>
        ) : null}
      </fieldset>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          className={inputClass}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message ? (
          <p id="contact-message-error" className={errorClass}>
            {errors.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-ink flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="accent-accent mt-1"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? "contact-consent-error" : undefined}
          />
          <span>
            I agree to be contacted about this enquiry. Your details are used only to respond to you and are
            never published.
          </span>
        </label>
        {errors.consent ? (
          <p id="contact-consent-error" className={errorClass}>
            {errors.consent}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
