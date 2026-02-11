import { ArdDateInputDeserializeFn, ArdDateInputSerializeFn } from '@ardium-ui/ui';
import { format, parse } from 'date-fns';

export const DATE_SERIALIZATION_FN: ArdDateInputSerializeFn<Date> = date => (date ? format(date, `dd.MM.yyyy`) : '');
export const DATE_DESERIALIZATION_FN: ArdDateInputDeserializeFn<Date> = dateString =>
  /^\d\d\.\d\d\.\d\d\d\d$/.test(dateString) ? parse(dateString, `dd.MM.yyyy`, new Date()) : null;