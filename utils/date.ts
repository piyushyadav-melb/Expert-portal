import { format, toZonedTime } from 'date-fns-tz';
import { enUS } from 'date-fns/locale';

export const dateWithDayNameDayMonthNameAndYear = () => {
  const date = new Date();

  // Days of the week
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[date.getDay()];

  // Months of the year
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = months[date.getMonth()];

  // Date
  const day = date.getDate();

  // Year
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
};

export const formatDate = (dateString: string, timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone, locale: any = navigator.language) => {
  const date = new Date(dateString);
  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, 'dd MMM yyyy h:mm:ss a', {
    timeZone: 'Europe/Paris',
    locale: enUS,
  });
};
