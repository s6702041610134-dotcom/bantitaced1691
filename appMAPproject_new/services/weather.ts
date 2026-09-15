export interface DailyForecast {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  conditionText: string;
  emoji: string;
  pop: number; // Probability of precipitation %
}

export interface HourlyForecast {
  timeStr: string; // e.g. "ตอนนี้", "13:00", "14:00"
  temp: number;
  weatherCode: number;
  conditionText: string;
  emoji: string;
  pop: number; // precipitation probability %
}

export interface PeriodForecast {
  periodName: string; // "เช้า", "บ่าย", "เย็น", "ดึก"
  timeRange: string;  // "(06:00 - 11:00)"
  emoji: string;
  temp: number;
  conditionText: string;
  pop: number;
}

export interface RealWeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  conditionText: string;
  emoji: string;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  periods: PeriodForecast[];
}

export function getWeatherCondition(code: number): { text: string; emoji: string } {
  if (code === 0) return { text: 'ท้องฟ้าแจ่มใส', emoji: '☀️' };
  if (code === 1) return { text: 'ท้องฟ้าโปร่ง', emoji: '🌤️' };
  if (code === 2) return { text: 'มีเมฆบางส่วน', emoji: '⛅' };
  if (code === 3) return { text: 'เมฆครึ้ม', emoji: '☁️' };
  if (code === 45 || code === 48) return { text: 'มีหมอกหนา', emoji: '🌫️' };
  if (code >= 51 && code <= 55) return { text: 'ฝนปรอยๆ', emoji: '🌧️' };
  if (code >= 61 && code <= 65) return { text: 'ฝนตกปานกลาง', emoji: '🌧️' };
  if (code >= 80 && code <= 82) return { text: 'ฝนซู่กระจาย', emoji: '🌦️' };
  if (code >= 95) return { text: 'พายุฝนฟ้าคะนอง', emoji: '🌩️' };
  return { text: 'แจ่มใส', emoji: '🌤️' };
}

export async function fetchRealWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<RealWeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FBangkok`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await res.json();
    const current = data.current || {};
    const dailyData = data.daily || {};
    const hourlyData = data.hourly || {};

    const currentCode = current.weather_code ?? 0;
    const cond = getWeatherCondition(currentCode);

    const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

    // 1. Parse Daily Forecast
    const daily: DailyForecast[] = (dailyData.time || []).slice(0, 7).map((tStr: string, idx: number) => {
      const d = new Date(tStr);
      const code = dailyData.weather_code?.[idx] ?? 0;
      const dayCond = getWeatherCondition(code);
      return {
        date: tStr,
        dayName: idx === 0 ? 'วันนี้' : dayNames[d.getDay()],
        maxTemp: Math.round(dailyData.temperature_2m_max?.[idx] ?? 32),
        minTemp: Math.round(dailyData.temperature_2m_min?.[idx] ?? 26),
        weatherCode: code,
        conditionText: dayCond.text,
        emoji: dayCond.emoji,
        pop: dailyData.precipitation_probability_max?.[idx] ?? 10,
      };
    });

    // 2. Parse 24-Hour Hourly Forecast
    const now = new Date();
    const currentHour = now.getHours();
    const hourlyTimes: string[] = hourlyData.time || [];
    const hourlyTemps: number[] = hourlyData.temperature_2m || [];
    const hourlyPops: number[] = hourlyData.precipitation_probability || [];
    const hourlyCodes: number[] = hourlyData.weather_code || [];

    let startIdx = hourlyTimes.findIndex((t: string) => {
      const d = new Date(t);
      return d.getHours() === currentHour;
    });
    if (startIdx === -1) startIdx = 0;

    const hourly: HourlyForecast[] = [];
    for (let i = startIdx; i < Math.min(startIdx + 24, hourlyTimes.length); i++) {
      const d = new Date(hourlyTimes[i]);
      const h = d.getHours();
      const code = hourlyCodes[i] ?? 0;
      const hCond = getWeatherCondition(code);
      const isNow = i === startIdx;
      hourly.push({
        timeStr: isNow ? 'ตอนนี้' : `${h.toString().padStart(2, '0')}:00`,
        temp: Math.round(hourlyTemps[i] ?? 30),
        weatherCode: code,
        conditionText: hCond.text,
        emoji: hCond.emoji,
        pop: Math.round(hourlyPops[i] ?? 0),
      });
    }

    // 3. Parse Time Period Summaries (เช้า, บ่าย, เย็น, ดึก)
    const periods: PeriodForecast[] = [
      {
        periodName: 'เช้า',
        timeRange: '06:00 - 11:00',
        emoji: '🌅',
        temp: Math.round(hourlyTemps[6] ?? 27),
        conditionText: getWeatherCondition(hourlyCodes[8] ?? 1).text,
        pop: Math.round(hourlyPops[8] ?? 10),
      },
      {
        periodName: 'บ่าย',
        timeRange: '12:00 - 16:00',
        emoji: '☀️',
        temp: Math.round(hourlyTemps[14] ?? 33),
        conditionText: getWeatherCondition(hourlyCodes[14] ?? 0).text,
        pop: Math.round(hourlyPops[14] ?? 20),
      },
      {
        periodName: 'เย็น',
        timeRange: '17:00 - 21:00',
        emoji: '🌇',
        temp: Math.round(hourlyTemps[18] ?? 29),
        conditionText: getWeatherCondition(hourlyCodes[18] ?? 2).text,
        pop: Math.round(hourlyPops[18] ?? 40),
      },
      {
        periodName: 'ดึก',
        timeRange: '22:00 - 05:00',
        emoji: '🌙',
        temp: Math.round(hourlyTemps[23] ?? 26),
        conditionText: getWeatherCondition(hourlyCodes[23] ?? 3).text,
        pop: Math.round(hourlyPops[23] ?? 15),
      },
    ];

    return {
      temperature: Math.round(current.temperature_2m ?? 32),
      humidity: current.relative_humidity_2m ?? 65,
      windSpeed: Math.round(current.wind_speed_10m ?? 10),
      weatherCode: currentCode,
      conditionText: cond.text,
      emoji: cond.emoji,
      daily,
      hourly,
      periods,
    };
  } catch (err) {
    // Fallback Mock Data with Hourly & Period info
    const fallbackHourly: HourlyForecast[] = Array.from({ length: 12 }).map((_, idx) => {
      const h = (new Date().getHours() + idx) % 24;
      return {
        timeStr: idx === 0 ? 'ตอนนี้' : `${h.toString().padStart(2, '0')}:00`,
        temp: 27 + (idx % 4),
        weatherCode: 2,
        conditionText: 'มีเมฆบางส่วน',
        emoji: idx % 3 === 0 ? '🌦️' : '⛅',
        pop: (idx * 15) % 80,
      };
    });

    const fallbackPeriods: PeriodForecast[] = [
      { periodName: 'เช้า', timeRange: '06:00 - 11:00', emoji: '🌅', temp: 26, conditionText: 'ท้องฟ้าโปร่ง', pop: 10 },
      { periodName: 'บ่าย', timeRange: '12:00 - 16:00', emoji: '☀️', temp: 33, conditionText: 'แดดจัด', pop: 20 },
      { periodName: 'เย็น', timeRange: '17:00 - 21:00', emoji: '🌇', temp: 29, conditionText: 'ฝนซู่กระจาย', pop: 60 },
      { periodName: 'ดึก', timeRange: '22:00 - 05:00', emoji: '🌙', temp: 25, conditionText: 'เมฆครึ้ม', pop: 15 },
    ];

    return {
      temperature: 27,
      humidity: 85,
      windSpeed: 5,
      weatherCode: 2,
      conditionText: 'เมฆครึ้ม',
      emoji: '☁️',
      daily: [
        { date: '2026-09-14', dayName: 'วันนี้', maxTemp: 30, minTemp: 25, weatherCode: 80, conditionText: 'ฝนซู่กระจาย', emoji: '🌦️', pop: 71 },
        { date: '2026-09-15', dayName: 'อ.', maxTemp: 31, minTemp: 26, weatherCode: 95, conditionText: 'พายุฝนฟ้าคะนอง', emoji: '🌩️', pop: 99 },
        { date: '2026-09-16', dayName: 'พ.', maxTemp: 32, minTemp: 26, weatherCode: 95, conditionText: 'พายุฝนฟ้าคะนอง', emoji: '🌩️', pop: 95 },
        { date: '2026-09-17', dayName: 'พฤ.', maxTemp: 31, minTemp: 25, weatherCode: 80, conditionText: 'ฝนซู่กระจาย', emoji: '🌦️', pop: 80 },
        { date: '2026-09-18', dayName: 'ศ.', maxTemp: 32, minTemp: 25, weatherCode: 95, conditionText: 'พายุฝนฟ้าคะนอง', emoji: '🌩️', pop: 90 },
        { date: '2026-09-19', dayName: 'ส.', maxTemp: 31, minTemp: 25, weatherCode: 80, conditionText: 'ฝนซู่กระจาย', emoji: '🌦️', pop: 75 },
        { date: '2026-09-20', dayName: 'อา.', maxTemp: 32, minTemp: 26, weatherCode: 1, conditionText: 'ท้องฟ้าโปร่ง', emoji: '🌤️', pop: 20 },
      ],
      hourly: fallbackHourly,
      periods: fallbackPeriods,
    };
  }
}
