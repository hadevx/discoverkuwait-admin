import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobiusBand() {
  const [dateTime, setDateTime] = useState<string>("");
  const [secondsAngle, setSecondsAngle] = useState<number>(0);
  const [minutesAngle, setMinutesAngle] = useState<number>(0);
  const [hoursAngle, setHoursAngle] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const romanNumerals = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  const location = "Kuwait City, Kuwait";
  const apiKey = "X7J2FZH4FREL4NNKEN6D9Z2FE";

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const weekdays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const dayName = weekdays[now.getDay()];

      let hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      setSecondsAngle(seconds * 6);
      setMinutesAngle(minutes * 6 + seconds * 0.1);
      setHoursAngle((hours % 12) * 30 + minutes * 0.5);

      const isPM = hours >= 12;
      const period = isPM ? "مساء" : "صباحا";
      hours = hours % 12 || 12;

      setDateTime(
        `اليوم ${dayName} الساعة ${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")} ${period}`
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    setLoading(true);
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
      location
    )}?unitGroup=metric&key=${apiKey}&contentType=json`;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw response;
        return response.json();
      })
      .then((data) => setWeather(data.currentConditions))
      .catch((errorResponse) => {
        if (errorResponse.text) {
          errorResponse.text().then((msg: any) => console.error("Error:", msg));
        } else {
          console.error("An unknown error occurred:", errorResponse);
        }
      })
      .finally(() => setLoading(false));
  }, [isModalOpen]);

  const getNumeralPosition = (angleDeg: number, radius: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const x = 50 + radius * Math.cos(angleRad);
    const y = 50 + radius * Math.sin(angleRad);
    return { x, y };
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          onClick={() => setIsModalOpen(true)}
          initial={{ y: -100, opacity: 0, scale: 0.5 }}
          animate={{ y: 10, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-40 cursor-pointer">
          <div
            dir="rtl"
            className="flex items-center gap-4 px-6 py-2 rounded-2xl shadow-xl 
                      backdrop-blur-md bg-black/70 border border-white/10
                      text-white min-w-[280px] max-w-[380px]">
            <svg className="w-12 h-12" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="white" />
              {romanNumerals.map((num, i) => {
                const angle = i * 30;
                const pos = getNumeralPosition(angle, 38);
                return (
                  <text
                    key={i}
                    x={pos.x}
                    y={pos.y + 3}
                    textAnchor="middle"
                    fontSize="7"
                    fill="black"
                    fontWeight="bold">
                    {num}
                  </text>
                );
              })}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="30"
                stroke="black"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${hoursAngle} 50 50)`}
              />
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="20"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${minutesAngle} 50 50)`}
              />
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="15"
                stroke="red"
                strokeWidth="1"
                strokeLinecap="round"
                transform={`rotate(${secondsAngle} 50 50)`}
              />
            </svg>
            <div className="flex flex-col text-right">
              <span className="font-semibold text-sm">مرحبا بعودتك</span>
              <span className="text-xs text-gray-300">{dateTime}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            dir="rtl"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : weather ? (
                <div className=" text-right space-y-3">
                  <h3 className="text-lg font-semibold mb-2">الطقس الحالي في الكويت</h3>
                  <div className="flex justify-between">
                    <span>درجة الحرارة:</span>
                    <span className="font-bold">{weather.temp}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الرطوبة:</span>
                    <span className="font-bold">{weather.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضغط الجوي:</span>
                    <span className="font-bold">{weather.pressure} hPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الرياح:</span>
                    <span className="font-bold">{weather.windspeed} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>وصف:</span>
                    <span className="font-bold capitalize">{weather.conditions}</span>
                  </div>
                </div>
              ) : (
                <p className="text-center py-10">تعذر جلب بيانات الطقس</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
