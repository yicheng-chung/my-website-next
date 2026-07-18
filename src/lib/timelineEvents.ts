export interface TimelineEvent {
  id: string;
  year: number;
  month?: number; // 1-12, optional — omit when only the year is known
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  location: {
    lat: number;
    lng: number;
    zoom?: number;
  };
  image?: string;
}

const MONTH_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Compact label for map nodes, e.g. "2016" or "2016.8"
export function formatEventShort(event: TimelineEvent): string {
  return event.month ? `${event.year}.${event.month}` : `${event.year}`;
}

// Full label for detail cards, e.g. "2016年8月" / "Aug 2016"
export function formatEventFull(event: TimelineEvent, lang: "zh" | "en"): string {
  if (!event.month) return `${event.year}`;
  return lang === "zh" ? `${event.year}年${event.month}月` : `${MONTH_EN[event.month - 1]} ${event.year}`;
}

// Real events, in chronological order. Add more by inserting objects here —
// layout and map behavior pick them up automatically.
export const timelineEvents: TimelineEvent[] = [
  {
    id: "birth-1996",
    year: 1996,
    month: 8,
    title: { zh: "出生", en: "Born" },
    description: {
      zh: "出生於台灣林口。",
      en: "Born in Linkou, Taiwan.",
    },
    location: { lat: 25.079, lng: 121.3881, zoom: 12 },
  },
  {
    id: "usa-2014-08",
    year: 2014,
    month: 8,
    title: { zh: "美國旅行", en: "Trip to the States" },
    description: {
      zh: "高中畢業後，到美國加州旅行一個月。",
      en: "Travle to CA for a month after high school graduation.",
    },
    location: { lat: 33.6694, lng: -117.8231, zoom: 12 },
  },
  {
    id: "nccu-2014",
    year: 2014,
    month: 9,
    title: { zh: "到台北就讀政治大學", en: "Moved to Taipei for NCCU" },
    description: {
      zh: "考上國立政治大學，從桃園北上到台北念書，就讀資訊管理與廣播電視學系。",
      en: "Admitted to National ChengChi University, moving to Taipei to study — later double-majoring in MIS and Broadcast & Television.",
    },
    location: { lat: 24.9873, lng: 121.5762, zoom: 14 },
  },
  {
    id: "japan-2015-08",
    year: 2015,
    month: 8,
    title: { zh: "第一次到日本旅行", en: "First trip to Japan" },
    description: {
      zh: "第一次的日本旅行，去了東京。",
      en: "His first trip to Tokyo, Japan.",
    },
    location: { lat: 35.6812, lng: 139.7671, zoom: 9 },
  },
  {
    id: "netherlands-2016-08",
    year: 2016,
    month: 8,
    title: { zh: "落地荷蘭，展開歐洲打工度假", en: "Landed in the Netherlands" },
    description: {
      zh: "兩個月歐洲打工度假的第一站，首先將落在阿姆斯特丹。",
      en: "First stop of a two-month European working holiday: Amsterdam.",
    },
    location: { lat: 52.3676, lng: 4.9041, zoom: 12 },
  },
  {
    id: "denmark-2016",
    year: 2016,
    month: 8,
    title: { zh: "丹麥・法伊島", en: "Fejø, Denmark" },
    description: {
      zh: "在丹麥法伊島待了兩週。",
      en: "Spent two weeks on the Danish island of Fejø.",
    },
    location: { lat: 54.9488, lng: 11.4233, zoom: 11 },
  },
  {
    id: "germany-2016",
    year: 2016,
    month: 8,
    title: { zh: "德國・Großburgwedel", en: "Großburgwedel, Germany" },
    description: {
      zh: "接著到德國 Großburgwedel 工作兩週。",
      en: "Then worked two weeks in Großburgwedel, Germany.",
    },
    location: { lat: 52.4915, lng: 9.8562, zoom: 13 },
  },
  {
    id: "spain-2016",
    year: 2016,
    month: 9,
    title: { zh: "西班牙・馬塔羅", en: "Mataró, Spain" },
    description: {
      zh: "最後在西班牙馬塔羅工作兩週，結束這趟兩個月的旅程。",
      en: "Finished the two-month trip with two weeks working in Mataró, Spain.",
    },
    location: { lat: 41.5381, lng: 2.4447, zoom: 13 },
  },
  {
    id: "graduation-2020-01",
    year: 2020,
    month: 1,
    title: { zh: "從政治大學畢業", en: "Graduated from NCCU" },
    description: {
      zh: "完成政治大學的學業，畢業。",
      en: "Graduated from National ChengChi University.",
    },
    location: { lat: 24.9873, lng: 121.5762, zoom: 14 },
  },
  {
    id: "first-job-2021",
    year: 2021,
    title: { zh: "第一份軟體工程師工作", en: "First software engineering job" },
    description: {
      zh: "在內湖開始第一份軟體工程師工作。",
      en: "Started his first software engineering job, based in Neihu, Taipei.",
    },
    location: { lat: 25.0801, lng: 121.5752, zoom: 13 },
  },
  {
    id: "remote-berlin-2023",
    year: 2023,
    title: { zh: "開始全遠端工作", en: "Started working fully remote" },
    description: {
      zh: "加入一間德國外商，開始全遠端工作。",
      en: "Joined a German company and began working fully remote.",
    },
    location: { lat: 52.52, lng: 13.405, zoom: 11 },
  },
  {
    id: "last-frontend-job-2024",
    year: 2024,
    title: { zh: "最後一份前端工程師工作", en: "Last front-end engineering job" },
    description: {
      zh: "在南京復興站附近開始最後一份前端工程師工作。",
      en: "Started his last front-end engineering role, near Nanjing Fuxing Station.",
    },
    location: { lat: 25.0519, lng: 121.5439, zoom: 14 },
  },
  {
    id: "resign-2025-06",
    year: 2025,
    month: 6,
    title: { zh: "辭職，決定不再當工程師", en: "Resigned, decided to leave engineering" },
    description: {
      zh: "辭職，決定不再走工程師這條路。",
      en: "Resigned, deciding to stop working as an engineer.",
    },
    location: { lat: 25.0519, lng: 121.5439, zoom: 14 },
  },
  {
    id: "decide-counseling-2025-09",
    year: 2025,
    month: 9,
    title: { zh: "決定考心輔研究所", en: "Decided to pursue counseling psychology" },
    description: {
      zh: "決定準備研究所考試，朝心理師的方向前進。",
      en: "Decided to prepare for graduate school, aiming to become a therapist.",
    },
    location: { lat: 25.033, lng: 121.5654, zoom: 11 },
  },
  {
    id: "move-taoyuan-2026-02",
    year: 2026,
    month: 2,
    title: { zh: "搬回桃園", en: "Moved back to Taoyuan" },
    description: {
      zh: "結束在大台北地區十一年的生活，搬回桃園老家。",
      en: "After eleven years in the greater Taipei area, moved back to his hometown of Taoyuan.",
    },
    location: { lat: 24.9936, lng: 121.301, zoom: 13 },
  },
  {
    id: "admitted-ntue-2026-03",
    year: 2026,
    month: 3,
    title: { zh: "考上國北教大心理與諮商研究所", en: "Admitted to NTUE's counseling program" },
    description: {
      zh: "確定考上國立台北教育大學心理與諮商學系研究所。",
      en: "Confirmed admission to the Graduate Institute of Psychology and Counseling at National Taipei University of Education.",
    },
    location: { lat: 25.0246, lng: 121.5446, zoom: 14 },
  },
  {
    id: "australia-2026-09",
    year: 2026,
    month: 9,
    title: { zh: "休學一年，到澳洲打工度假", en: "Deferred enrollment for a working holiday in Australia" },
    description: {
      zh: "決定休學延後一年入學，先到澳洲打工度假。",
      en: "Decided to defer enrollment by a year and go on a working holiday in Australia.",
    },
    location: { lat: -25.2744, lng: 133.7751, zoom: 3 },
  },
];
