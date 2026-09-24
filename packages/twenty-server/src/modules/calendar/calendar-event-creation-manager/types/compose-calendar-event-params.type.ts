import { type CalendarEventRecurrenceInput } from 'src/modules/calendar/calendar-event-creation-manager/dtos/calendar-event-recurrence.input';

export type ComposeCalendarEventParams = {
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  isFullDay?: boolean;
  timeZone?: string;
  attendees?: string;
  sendInvitations?: boolean;
  addConferencing?: boolean;
  recurrence?: CalendarEventRecurrenceInput;
  connectedAccountId?: string;
};
