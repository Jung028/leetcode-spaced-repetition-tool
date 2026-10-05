const RACE_CALENDAR_SHEET_ID = "14n8VyEUtCx-5EKTEbKMSBeouUVOVry0BIs6XJhwzSV0";
const RACE_CALENDAR_SHEET_URL = `https://docs.google.com/spreadsheets/d/${RACE_CALENDAR_SHEET_ID}/edit?usp=sharing`;

export default function RaceCalendarEmbed() {
  return (
    <div className="race-calendar-embed">
      <p className="broader-view-note">
        <a href={RACE_CALENDAR_SHEET_URL} target="_blank" rel="noreferrer">
          Open the race calendar in a new tab (Google Sheets)
        </a>
      </p>
      <iframe
        title="Race calendar"
        src={`https://docs.google.com/spreadsheets/d/${RACE_CALENDAR_SHEET_ID}/preview`}
      />
    </div>
  );
}
