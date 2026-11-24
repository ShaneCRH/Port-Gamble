import { formatVenueDateTime } from "@/lib/dates";
import { SITE } from "@/content/site";

/**
 * Message templates. Copy is a first draft for Shane to approve; nothing goes out until
 * MESSAGING_MODE=auto is set with his sign-off.
 */

export type TemplateId =
  | "tour_confirmation_email"
  | "tour_confirmation_sms"
  | "tour_reminder_24h_email"
  | "tour_reminder_2h_sms"
  | "staff_new_tour";

export interface TemplateData {
  firstName: string;
  startsAt: string;
}

export interface Rendered {
  subject?: string;
  text: string;
}

export function render(template: TemplateId, data: TemplateData): Rendered {
  const when = formatVenueDateTime(new Date(data.startsAt));
  switch (template) {
    case "tour_confirmation_email":
      return {
        subject: `Your Port Gamble tour: ${when}`,
        text: [
          `Hi ${data.firstName},`,
          "",
          `You're booked for a tour of Port Gamble on ${when} (Pacific time). We'll meet you at the Hood Canal Vista Pavilion and walk over to St. Paul's together.`,
          "",
          `Parking is free. If you need to change the time, reply to this email or call ${SITE.phoneDisplay}.`,
          "",
          "See you soon,",
          "The Port Gamble Weddings team",
        ].join("\n"),
      };
    case "tour_confirmation_sms":
      return { text: `Port Gamble Weddings: you're booked for a tour ${when}. Reply STOP to opt out.` };
    case "tour_reminder_24h_email":
      return {
        subject: `See you tomorrow at Port Gamble`,
        text: `Hi ${data.firstName},\n\nA quick reminder that your tour is ${when}. Bring any questions, and your guest count if you have one.\n\nThe Port Gamble Weddings team`,
      };
    case "tour_reminder_2h_sms":
      return { text: `Port Gamble Weddings: see you at ${when} for your tour. Free parking at the Pavilion. Reply STOP to opt out.` };
    case "staff_new_tour":
      return { subject: `New tour booked: ${when}`, text: `A new tour was booked for ${when}. Open the admin view for details.` };
  }
}
