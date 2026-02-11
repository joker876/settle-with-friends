import { ArdDateInputDeserializeFn, ArdDateInputSerializeFn } from '@ardium-ui/ui';
import { format, parse } from 'date-fns';

export const DATE_SERIALIZATION_FN: ArdDateInputSerializeFn<Date> = date => (date ? format(date, `dd.MM.yyyy`) : '');
export const DATE_DESERIALIZATION_FN: ArdDateInputDeserializeFn<Date> = (dateString, prevValue) =>
{
  if (!/^\d\d?\.\d\d?\.(\d\d)?\d\d$/.test(dateString)) {
    return prevValue ?? null;
  }
  const [day, month, year] = dateString.split('.');

  dateString = `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year.length === 2 ? `20${year}` : year}`;

  return parse(dateString, `dd.MM.yyyy`, new Date());
}
