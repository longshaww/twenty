import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';

export enum CalendarEventRecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

registerEnumType(CalendarEventRecurrenceFrequency, {
  name: 'CalendarEventRecurrenceFrequency',
  description: 'How often a created calendar event repeats',
});

@InputType()
export class CalendarEventRecurrenceInput {
  @Field(() => CalendarEventRecurrenceFrequency)
  frequency: CalendarEventRecurrenceFrequency;

  // Every occurrence by default: every week, every month, every day.
  @Field(() => Int, { nullable: true })
  interval?: number;

  // An ISO date, inclusive. Mutually exclusive with occurrenceCount; with
  // neither, the series has no end.
  @Field(() => String, { nullable: true })
  until?: string;

  @Field(() => Int, { nullable: true })
  occurrenceCount?: number;
}
