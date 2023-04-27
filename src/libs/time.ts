function getTimeZoneOffset(date: Date, timeZone: string) {
  let iso = date
    .toLocaleString("en-CA", { timeZone, hour12: false })
    .replace(", ", "T");

  iso += "." + date.getMilliseconds().toString().padStart(3, "0");

  const lie = new Date(iso + "Z");

  return -(lie.getTime() - date.getTime()) / 60 / 60 / 1000;
}

export function getTimeInfo(targetTimezone: string) {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();

  const browserTime = now.toLocaleString(undefined, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone: browserTimezone,
  });
  const targetTime = now.toLocaleString(undefined, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone: targetTimezone,
  });

  const timeDiff =
    getTimeZoneOffset(now, browserTimezone) -
    getTimeZoneOffset(now, targetTimezone);

  return { browserTime, targetTime, timeDiff };
}

export function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
