"use client";

const scheduleUrl = process.env.NEXT_PUBLIC_SCHEDULE_URL;
const fallbackScheduleUrl = "https://cal.com/victor-sizino/discovery?overlayCalendar=true";

export function ScheduleEmbed() {
  if (!scheduleUrl) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <p className="text-sm leading-6 text-muted">A agenda online ainda não foi configurada.</p>
        <a
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-violet px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          href={fallbackScheduleUrl}
          rel="noreferrer"
          target="_blank"
        >
          Agendar conversa
        </a>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <iframe
        className="h-[700px] min-h-[700px] w-full rounded-2xl border-0 md:h-full md:min-h-[620px]"
        loading="lazy"
        src={scheduleUrl}
        title="Agendar conversa com Victor Sizino"
      />
    </div>
  );
}
