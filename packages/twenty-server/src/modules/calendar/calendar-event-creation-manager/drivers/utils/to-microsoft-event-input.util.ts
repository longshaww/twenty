import {
  type DayOfWeek,
  type Event,
  type PatternedRecurrence,
  type RecurrencePatternType,
} from '@microsoft/microsoft-graph-types';

import {
  CalendarEventRecurrenceFrequency,
  type CalendarEventRecurrenceInput,
} from 'src/modules/calendar/calendar-event-creation-manager/dtos/calendar-event-recurrence.input';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';

const RECURRENCE_PATTERN_TYPE_BY_FREQUENCY: Record<
  CalendarEventRecurrenceFrequency,
  RecurrencePatternType
> = {
  [CalendarEventRecurrenceFrequency.DAILY]: 'daily',
  [CalendarEventRecurrenceFrequency.WEEKLY]: 'weekly',
  [CalendarEventRecurrenceFrequency.MONTHLY]: 'absoluteMonthly',
};

const DAYS_OF_WEEK: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

// Microsoft Graph interprets `dateTime` as a wall-clock time in the supplied
// `timeZone` and ignores any embedded offset, so an absolute instant must be
// converted to its wall-clock representation in the event time zone.
const toWallClockInTimeZone = (
  isoInstant: string,
  timeZone: string,
): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(isoInstant));

  const part = (type: string) =>
    parts.find((candidate) => candidate.type === type)?.value ?? '00';

  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}`;
};

// All-day events are timezone-agnostic dates pinned to midnight; timed events are
// absolute instants expressed as wall-clock in the event time zone.
const toMicrosoftEventDateTime = (
  isoDateTime: string,
  isFullDay: boolean,
  timeZone: string,
) => ({
  dateTime: isFullDay
    ? `${isoDateTime.slice(0, 10)}T00:00:00`
    : toWallClockInTimeZone(isoDateTime, timeZone),
  timeZone,
});

// Graph refuses the request unless `range.startDate` is the event's start date
// as it reads in the event's own time zone, so it is taken from the same
// wall-clock conversion the start and end use rather than from the UTC instant.
// A weekly pattern must also name its days: Graph does not infer them from the
// start date, so "every week at this time" has to say which day that is.
const toMicrosoftRecurrence = (
  recurrence: CalendarEventRecurrenceInput,
  startsAt: string,
  isFullDay: boolean,
  timeZone: string,
): PatternedRecurrence => {
  const localStart = toMicrosoftEventDateTime(
    startsAt,
    isFullDay,
    timeZone,
  ).dateTime;
  const startDate = localStart.slice(0, 10);

  const pattern: PatternedRecurrence['pattern'] = {
    type: RECURRENCE_PATTERN_TYPE_BY_FREQUENCY[recurrence.frequency],
    interval: recurrence.interval ?? 1,
  };

  if (recurrence.frequency === CalendarEventRecurrenceFrequency.WEEKLY) {
    pattern.daysOfWeek = [
      DAYS_OF_WEEK[new Date(`${startDate}T00:00:00Z`).getUTCDay()],
    ];
  }

  if (recurrence.frequency === CalendarEventRecurrenceFrequency.MONTHLY) {
    pattern.dayOfMonth = Number(startDate.slice(8, 10));
  }

  if (recurrence.until) {
    return {
      pattern,
      range: {
        type: 'endDate',
        startDate,
        endDate: recurrence.until.slice(0, 10),
        recurrenceTimeZone: timeZone,
      },
    };
  }

  if (recurrence.occurrenceCount) {
    return {
      pattern,
      range: {
        type: 'numbered',
        startDate,
        numberOfOccurrences: recurrence.occurrenceCount,
        recurrenceTimeZone: timeZone,
      },
    };
  }

  return {
    pattern,
    range: { type: 'noEnd', startDate, recurrenceTimeZone: timeZone },
  };
};

export const toMicrosoftEventInput = (input: CalendarEventToCreate): Event => {
  const event: Event = {
    subject: input.title,
    body: { contentType: 'text', content: input.description ?? '' },
    start: toMicrosoftEventDateTime(
      input.startsAt,
      input.isFullDay,
      input.timeZone,
    ),
    end: toMicrosoftEventDateTime(
      input.endsAt,
      input.isFullDay,
      input.timeZone,
    ),
    isAllDay: input.isFullDay,
  };

  if (input.location) {
    event.location = { displayName: input.location };
  }

  if (input.attendees.length > 0) {
    event.attendees = input.attendees.map((attendee) => ({
      emailAddress: { address: attendee.email, name: attendee.displayName },
      type: 'required',
    }));
  }

  if (input.addConferencing) {
    event.isOnlineMeeting = true;
    event.onlineMeetingProvider = 'teamsForBusiness';
  }

  if (input.recurrence) {
    event.recurrence = toMicrosoftRecurrence(
      input.recurrence,
      input.startsAt,
      input.isFullDay,
      input.timeZone,
    );
  }

  return event;
};
