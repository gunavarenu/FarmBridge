import { useState, useEffect } from 'react'
import type { Language } from '../../types'
import { fetchMandiRates } from '../../services/mandiService'

interface MandiPriceData {
  mandiName: string
  mandiNameHi: string
  mandiNameMr: string
  distanceKm: number
  minPrice: number
  maxPrice: number
  modalPrice: number
  trend: 'up' | 'down' | 'stable'
  arrivalVolume: number
}

// ─── Comprehensive Fallback Mandi DB ─────────────────────────────────────────
const MANDI_DATA: Record<string, MandiPriceData[]> = {
  // ── Vegetables ──────────────────────────────────────────────────────────────
  onion: [
    { mandiName: 'Lasalgaon APMC (Nashik)', mandiNameHi: 'लासलगांव APMC', mandiNameMr: 'लासलगाव APMC', distanceKm: 185, minPrice: 2500, maxPrice: 3450, modalPrice: 3100, trend: 'up', arrivalVolume: 950 },
    { mandiName: 'Pune APMC (Hadapsar)',    mandiNameHi: 'पुणे APMC',       mandiNameMr: 'पुणे APMC',     distanceKm: 15,  minPrice: 2200, maxPrice: 3100, modalPrice: 2800, trend: 'up', arrivalVolume: 120 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 2400, maxPrice: 3300, modalPrice: 2950, trend: 'stable', arrivalVolume: 420 },
    { mandiName: 'Baramati APMC',           mandiNameHi: 'बारामती APMC',    mandiNameMr: 'बारामती APMC',   distanceKm: 75,  minPrice: 2100, maxPrice: 2800, modalPrice: 2600, trend: 'down', arrivalVolume: 85 },
    { mandiName: 'Ahmednagar APMC',         mandiNameHi: 'अहमदनगर APMC',   mandiNameMr: 'अहमदनगर APMC',  distanceKm: 120, minPrice: 2300, maxPrice: 3000, modalPrice: 2750, trend: 'stable', arrivalVolume: 160 },
    { mandiName: 'Amritsar Mandi',          mandiNameHi: 'अमृतसर मंडी',    mandiNameMr: 'अमृतसर मंडी',   distanceKm: 290, minPrice: 1800, maxPrice: 2800, modalPrice: 2300, trend: 'stable', arrivalVolume: 300 },
    { mandiName: 'Kurnool APMC',            mandiNameHi: 'कुर्नूल APMC',   mandiNameMr: 'कुर्नूल APMC',  distanceKm: 550, minPrice: 1600, maxPrice: 2600, modalPrice: 2100, trend: 'down', arrivalVolume: 200 },
  ],
  tomato: [
    { mandiName: 'Narayangaon APMC',        mandiNameHi: 'नारायणगांव APMC', mandiNameMr: 'नारायणगाव APMC', distanceKm: 82, minPrice: 1800, maxPrice: 2700, modalPrice: 2400, trend: 'up', arrivalVolume: 350 },
    { mandiName: 'Pune APMC (Hadapsar)',    mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15, minPrice: 1600, maxPrice: 2400, modalPrice: 2200, trend: 'up', arrivalVolume: 80 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 1900, maxPrice: 2600, modalPrice: 2350, trend: 'stable', arrivalVolume: 190 },
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 1500, maxPrice: 2200, modalPrice: 2000, trend: 'down', arrivalVolume: 140 },
    { mandiName: 'Bangalore APMC',          mandiNameHi: 'बेंगलुरु APMC',   mandiNameMr: 'बेंगळुरू APMC',  distanceKm: 840, minPrice: 2000, maxPrice: 3500, modalPrice: 2800, trend: 'up', arrivalVolume: 450 },
    { mandiName: 'Madanapalle APMC',        mandiNameHi: 'मदनपल्ले APMC',   mandiNameMr: 'मदनपल्ले APMC',  distanceKm: 700, minPrice: 1400, maxPrice: 2800, modalPrice: 2100, trend: 'stable', arrivalVolume: 280 },
    { mandiName: 'Ludhiana Mandi',          mandiNameHi: 'लुधियाना मंडी',   mandiNameMr: 'लुधियाना मंडी',  distanceKm: 1100, minPrice: 1500, maxPrice: 2700, modalPrice: 2100, trend: 'down', arrivalVolume: 160 },
    { mandiName: 'Koyambedu Mandi (TN)',    mandiNameHi: 'कोयम्बेडु मंडी',  mandiNameMr: 'कोयम्बेडु मंडी', distanceKm: 1200, minPrice: 1800, maxPrice: 3200, modalPrice: 2500, trend: 'up', arrivalVolume: 600 },
  ],
  potato: [
    { mandiName: 'Pune APMC (Hadapsar)',    mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 1400, maxPrice: 2000, modalPrice: 1800, trend: 'stable', arrivalVolume: 210 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 1600, maxPrice: 2200, modalPrice: 2000, trend: 'up', arrivalVolume: 340 },
    { mandiName: 'Manchar Mandi',           mandiNameHi: 'मंचर मंडी',       mandiNameMr: 'मंचर मंडी',      distanceKm: 62,  minPrice: 1300, maxPrice: 1900, modalPrice: 1700, trend: 'down', arrivalVolume: 90 },
    { mandiName: 'Satara APMC',             mandiNameHi: 'सातारा APMC',     mandiNameMr: 'सातारा APMC',    distanceKm: 110, minPrice: 1400, maxPrice: 1950, modalPrice: 1750, trend: 'stable', arrivalVolume: 65 },
    { mandiName: 'Agra Mandi (UP)',         mandiNameHi: 'आगरा मंडी',       mandiNameMr: 'आग्रा मंडी',     distanceKm: 1100, minPrice: 900, maxPrice: 1600, modalPrice: 1250, trend: 'down', arrivalVolume: 700 },
    { mandiName: 'Jalandhar Mandi',         mandiNameHi: 'जालंधर मंडी',    mandiNameMr: 'जालंधर मंडी',    distanceKm: 1350, minPrice: 1100, maxPrice: 1900, modalPrice: 1500, trend: 'stable', arrivalVolume: 500 },
  ],
  brinjal: [
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 600,  maxPrice: 1400, modalPrice: 900, trend: 'stable', arrivalVolume: 60 },
    { mandiName: 'Nashik Mandi',            mandiNameHi: 'नाशिक मंडी',      mandiNameMr: 'नाशिक मंडी',    distanceKm: 210, minPrice: 500,  maxPrice: 1200, modalPrice: 800, trend: 'down', arrivalVolume: 45 },
    { mandiName: 'Hosur Mandi (KA)',        mandiNameHi: 'होसूर मंडी',      mandiNameMr: 'होसूर मंडी',    distanceKm: 850, minPrice: 700,  maxPrice: 1600, modalPrice: 1100, trend: 'up', arrivalVolume: 120 },
    { mandiName: 'Guntur APMC (AP)',        mandiNameHi: 'गुंटूर APMC',     mandiNameMr: 'गुंटूर APMC',   distanceKm: 750, minPrice: 800,  maxPrice: 1800, modalPrice: 1300, trend: 'up', arrivalVolume: 200 },
    { mandiName: 'Kanpur Mandi (UP)',       mandiNameHi: 'कानपुर मंडी',     mandiNameMr: 'कानपुर मंडी',   distanceKm: 1000, minPrice: 400, maxPrice: 1100, modalPrice: 750, trend: 'down', arrivalVolume: 80 },
  ],
  cauliflower: [
    { mandiName: 'Mahabaleshwar Mandi',     mandiNameHi: 'महाबलेश्वर मंडी', mandiNameMr: 'महाबळेश्वर मंडी', distanceKm: 80, minPrice: 1500, maxPrice: 2500, modalPrice: 2000, trend: 'stable', arrivalVolume: 90 },
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 1200, maxPrice: 2200, modalPrice: 1700, trend: 'up', arrivalVolume: 140 },
    { mandiName: 'Amritsar Mandi',          mandiNameHi: 'अमृतसर मंडी',    mandiNameMr: 'अमृतसर मंडी',   distanceKm: 1100, minPrice: 1200, maxPrice: 2200, modalPrice: 1700, trend: 'up', arrivalVolume: 200 },
    { mandiName: 'Bangalore APMC',          mandiNameHi: 'बेंगलुरु APMC',   mandiNameMr: 'बेंगळुरू APMC',  distanceKm: 840, minPrice: 1300, maxPrice: 2400, modalPrice: 1800, trend: 'stable', arrivalVolume: 160 },
  ],
  cabbage: [
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 500,  maxPrice: 1200, modalPrice: 800, trend: 'down', arrivalVolume: 120 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 600,  maxPrice: 1300, modalPrice: 900, trend: 'stable', arrivalVolume: 80 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 700, maxPrice: 1400, modalPrice: 1000, trend: 'up', arrivalVolume: 140 },
    { mandiName: 'Hassan Mandi (KA)',       mandiNameHi: 'हसन मंडी',        mandiNameMr: 'हसन मंडी',       distanceKm: 820, minPrice: 500,  maxPrice: 1100, modalPrice: 750, trend: 'down', arrivalVolume: 90 },
  ],
  capsicum: [
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 1500, maxPrice: 3000, modalPrice: 2200, trend: 'up', arrivalVolume: 70 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 1700, maxPrice: 3500, modalPrice: 2500, trend: 'up', arrivalVolume: 55 },
    { mandiName: 'Ludhiana Mandi',          mandiNameHi: 'लुधियाना मंडी',   mandiNameMr: 'लुधियाना मंडी',  distanceKm: 1100, minPrice: 2000, maxPrice: 4000, modalPrice: 3000, trend: 'stable', arrivalVolume: 100 },
    { mandiName: 'Bangalore APMC',          mandiNameHi: 'बेंगलुरु APMC',   mandiNameMr: 'बेंगळुरू APMC',  distanceKm: 840, minPrice: 2200, maxPrice: 4500, modalPrice: 3200, trend: 'up', arrivalVolume: 120 },
  ],
  bhindi: [
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 1000, maxPrice: 2000, modalPrice: 1500, trend: 'stable', arrivalVolume: 50 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 1200, maxPrice: 2400, modalPrice: 1800, trend: 'up', arrivalVolume: 90 },
    { mandiName: 'Vadodara Mandi (GJ)',     mandiNameHi: 'वड़ोदरा मंडी',    mandiNameMr: 'वडोदरा मंडी',   distanceKm: 380, minPrice: 1100, maxPrice: 2200, modalPrice: 1600, trend: 'stable', arrivalVolume: 75 },
    { mandiName: 'Madurai Mandi (TN)',      mandiNameHi: 'मदुरई मंडी',      mandiNameMr: 'मदुराई मंडी',   distanceKm: 1300, minPrice: 1200, maxPrice: 2500, modalPrice: 1800, trend: 'up', arrivalVolume: 110 },
  ],
  'bitter gourd': [
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 1200, maxPrice: 2200, modalPrice: 1700, trend: 'stable', arrivalVolume: 40 },
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 1000, maxPrice: 2000, modalPrice: 1500, trend: 'down', arrivalVolume: 30 },
    { mandiName: 'Koyambedu Mandi (TN)',    mandiNameHi: 'कोयम्बेडु मंडी',  mandiNameMr: 'कोयम्बेडु मंडी', distanceKm: 1200, minPrice: 1400, maxPrice: 2800, modalPrice: 2000, trend: 'up', arrivalVolume: 65 },
  ],
  'bottle gourd': [
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 600,  maxPrice: 1400, modalPrice: 900, trend: 'down', arrivalVolume: 60 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 700,  maxPrice: 1500, modalPrice: 1000, trend: 'stable', arrivalVolume: 45 },
    { mandiName: 'Bangalore APMC',          mandiNameHi: 'बेंगलुरु APMC',   mandiNameMr: 'बेंगळुरू APMC',  distanceKm: 840, minPrice: 800,  maxPrice: 1600, modalPrice: 1100, trend: 'up', arrivalVolume: 70 },
  ],
  pumpkin: [
    { mandiName: 'Solapur APMC',            mandiNameHi: 'सोलापूर APMC',    mandiNameMr: 'सोलापूर APMC',   distanceKm: 240, minPrice: 400,  maxPrice: 1000, modalPrice: 700, trend: 'stable', arrivalVolume: 80 },
    { mandiName: 'Gorakhpur Mandi (UP)',    mandiNameHi: 'गोरखपुर मंडी',   mandiNameMr: 'गोरखपुर मंडी',  distanceKm: 1400, minPrice: 300, maxPrice: 900,  modalPrice: 600, trend: 'down', arrivalVolume: 120 },
    { mandiName: 'Koyambedu Mandi (TN)',    mandiNameHi: 'कोयम्बेडु मंडी',  mandiNameMr: 'कोयम्बेडु मंडी', distanceKm: 1200, minPrice: 500, maxPrice: 1200, modalPrice: 800, trend: 'up', arrivalVolume: 90 },
  ],
  carrot: [
    { mandiName: 'Mahabaleshwar Mandi',     mandiNameHi: 'महाबलेश्वर मंडी', mandiNameMr: 'महाबळेश्वर मंडी', distanceKm: 80, minPrice: 1000, maxPrice: 2000, modalPrice: 1500, trend: 'stable', arrivalVolume: 70 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 1100, maxPrice: 2100, modalPrice: 1600, trend: 'up', arrivalVolume: 55 },
    { mandiName: 'Ooty Mandi (TN)',         mandiNameHi: 'ऊटी मंडी',         mandiNameMr: 'ऊटी मंडी',       distanceKm: 1100, minPrice: 900, maxPrice: 1900, modalPrice: 1400, trend: 'down', arrivalVolume: 100 },
    { mandiName: 'Shimla Mandi (HP)',       mandiNameHi: 'शिमला मंडी',      mandiNameMr: 'शिमला मंडी',    distanceKm: 1600, minPrice: 1400, maxPrice: 2500, modalPrice: 2000, trend: 'up', arrivalVolume: 80 },
  ],
  spinach: [
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 800, maxPrice: 1600, modalPrice: 1200, trend: 'stable', arrivalVolume: 45 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 700,  maxPrice: 1500, modalPrice: 1100, trend: 'up', arrivalVolume: 35 },
    { mandiName: 'Ludhiana Mandi',          mandiNameHi: 'लुधियाना मंडी',   mandiNameMr: 'लुधियाना मंडी',  distanceKm: 1100, minPrice: 600, maxPrice: 1400, modalPrice: 1000, trend: 'down', arrivalVolume: 40 },
  ],
  peas: [
    { mandiName: 'Amritsar Mandi',          mandiNameHi: 'अमृतसर मंडी',    mandiNameMr: 'अमृतसर मंडी',   distanceKm: 1100, minPrice: 2000, maxPrice: 4500, modalPrice: 3000, trend: 'up', arrivalVolume: 200 },
    { mandiName: 'Hisar Mandi (HR)',        mandiNameHi: 'हिसार मंडी',     mandiNameMr: 'हिसार मंडी',    distanceKm: 1200, minPrice: 2200, maxPrice: 5000, modalPrice: 3500, trend: 'up', arrivalVolume: 280 },
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 1800, maxPrice: 4000, modalPrice: 2800, trend: 'stable', arrivalVolume: 120 },
    { mandiName: 'Shimla Mandi (HP)',       mandiNameHi: 'शिमला मंडी',      mandiNameMr: 'शिमला मंडी',    distanceKm: 1600, minPrice: 2500, maxPrice: 5500, modalPrice: 4000, trend: 'up', arrivalVolume: 160 },
  ],
  'green chilli': [
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 2000, maxPrice: 5000, modalPrice: 3500, trend: 'up', arrivalVolume: 80 },
    { mandiName: 'Ahmedabad Mandi (GJ)',    mandiNameHi: 'अहमदाबाद मंडी',  mandiNameMr: 'अहमदाबाद मंडी', distanceKm: 580, minPrice: 2500, maxPrice: 6000, modalPrice: 4000, trend: 'up', arrivalVolume: 160 },
    { mandiName: 'Guntur APMC (AP)',        mandiNameHi: 'गुंटूर APMC',     mandiNameMr: 'गुंटूर APMC',   distanceKm: 750, minPrice: 3000, maxPrice: 8000, modalPrice: 5500, trend: 'up', arrivalVolume: 320 },
  ],
  garlic: [
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 5000, maxPrice: 12000, modalPrice: 8000, trend: 'up', arrivalVolume: 80 },
    { mandiName: 'Mandsaur Mandi (MP)',     mandiNameHi: 'मंदसौर मंडी',    mandiNameMr: 'मंदसौर मंडी',   distanceKm: 700, minPrice: 6000, maxPrice: 14000, modalPrice: 9500, trend: 'up', arrivalVolume: 400 },
    { mandiName: 'Kota Mandi (RJ)',         mandiNameHi: 'कोटा मंडी',       mandiNameMr: 'कोटा मंडी',      distanceKm: 850, minPrice: 5500, maxPrice: 13000, modalPrice: 9000, trend: 'stable', arrivalVolume: 280 },
    { mandiName: 'Solapur APMC',            mandiNameHi: 'सोलापूर APMC',    mandiNameMr: 'सोलापूर APMC',   distanceKm: 240, minPrice: 4800, maxPrice: 11000, modalPrice: 7500, trend: 'down', arrivalVolume: 100 },
  ],
  ginger: [
    { mandiName: 'Satara APMC',             mandiNameHi: 'सातारा APMC',     mandiNameMr: 'सातारा APMC',    distanceKm: 110, minPrice: 4000, maxPrice: 9000, modalPrice: 6000, trend: 'stable', arrivalVolume: 60 },
    { mandiName: 'Erode Mandi (TN)',        mandiNameHi: 'इरोड मंडी',       mandiNameMr: 'इरोड मंडी',      distanceKm: 1100, minPrice: 5000, maxPrice: 12000, modalPrice: 8000, trend: 'up', arrivalVolume: 200 },
    { mandiName: 'Hinterland Mandi (KL)',   mandiNameHi: 'केरल मंडी',       mandiNameMr: 'केरळ मंडी',      distanceKm: 1500, minPrice: 5500, maxPrice: 13000, modalPrice: 9000, trend: 'up', arrivalVolume: 120 },
  ],
  coriander: [
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 2000, maxPrice: 5000, modalPrice: 3500, trend: 'up', arrivalVolume: 50 },
    { mandiName: 'Rajkot Mandi (GJ)',       mandiNameHi: 'राजकोट मंडी',    mandiNameMr: 'राजकोट मंडी',   distanceKm: 600, minPrice: 2500, maxPrice: 6000, modalPrice: 4000, trend: 'up', arrivalVolume: 120 },
    { mandiName: 'Guntur APMC (AP)',        mandiNameHi: 'गुंटूर APMC',     mandiNameMr: 'गुंटूर APMC',   distanceKm: 750, minPrice: 3000, maxPrice: 7000, modalPrice: 5000, trend: 'stable', arrivalVolume: 180 },
  ],
  drumstick: [
    { mandiName: 'Salem Mandi (TN)',        mandiNameHi: 'सेलम मंडी',       mandiNameMr: 'सेलम मंडी',      distanceKm: 1100, minPrice: 2500, maxPrice: 6000, modalPrice: 4000, trend: 'up', arrivalVolume: 160 },
    { mandiName: 'Bangalore APMC',          mandiNameHi: 'बेंगलुरु APMC',   mandiNameMr: 'बेंगळुरू APMC',  distanceKm: 840, minPrice: 2000, maxPrice: 5000, modalPrice: 3500, trend: 'stable', arrivalVolume: 120 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 2200, maxPrice: 5500, modalPrice: 3800, trend: 'up', arrivalVolume: 80 },
  ],
  fenugreek: [
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 1000, maxPrice: 2000, modalPrice: 1400, trend: 'stable', arrivalVolume: 45 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 1100, maxPrice: 2100, modalPrice: 1600, trend: 'up', arrivalVolume: 35 },
    { mandiName: 'Rajkot Mandi (GJ)',       mandiNameHi: 'राजकोट मंडी',    mandiNameMr: 'राजकोट मंडी',   distanceKm: 600, minPrice: 1200, maxPrice: 2400, modalPrice: 1800, trend: 'up', arrivalVolume: 70 },
  ],
  radish: [
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 500,  maxPrice: 1200, modalPrice: 800, trend: 'stable', arrivalVolume: 40 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 600, maxPrice: 1400, modalPrice: 900, trend: 'up', arrivalVolume: 30 },
    { mandiName: 'Amritsar Mandi',          mandiNameHi: 'अमृतसर मंडी',    mandiNameMr: 'अमृतसर मंडी',   distanceKm: 1100, minPrice: 400, maxPrice: 1100, modalPrice: 700, trend: 'down', arrivalVolume: 60 },
  ],
  'sweet corn': [
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 1000, maxPrice: 2000, modalPrice: 1500, trend: 'up', arrivalVolume: 55 },
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 900,  maxPrice: 1900, modalPrice: 1400, trend: 'stable', arrivalVolume: 40 },
    { mandiName: 'Ludhiana Mandi',          mandiNameHi: 'लुधियाना मंडी',   mandiNameMr: 'लुधियाना मंडी',  distanceKm: 1100, minPrice: 1100, maxPrice: 2200, modalPrice: 1700, trend: 'up', arrivalVolume: 80 },
  ],
  beans: [
    { mandiName: 'Hassan Mandi (KA)',       mandiNameHi: 'हसन मंडी',        mandiNameMr: 'हसन मंडी',       distanceKm: 820, minPrice: 2000, maxPrice: 4500, modalPrice: 3200, trend: 'up', arrivalVolume: 90 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 1800, maxPrice: 4000, modalPrice: 3000, trend: 'stable', arrivalVolume: 70 },
    { mandiName: 'Ooty Mandi (TN)',         mandiNameHi: 'ऊटी मंडी',         mandiNameMr: 'ऊटी मंडी',       distanceKm: 1100, minPrice: 2200, maxPrice: 5000, modalPrice: 3500, trend: 'up', arrivalVolume: 110 },
  ],

  // ── Fruits ──────────────────────────────────────────────────────────────────
  mango: [
    { mandiName: 'Ratnagiri APMC',          mandiNameHi: 'रत्नागिरी APMC',  mandiNameMr: 'रत्नागिरी APMC', distanceKm: 200, minPrice: 6000, maxPrice: 15000, modalPrice: 9000, trend: 'up', arrivalVolume: 250 },
    { mandiName: 'Junagadh Mandi (GJ)',     mandiNameHi: 'जूनागढ़ मंडी',    mandiNameMr: 'जुनागढ मंडी',   distanceKm: 700, minPrice: 5000, maxPrice: 14000, modalPrice: 8500, trend: 'up', arrivalVolume: 350 },
    { mandiName: 'Lucknow Mandi (UP)',      mandiNameHi: 'लखनऊ मंडी',       mandiNameMr: 'लखनौ मंडी',      distanceKm: 1100, minPrice: 3500, maxPrice: 9000, modalPrice: 6500, trend: 'stable', arrivalVolume: 200 },
    { mandiName: 'Bangalore APMC',          mandiNameHi: 'बेंगलुरु APMC',   mandiNameMr: 'बेंगळुरू APMC',  distanceKm: 840, minPrice: 4000, maxPrice: 11000, modalPrice: 7500, trend: 'up', arrivalVolume: 180 },
    { mandiName: 'Vijayawada Mandi (AP)',   mandiNameHi: 'विजयवाड़ा मंडी',  mandiNameMr: 'विजयवाडा मंडी', distanceKm: 900, minPrice: 4500, maxPrice: 12000, modalPrice: 8000, trend: 'up', arrivalVolume: 420 },
    { mandiName: 'Salem Mandi (TN)',        mandiNameHi: 'सेलम मंडी',       mandiNameMr: 'सेलम मंडी',      distanceKm: 1100, minPrice: 3000, maxPrice: 9000, modalPrice: 6000, trend: 'stable', arrivalVolume: 160 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 7000, maxPrice: 18000, modalPrice: 12000, trend: 'up', arrivalVolume: 120 },
  ],
  banana: [
    { mandiName: 'Jalgaon APMC',            mandiNameHi: 'जळगांव APMC',     mandiNameMr: 'जळगाव APMC',     distanceKm: 380, minPrice: 1500, maxPrice: 3500, modalPrice: 2200, trend: 'stable', arrivalVolume: 450 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 1800, maxPrice: 4000, modalPrice: 2700, trend: 'up', arrivalVolume: 300 },
    { mandiName: 'Surat Mandi (GJ)',        mandiNameHi: 'सूरत मंडी',       mandiNameMr: 'सूरत मंडी',      distanceKm: 320, minPrice: 1500, maxPrice: 3500, modalPrice: 2300, trend: 'stable', arrivalVolume: 220 },
    { mandiName: 'Eluru APMC (AP)',         mandiNameHi: 'एलुरु APMC',      mandiNameMr: 'एलुरु APMC',     distanceKm: 950, minPrice: 1000, maxPrice: 2500, modalPrice: 1700, trend: 'down', arrivalVolume: 350 },
    { mandiName: 'Tiruchirapalli (TN)',     mandiNameHi: 'तिरुचिरापल्ली',  mandiNameMr: 'तिरुचिरापल्ली',  distanceKm: 1400, minPrice: 1200, maxPrice: 2800, modalPrice: 2000, trend: 'stable', arrivalVolume: 280 },
    { mandiName: 'Varanasi Mandi (UP)',     mandiNameHi: 'वाराणसी मंडी',   mandiNameMr: 'वाराणसी मंडी',  distanceKm: 1300, minPrice: 1200, maxPrice: 3000, modalPrice: 2000, trend: 'down', arrivalVolume: 200 },
  ],
  pomegranate: [
    { mandiName: 'Ahmednagar APMC',         mandiNameHi: 'अहमदनगर APMC',   mandiNameMr: 'अहमदनगर APMC',  distanceKm: 120, minPrice: 5000, maxPrice: 9000, modalPrice: 7000, trend: 'up', arrivalVolume: 130 },
    { mandiName: 'Solapur APMC',            mandiNameHi: 'सोलापूर APMC',    mandiNameMr: 'सोलापूर APMC',   distanceKm: 240, minPrice: 4500, maxPrice: 8500, modalPrice: 6500, trend: 'stable', arrivalVolume: 90 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 6000, maxPrice: 11000, modalPrice: 8500, trend: 'up', arrivalVolume: 70 },
    { mandiName: 'Rajkot Mandi (GJ)',       mandiNameHi: 'राजकोट मंडी',    mandiNameMr: 'राजकोट मंडी',   distanceKm: 600, minPrice: 4000, maxPrice: 8000, modalPrice: 6000, trend: 'down', arrivalVolume: 50 },
  ],
  watermelon: [
    { mandiName: 'Solapur APMC',            mandiNameHi: 'सोलापूर APMC',    mandiNameMr: 'सोलापूर APMC',   distanceKm: 240, minPrice: 600,  maxPrice: 1500, modalPrice: 1000, trend: 'stable', arrivalVolume: 500 },
    { mandiName: 'Ludhiana Mandi',          mandiNameHi: 'लुधियाना मंडी',   mandiNameMr: 'लुधियाना मंडी',  distanceKm: 1100, minPrice: 700, maxPrice: 1600, modalPrice: 1100, trend: 'up', arrivalVolume: 350 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 800, maxPrice: 1800, modalPrice: 1300, trend: 'up', arrivalVolume: 200 },
    { mandiName: 'Rajkot Mandi (GJ)',       mandiNameHi: 'राजकोट मंडी',    mandiNameMr: 'राजकोट मंडी',   distanceKm: 600, minPrice: 600,  maxPrice: 1400, modalPrice: 1000, trend: 'stable', arrivalVolume: 280 },
    { mandiName: 'Jaipur Mandi (RJ)',       mandiNameHi: 'जयपुर मंडी',     mandiNameMr: 'जयपुर मंडी',    distanceKm: 950, minPrice: 500,  maxPrice: 1300, modalPrice: 900, trend: 'down', arrivalVolume: 400 },
  ],
  grapes: [
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 3000, maxPrice: 8000, modalPrice: 5500, trend: 'up', arrivalVolume: 600 },
    { mandiName: 'Sangli APMC',             mandiNameHi: 'सांगली APMC',     mandiNameMr: 'सांगली APMC',    distanceKm: 270, minPrice: 3500, maxPrice: 9000, modalPrice: 6000, trend: 'up', arrivalVolume: 450 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 4500, maxPrice: 10000, modalPrice: 7000, trend: 'up', arrivalVolume: 200 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 4000, maxPrice: 9000, modalPrice: 6500, trend: 'stable', arrivalVolume: 150 },
  ],
  strawberry: [
    { mandiName: 'Mahabaleshwar Mandi',     mandiNameHi: 'महाबलेश्वर मंडी', mandiNameMr: 'महाबळेश्वर मंडी', distanceKm: 80, minPrice: 8000, maxPrice: 20000, modalPrice: 13000, trend: 'up', arrivalVolume: 50 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 10000, maxPrice: 25000, modalPrice: 17000, trend: 'up', arrivalVolume: 30 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 12000, maxPrice: 28000, modalPrice: 20000, trend: 'up', arrivalVolume: 20 },
    { mandiName: 'Ooty Mandi (TN)',         mandiNameHi: 'ऊटी मंडी',         mandiNameMr: 'ऊटी मंडी',       distanceKm: 1100, minPrice: 8000, maxPrice: 18000, modalPrice: 13000, trend: 'stable', arrivalVolume: 40 },
  ],
  guava: [
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 1500, maxPrice: 3500, modalPrice: 2500, trend: 'stable', arrivalVolume: 90 },
    { mandiName: 'Allahabad Mandi (UP)',    mandiNameHi: 'प्रयागराज मंडी',  mandiNameMr: 'प्रयागराज मंडी', distanceKm: 1200, minPrice: 1500, maxPrice: 4000, modalPrice: 2700, trend: 'up', arrivalVolume: 200 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 2000, maxPrice: 4500, modalPrice: 3200, trend: 'up', arrivalVolume: 70 },
  ],
  papaya: [
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 800,  maxPrice: 2000, modalPrice: 1200, trend: 'stable', arrivalVolume: 80 },
    { mandiName: 'Surat Mandi (GJ)',        mandiNameHi: 'सूरत मंडी',       mandiNameMr: 'सूरत मंडी',      distanceKm: 320, minPrice: 700,  maxPrice: 1800, modalPrice: 1200, trend: 'stable', arrivalVolume: 120 },
    { mandiName: 'Koyambedu Mandi (TN)',    mandiNameHi: 'कोयम्बेडु मंडी',  mandiNameMr: 'कोयम्बेडु मंडी', distanceKm: 1200, minPrice: 900, maxPrice: 2200, modalPrice: 1500, trend: 'up', arrivalVolume: 200 },
  ],
  orange: [
    { mandiName: 'Nagpur APMC',             mandiNameHi: 'नागपुर APMC',     mandiNameMr: 'नागपूर APMC',    distanceKm: 700, minPrice: 2000, maxPrice: 5000, modalPrice: 3500, trend: 'up', arrivalVolume: 350 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 2500, maxPrice: 6000, modalPrice: 4200, trend: 'up', arrivalVolume: 180 },
    { mandiName: 'Amravati APMC',           mandiNameHi: 'अमरावती APMC',    mandiNameMr: 'अमरावती APMC',   distanceKm: 650, minPrice: 1800, maxPrice: 4500, modalPrice: 3200, trend: 'stable', arrivalVolume: 280 },
  ],
  lemon: [
    { mandiName: 'Vidarbha Mandi',          mandiNameHi: 'विदर्भ मंडी',     mandiNameMr: 'विदर्भ मंडी',    distanceKm: 600, minPrice: 3000, maxPrice: 7000, modalPrice: 5000, trend: 'up', arrivalVolume: 120 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 3500, maxPrice: 8000, modalPrice: 5500, trend: 'up', arrivalVolume: 80 },
    { mandiName: 'Koyambedu Mandi (TN)',    mandiNameHi: 'कोयम्बेडु मंडी',  mandiNameMr: 'कोयम्बेडु मंडी', distanceKm: 1200, minPrice: 4000, maxPrice: 9000, modalPrice: 6000, trend: 'up', arrivalVolume: 150 },
  ],
  sapota: [
    { mandiName: 'Konkan Mandi',            mandiNameHi: 'कोंकण मंडी',      mandiNameMr: 'कोकण मंडी',      distanceKm: 120, minPrice: 2000, maxPrice: 5000, modalPrice: 3200, trend: 'stable', arrivalVolume: 60 },
    { mandiName: 'Krishnagiri Mandi (TN)',  mandiNameHi: 'कृष्णागिरि मंडी', mandiNameMr: 'कृष्णागिरी मंडी', distanceKm: 950, minPrice: 1800, maxPrice: 4500, modalPrice: 3000, trend: 'stable', arrivalVolume: 100 },
    { mandiName: 'Ankleshwar Mandi (GJ)',   mandiNameHi: 'अंकलेश्वर मंडी',  mandiNameMr: 'अंकलेश्वर मंडी', distanceKm: 350, minPrice: 2000, maxPrice: 5000, modalPrice: 3500, trend: 'up', arrivalVolume: 80 },
  ],
  'custard apple': [
    { mandiName: 'Aurangabad APMC',         mandiNameHi: 'औरंगाबाद APMC',   mandiNameMr: 'औरंगाबाद APMC',  distanceKm: 350, minPrice: 4000, maxPrice: 9000, modalPrice: 6500, trend: 'up', arrivalVolume: 70 },
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 3500, maxPrice: 8000, modalPrice: 6000, trend: 'stable', arrivalVolume: 50 },
    { mandiName: 'Solapur APMC',            mandiNameHi: 'सोलापूर APMC',    mandiNameMr: 'सोलापूर APMC',   distanceKm: 240, minPrice: 4000, maxPrice: 9500, modalPrice: 7000, trend: 'up', arrivalVolume: 40 },
  ],
  coconut: [
    { mandiName: 'Tumkur Mandi (KA)',       mandiNameHi: 'तुमकुर मंडी',     mandiNameMr: 'तुमकुर मंडी',    distanceKm: 850, minPrice: 1500, maxPrice: 3500, modalPrice: 2500, trend: 'stable', arrivalVolume: 400 },
    { mandiName: 'Konkan Mandi',            mandiNameHi: 'कोंकण मंडी',      mandiNameMr: 'कोकण मंडी',      distanceKm: 120, minPrice: 1700, maxPrice: 4000, modalPrice: 2800, trend: 'up', arrivalVolume: 300 },
    { mandiName: 'Koyambedu Mandi (TN)',    mandiNameHi: 'कोयम्बेडु मंडी',  mandiNameMr: 'कोयम्बेडु मंडी', distanceKm: 1200, minPrice: 2000, maxPrice: 4500, modalPrice: 3200, trend: 'up', arrivalVolume: 500 },
  ],
  muskmelon: [
    { mandiName: 'Amritsar Mandi',          mandiNameHi: 'अमृतसर मंडी',    mandiNameMr: 'अमृतसर मंडी',   distanceKm: 1100, minPrice: 800, maxPrice: 2000, modalPrice: 1300, trend: 'stable', arrivalVolume: 200 },
    { mandiName: 'Solapur APMC',            mandiNameHi: 'सोलापूर APMC',    mandiNameMr: 'सोलापूर APMC',   distanceKm: 240, minPrice: 700,  maxPrice: 1800, modalPrice: 1200, trend: 'stable', arrivalVolume: 160 },
    { mandiName: 'Rajkot Mandi (GJ)',       mandiNameHi: 'राजकोट मंडी',    mandiNameMr: 'राजकोट मंडी',   distanceKm: 600, minPrice: 750,  maxPrice: 1900, modalPrice: 1300, trend: 'up', arrivalVolume: 180 },
  ],
  amla: [
    { mandiName: 'Pratapgarh Mandi (UP)',   mandiNameHi: 'प्रतापगढ़ मंडी',  mandiNameMr: 'प्रतापगड मंडी', distanceKm: 1300, minPrice: 1000, maxPrice: 3000, modalPrice: 2000, trend: 'up', arrivalVolume: 300 },
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 1200, maxPrice: 3500, modalPrice: 2400, trend: 'stable', arrivalVolume: 120 },
  ],
  litchi: [
    { mandiName: 'Ludhiana Mandi',          mandiNameHi: 'लुधियाना मंडी',   mandiNameMr: 'लुधियाना मंडी',  distanceKm: 1100, minPrice: 4000, maxPrice: 9000, modalPrice: 6500, trend: 'up', arrivalVolume: 150 },
    { mandiName: 'Varanasi Mandi (UP)',     mandiNameHi: 'वाराणसी मंडी',   mandiNameMr: 'वाराणसी मंडी',  distanceKm: 1300, minPrice: 4500, maxPrice: 10000, modalPrice: 7000, trend: 'up', arrivalVolume: 200 },
    { mandiName: 'Mumbai Vashi APMC',       mandiNameHi: 'मुंबई वाशी APMC', mandiNameMr: 'मुंबई वाशी APMC', distanceKm: 130, minPrice: 6000, maxPrice: 14000, modalPrice: 9500, trend: 'up', arrivalVolume: 80 },
  ],

  // ── Grains ──────────────────────────────────────────────────────────────────
  wheat: [
    { mandiName: 'Solapur APMC',            mandiNameHi: 'सोलापूर APMC',    mandiNameMr: 'सोलापूर APMC',   distanceKm: 240, minPrice: 2300, maxPrice: 2850, modalPrice: 2650, trend: 'up', arrivalVolume: 280 },
    { mandiName: 'Latur APMC',              mandiNameHi: 'लातूर APMC',      mandiNameMr: 'लातूर APMC',     distanceKm: 320, minPrice: 2400, maxPrice: 2900, modalPrice: 2700, trend: 'up', arrivalVolume: 410 },
    { mandiName: 'Jalgaon APMC',            mandiNameHi: 'जळगांव APMC',    mandiNameMr: 'जळगाव APMC',    distanceKm: 390, minPrice: 2250, maxPrice: 2750, modalPrice: 2550, trend: 'down', arrivalVolume: 180 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 2200, maxPrice: 2700, modalPrice: 2500, trend: 'stable', arrivalVolume: 60 },
    { mandiName: 'Amritsar Mandi (PB)',     mandiNameHi: 'अमृतसर मंडी',    mandiNameMr: 'अमृतसर मंडी',   distanceKm: 1100, minPrice: 2500, maxPrice: 3000, modalPrice: 2800, trend: 'up', arrivalVolume: 1200 },
    { mandiName: 'Indore Mandi (MP)',       mandiNameHi: 'इंदौर मंडी',     mandiNameMr: 'इंदोर मंडी',    distanceKm: 700, minPrice: 2300, maxPrice: 2800, modalPrice: 2600, trend: 'stable', arrivalVolume: 900 },
  ],
  soybean: [
    { mandiName: 'Latur APMC',              mandiNameHi: 'लातूर APMC',      mandiNameMr: 'लातूर APMC',     distanceKm: 320, minPrice: 3800, maxPrice: 4500, modalPrice: 4200, trend: 'up', arrivalVolume: 1200 },
    { mandiName: 'Washim APMC',             mandiNameHi: 'वाशिम APMC',      mandiNameMr: 'वाशिम APMC',     distanceKm: 410, minPrice: 3900, maxPrice: 4650, modalPrice: 4350, trend: 'up', arrivalVolume: 850 },
    { mandiName: 'Amravati APMC',           mandiNameHi: 'अमरावती APMC',    mandiNameMr: 'अमरावती APMC',   distanceKm: 480, minPrice: 3750, maxPrice: 4400, modalPrice: 4150, trend: 'stable', arrivalVolume: 620 },
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 3600, maxPrice: 4100, modalPrice: 3900, trend: 'down', arrivalVolume: 40 },
    { mandiName: 'Indore Mandi (MP)',       mandiNameHi: 'इंदौर मंडी',     mandiNameMr: 'इंदोर मंडी',    distanceKm: 700, minPrice: 4000, maxPrice: 4700, modalPrice: 4400, trend: 'up', arrivalVolume: 1500 },
  ],
  rice: [
    { mandiName: 'Ratnagiri APMC',          mandiNameHi: 'रत्नागिरी APMC',  mandiNameMr: 'रत्नागिरी APMC', distanceKm: 200, minPrice: 2500, maxPrice: 4000, modalPrice: 3200, trend: 'stable', arrivalVolume: 350 },
    { mandiName: 'Ludhiana Mandi',          mandiNameHi: 'लुधियाना मंडी',   mandiNameMr: 'लुधियाना मंडी',  distanceKm: 1100, minPrice: 2800, maxPrice: 4200, modalPrice: 3500, trend: 'up', arrivalVolume: 800 },
    { mandiName: 'Eluru APMC (AP)',         mandiNameHi: 'एलुरु APMC',      mandiNameMr: 'एलुरु APMC',     distanceKm: 950, minPrice: 2200, maxPrice: 3500, modalPrice: 2800, trend: 'stable', arrivalVolume: 600 },
    { mandiName: 'Koyambedu Mandi (TN)',    mandiNameHi: 'कोयम्बेडु मंडी',  mandiNameMr: 'कोयम्बेडु मंडी', distanceKm: 1200, minPrice: 2600, maxPrice: 4000, modalPrice: 3200, trend: 'stable', arrivalVolume: 500 },
  ],
  maize: [
    { mandiName: 'Pune APMC',               mandiNameHi: 'पुणे APMC',        mandiNameMr: 'पुणे APMC',      distanceKm: 15,  minPrice: 1400, maxPrice: 2000, modalPrice: 1700, trend: 'stable', arrivalVolume: 120 },
    { mandiName: 'Davangere Mandi (KA)',    mandiNameHi: 'दावणगेरे मंडी',  mandiNameMr: 'दावणगेरे मंडी', distanceKm: 800, minPrice: 1600, maxPrice: 2200, modalPrice: 1900, trend: 'up', arrivalVolume: 300 },
    { mandiName: 'Gulbarga APMC (KA)',      mandiNameHi: 'गुलबर्गा APMC',   mandiNameMr: 'गुलबर्गा APMC',  distanceKm: 580, minPrice: 1500, maxPrice: 2100, modalPrice: 1800, trend: 'stable', arrivalVolume: 250 },
  ],

  // ── Spices ──────────────────────────────────────────────────────────────────
  chilli: [
    { mandiName: 'Guntur APMC (AP)',        mandiNameHi: 'गुंटूर APMC',     mandiNameMr: 'गुंटूर APMC',   distanceKm: 750, minPrice: 8000, maxPrice: 20000, modalPrice: 13000, trend: 'up', arrivalVolume: 2000 },
    { mandiName: 'Warangal Mandi (TS)',     mandiNameHi: 'वारंगल मंडी',    mandiNameMr: 'वारंगल मंडी',   distanceKm: 700, minPrice: 7500, maxPrice: 18000, modalPrice: 12000, trend: 'up', arrivalVolume: 1200 },
    { mandiName: 'Nashik APMC',             mandiNameHi: 'नाशिक APMC',      mandiNameMr: 'नाशिक APMC',     distanceKm: 210, minPrice: 5000, maxPrice: 14000, modalPrice: 9000, trend: 'stable', arrivalVolume: 400 },
    { mandiName: 'Rajkot Mandi (GJ)',       mandiNameHi: 'राजकोट मंडी',    mandiNameMr: 'राजकोट मंडी',   distanceKm: 600, minPrice: 6000, maxPrice: 15000, modalPrice: 10000, trend: 'up', arrivalVolume: 600 },
  ],
  turmeric: [
    { mandiName: 'Sangli APMC',             mandiNameHi: 'सांगली APMC',     mandiNameMr: 'सांगली APMC',    distanceKm: 270, minPrice: 6000, maxPrice: 13000, modalPrice: 9000, trend: 'up', arrivalVolume: 300 },
    { mandiName: 'Erode Mandi (TN)',        mandiNameHi: 'इरोड मंडी',       mandiNameMr: 'इरोड मंडी',      distanceKm: 1100, minPrice: 7000, maxPrice: 15000, modalPrice: 10500, trend: 'up', arrivalVolume: 800 },
    { mandiName: 'Nizamabad Mandi (TS)',    mandiNameHi: 'निज़ामाबाद मंडी', mandiNameMr: 'निजामाबाद मंडी', distanceKm: 700, minPrice: 6500, maxPrice: 14000, modalPrice: 9500, trend: 'stable', arrivalVolume: 600 },
  ],
  cumin: [
    { mandiName: 'Unjha Mandi (GJ)',        mandiNameHi: 'उंजा मंडी',       mandiNameMr: 'उंजा मंडी',      distanceKm: 560, minPrice: 15000, maxPrice: 30000, modalPrice: 22000, trend: 'up', arrivalVolume: 800 },
    { mandiName: 'Jodhpur Mandi (RJ)',      mandiNameHi: 'जोधपुर मंडी',    mandiNameMr: 'जोधपुर मंडी',   distanceKm: 950, minPrice: 14000, maxPrice: 28000, modalPrice: 20000, trend: 'up', arrivalVolume: 600 },
    { mandiName: 'Rajkot Mandi (GJ)',       mandiNameHi: 'राजकोट मंडी',    mandiNameMr: 'राजकोट मंडी',   distanceKm: 600, minPrice: 16000, maxPrice: 32000, modalPrice: 24000, trend: 'up', arrivalVolume: 500 },
  ],
}

// ── All crops list ─────────────────────────────────────────────────────────────
const CROPS = [
  // Vegetables
  { id: 'onion',         name: 'Onion',         nameHi: 'प्याज',       nameMr: 'कांदा',      category: '🥦 Vegetables' },
  { id: 'tomato',        name: 'Tomato',         nameHi: 'टमाटर',      nameMr: 'टोमॅटो',     category: '🥦 Vegetables' },
  { id: 'potato',        name: 'Potato',         nameHi: 'आलू',         nameMr: 'बटाटा',      category: '🥦 Vegetables' },
  { id: 'brinjal',       name: 'Brinjal',        nameHi: 'बैंगन',      nameMr: 'वांगी',      category: '🥦 Vegetables' },
  { id: 'cauliflower',   name: 'Cauliflower',    nameHi: 'फूलगोभी',    nameMr: 'फुलकोबी',    category: '🥦 Vegetables' },
  { id: 'cabbage',       name: 'Cabbage',        nameHi: 'पत्तागोभी',  nameMr: 'कोबी',       category: '🥦 Vegetables' },
  { id: 'capsicum',      name: 'Capsicum',       nameHi: 'शिमला मिर्च', nameMr: 'ढोबळी मिरची', category: '🥦 Vegetables' },
  { id: 'bhindi',        name: 'Lady Finger',    nameHi: 'भिंडी',      nameMr: 'भेंडी',      category: '🥦 Vegetables' },
  { id: 'bitter gourd',  name: 'Bitter Gourd',   nameHi: 'करेला',      nameMr: 'कारले',      category: '🥦 Vegetables' },
  { id: 'bottle gourd',  name: 'Bottle Gourd',   nameHi: 'लौकी',       nameMr: 'दुधी भोपळा', category: '🥦 Vegetables' },
  { id: 'pumpkin',       name: 'Pumpkin',        nameHi: 'कद्दू',      nameMr: 'भोपळा',      category: '🥦 Vegetables' },
  { id: 'carrot',        name: 'Carrot',         nameHi: 'गाजर',       nameMr: 'गाजर',       category: '🥦 Vegetables' },
  { id: 'radish',        name: 'Radish',         nameHi: 'मूली',       nameMr: 'मुळा',       category: '🥦 Vegetables' },
  { id: 'spinach',       name: 'Spinach',        nameHi: 'पालक',       nameMr: 'पालक',       category: '🥦 Vegetables' },
  { id: 'peas',          name: 'Peas',           nameHi: 'मटर',        nameMr: 'वाटाणे',     category: '🥦 Vegetables' },
  { id: 'green chilli',  name: 'Green Chilli',   nameHi: 'हरी मिर्च',  nameMr: 'हिरवी मिरची', category: '🥦 Vegetables' },
  { id: 'garlic',        name: 'Garlic',         nameHi: 'लहसुन',      nameMr: 'लसूण',       category: '🥦 Vegetables' },
  { id: 'ginger',        name: 'Ginger',         nameHi: 'अदरक',       nameMr: 'आले',        category: '🥦 Vegetables' },
  { id: 'coriander',     name: 'Coriander',      nameHi: 'धनिया',      nameMr: 'कोथिंबीर',   category: '🥦 Vegetables' },
  { id: 'fenugreek',     name: 'Fenugreek',      nameHi: 'मेथी',       nameMr: 'मेथी',       category: '🥦 Vegetables' },
  { id: 'drumstick',     name: 'Drumstick',      nameHi: 'सहजन',       nameMr: 'शेवगा',      category: '🥦 Vegetables' },
  { id: 'sweet corn',    name: 'Sweet Corn',     nameHi: 'मीठे मक्का', nameMr: 'गोड मका',    category: '🥦 Vegetables' },
  { id: 'beans',         name: 'Beans',          nameHi: 'फलियां',     nameMr: 'घेवडा',      category: '🥦 Vegetables' },
  // Fruits
  { id: 'mango',         name: 'Mango',          nameHi: 'आम',         nameMr: 'आंबा',       category: '🍎 Fruits' },
  { id: 'banana',        name: 'Banana',         nameHi: 'केला',       nameMr: 'केळ',        category: '🍎 Fruits' },
  { id: 'pomegranate',   name: 'Pomegranate',    nameHi: 'अनार',       nameMr: 'डाळिंब',     category: '🍎 Fruits' },
  { id: 'watermelon',    name: 'Watermelon',     nameHi: 'तरबूज',      nameMr: 'टरबूज',      category: '🍎 Fruits' },
  { id: 'grapes',        name: 'Grapes',         nameHi: 'अंगूर',      nameMr: 'द्राक्षे',   category: '🍎 Fruits' },
  { id: 'strawberry',    name: 'Strawberry',     nameHi: 'स्ट्रॉबेरी', nameMr: 'स्ट्रॉबेरी', category: '🍎 Fruits' },
  { id: 'guava',         name: 'Guava',          nameHi: 'अमरूद',      nameMr: 'पेरू',       category: '🍎 Fruits' },
  { id: 'papaya',        name: 'Papaya',         nameHi: 'पपीता',      nameMr: 'पपई',        category: '🍎 Fruits' },
  { id: 'orange',        name: 'Orange',         nameHi: 'संतरा',      nameMr: 'संत्रा',     category: '🍎 Fruits' },
  { id: 'lemon',         name: 'Lemon',          nameHi: 'नींबू',      nameMr: 'लिंबू',      category: '🍎 Fruits' },
  { id: 'sapota',        name: 'Sapota (Chiku)',  nameHi: 'चीकू',       nameMr: 'चिकू',       category: '🍎 Fruits' },
  { id: 'custard apple', name: 'Custard Apple',  nameHi: 'शरीफा',      nameMr: 'सीताफळ',     category: '🍎 Fruits' },
  { id: 'coconut',       name: 'Coconut',        nameHi: 'नारियल',     nameMr: 'नारळ',       category: '🍎 Fruits' },
  { id: 'muskmelon',     name: 'Muskmelon',      nameHi: 'खरबूज',      nameMr: 'खरबूज',      category: '🍎 Fruits' },
  { id: 'amla',          name: 'Amla',           nameHi: 'आंवला',      nameMr: 'आवळा',       category: '🍎 Fruits' },
  { id: 'litchi',        name: 'Litchi',         nameHi: 'लीची',       nameMr: 'लीची',       category: '🍎 Fruits' },
  // Grains
  { id: 'wheat',         name: 'Wheat',          nameHi: 'गेहूं',      nameMr: 'गहू',        category: '🌾 Grains' },
  { id: 'soybean',       name: 'Soybean',        nameHi: 'सोयाबीन',    nameMr: 'सोयाबीन',    category: '🌾 Grains' },
  { id: 'rice',          name: 'Rice',           nameHi: 'चावल',       nameMr: 'तांदूळ',     category: '🌾 Grains' },
  { id: 'maize',         name: 'Maize',          nameHi: 'मक्का',      nameMr: 'मका',        category: '🌾 Grains' },
  // Spices
  { id: 'chilli',        name: 'Dry Chilli',     nameHi: 'लाल मिर्च',  nameMr: 'लाल मिरची',  category: '🌶️ Spices' },
  { id: 'turmeric',      name: 'Turmeric',       nameHi: 'हल्दी',      nameMr: 'हळद',        category: '🌶️ Spices' },
  { id: 'cumin',         name: 'Cumin (Jeera)',   nameHi: 'जीरा',       nameMr: 'जिरे',       category: '🌶️ Spices' },
]

const STATES = [
  'Maharashtra', 'Punjab', 'Uttar Pradesh', 'Gujarat', 'Rajasthan',
  'Karnataka', 'Madhya Pradesh', 'Tamil Nadu', 'Andhra Pradesh', 'Haryana',
  'Telangana', 'Bihar', 'West Bengal', 'Himachal Pradesh', 'Kerala',
]

function getDeterministicDistance(market: string): number {
  let hash = 0
  for (let i = 0; i < market.length; i++) {
    hash = market.charCodeAt(i) + ((hash << 5) - hash)
  }
  return 10 + (Math.abs(hash) % 141)
}

function getDeterministicVolume(market: string): number {
  let hash = 0
  for (let i = 0; i < market.length; i++) {
    hash = market.charCodeAt(i) + ((hash << 5) - hash)
  }
  return 15 + (Math.abs(hash) % 486)
}

function getTrend(min: number, max: number, modal: number): 'up' | 'down' | 'stable' {
  const range = max - min
  if (range <= 0) return 'stable'
  const pos = (modal - min) / range
  if (pos > 0.6) return 'up'
  if (pos < 0.4) return 'down'
  return 'stable'
}

// Group crops by category for the select menu
const CROP_CATEGORIES = [...new Set(CROPS.map(c => c.category))]

export default function MandiComparison({ lang }: { lang: Language }) {
  const [selectedCrop,  setSelectedCrop]  = useState('tomato')
  const [selectedState, setSelectedState] = useState('Maharashtra')
  const [searchCrop,    setSearchCrop]    = useState('')
  const [logisticsRate, setLogisticsRate] = useState(3)
  const [mandiList,     setMandiList]     = useState<MandiPriceData[]>([])
  const [loading,       setLoading]       = useState(true)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

  const isEn = lang === 'en'
  const isHi = lang === 'hi'

  const t = {
    en: {
      title: 'Mandi Price Comparison (APMC)',
      subtitle: 'Compare modal rates, volume arrivals, and estimate logistics costs to select the best APMC market.',
      selectCrop: 'Choose Crop',
      searchCrop: 'Search crop…',
      selectState: 'Select State',
      logisticsCostLabel: 'Logistics Rate (₹ / Quintal / km)',
      mandi: 'Mandi Market',
      dist: 'Distance',
      minMax: 'Min / Max Price (per Quintal)',
      modal: 'Modal Price',
      trend: 'Trend',
      arrival: 'Daily Arrivals',
      estLogistics: 'Logistics (est.)',
      netReturn: 'Net Return',
      bestMandi: '⭐ Recommended Market',
      quintal: 'Quintal (100 kg)',
      disclaimer: 'Prices updated daily from AGMARKNET. Fallback data used when live API is unavailable.',
      fallbackBadge: 'Local Fallback Data',
      loadingText: 'Loading live market prices…',
      noDataText: 'No records found for this crop in the selected state.',
      cropCount: (n: number) => `${n} mandis found`,
    },
    hi: {
      title: 'मंडी दर तुलना (APMC)',
      subtitle: 'सर्वश्रेष्ठ कृषि मंडी चुनने के लिए वर्तमान दरों, आवक मात्रा और परिवहन लागत की तुलना करें।',
      selectCrop: 'फसल चुनें',
      searchCrop: 'फसल खोजें…',
      selectState: 'राज्य चुनें',
      logisticsCostLabel: 'परिवहन दर (₹ / क्विंटल / किमी)',
      mandi: 'कृषि उपज मंडी',
      dist: 'दूरी',
      minMax: 'न्यूनतम / अधिकतम दर (प्रति क्विंटल)',
      modal: 'औसत दर',
      trend: 'रुझान',
      arrival: 'दैनिक आवक',
      estLogistics: 'परिवहन (अनुमानित)',
      netReturn: 'शुद्ध आय',
      bestMandi: '⭐ अनुशंसित मंडी',
      quintal: 'क्विंटल (100 किलोग्राम)',
      disclaimer: 'मूल्य प्रतिदिन AGMARKNET से अपडेट किए जाते हैं।',
      fallbackBadge: 'स्थानीय डेटा',
      loadingText: 'लाइव दरें लोड हो रही हैं…',
      noDataText: 'इस राज्य में इस फसल के लिए कोई रिकॉर्ड नहीं मिला।',
      cropCount: (n: number) => `${n} मंडियाँ मिलीं`,
    },
    mr: {
      title: 'मंडी भाव तुलना (APMC)',
      subtitle: 'सर्वोत्तम कृषी बाजारपेठ निवडण्यासाठी चालू बाजारभाव, आवक आणि वाहतूक खर्चाची तुलना करा.',
      selectCrop: 'पीक निवडा',
      searchCrop: 'पीक शोधा…',
      selectState: 'राज्य निवडा',
      logisticsCostLabel: 'वाहतूक दर (₹ / क्विंटल / किमी)',
      mandi: 'कृषी उत्पन्न बाजार समिती',
      dist: 'अंतर',
      minMax: 'किमान / कमाल भाव (प्रति क्विंटल)',
      modal: 'सरासरी भाव',
      trend: 'भाव कल',
      arrival: 'दैनिक आवक',
      estLogistics: 'वाहतूक (अंदाजे)',
      netReturn: 'निव्वळ नफा',
      bestMandi: '⭐ उत्कृष्ट बाजार',
      quintal: 'क्विंटल (100 किलो)',
      disclaimer: 'दर दररोज AGMARKNET वरून अपडेट केले जातात.',
      fallbackBadge: 'स्थानिक डेटा',
      loadingText: 'लाइव्ह बाजारभाव लोड होत आहेत…',
      noDataText: 'या राज्यात या पिकासाठी कोणतेही दर सापडले नाहीत.',
      cropCount: (n: number) => `${n} मंड्या सापडल्या`,
    },
  }[lang]

  const filteredCrops = searchCrop.trim()
    ? CROPS.filter(c =>
        c.name.toLowerCase().includes(searchCrop.toLowerCase()) ||
        c.nameHi.includes(searchCrop) ||
        c.nameMr.includes(searchCrop)
      )
    : CROPS

  useEffect(() => {
    let active = true
    setLoading(true)
    setIsUsingFallback(false)

    fetchMandiRates({ state: selectedState, limit: 500 })
      .then(fetched => {
        if (!active) return

        const key = selectedCrop.toLowerCase()
        const matched = fetched.filter(r => r.commodity.toLowerCase().includes(key))

        if (matched.length > 0) {
          const mapped: MandiPriceData[] = matched.map(r => ({
            mandiName: r.market,
            mandiNameHi: r.market,
            mandiNameMr: r.market,
            distanceKm: getDeterministicDistance(r.market),
            minPrice: r.minPrice,
            maxPrice: r.maxPrice,
            modalPrice: r.modalPrice,
            trend: getTrend(r.minPrice, r.maxPrice, r.modalPrice),
            arrivalVolume: getDeterministicVolume(r.market),
          }))
          setMandiList(mapped)
          setIsUsingFallback(false)
        } else {
          const fallbackList = MANDI_DATA[selectedCrop] ?? []
          setMandiList(
            fallbackList.length > 0
              ? fallbackList
              : MANDI_DATA['tomato'] ?? []
          )
          setIsUsingFallback(true)
        }
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        const fallbackList = MANDI_DATA[selectedCrop] ?? []
        setMandiList(fallbackList)
        setIsUsingFallback(true)
        setLoading(false)
      })

    return () => { active = false }
  }, [selectedCrop, selectedState])

  const recommendedMandi = mandiList.reduce<MandiPriceData | null>((best, current) => {
    if (!best) return current
    const netBest    = best.modalPrice    - best.distanceKm    * logisticsRate
    const netCurrent = current.modalPrice - current.distanceKm * logisticsRate
    return netCurrent > netBest ? current : best
  }, null)

  const selectedCropInfo = CROPS.find(c => c.id === selectedCrop)

  return (
    <div className="mandi-comparison-container">
      <div className="mc-header">
        <span className="mc-badge">🏛️ {isEn ? 'Government APMC Tracker' : isHi ? 'सरकारी एपीएमसी ट्रैकर' : 'शासकीय एपीएमसी ट्रॅकर'}</span>
        {isUsingFallback && (
          <span className="mc-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', marginLeft: '10px' }}>
            ⚠️ {t.fallbackBadge}
          </span>
        )}
        <h1>{t.title}</h1>
        <p className="mc-subtitle">{t.subtitle}</p>
      </div>

      <div className="mc-control-card glass-card">
        <div className="mc-controls-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {/* Crop search */}
          <div className="mc-form-group">
            <label>{t.searchCrop}</label>
            <input
              type="text"
              placeholder={t.searchCrop}
              value={searchCrop}
              onChange={e => setSearchCrop(e.target.value)}
              className="mc-input"
              style={{ marginBottom: 6 }}
            />
            <label htmlFor="mcCropSelect">{t.selectCrop}</label>
            <select
              id="mcCropSelect"
              value={selectedCrop}
              onChange={e => { setSelectedCrop(e.target.value); setSearchCrop('') }}
              className="mc-select"
              size={Math.min(filteredCrops.length + 1, 5)}
              style={{ borderRadius: 10 }}
            >
              {CROP_CATEGORIES.map(cat => {
                const cropsInCat = filteredCrops.filter(c => c.category === cat)
                if (cropsInCat.length === 0) return null
                return (
                  <optgroup key={cat} label={cat}>
                    {cropsInCat.map(c => (
                      <option key={c.id} value={c.id}>
                        {lang === 'en' ? c.name : lang === 'hi' ? c.nameHi : c.nameMr}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </div>

          {/* State */}
          <div className="mc-form-group">
            <label htmlFor="mcStateSelect">{t.selectState}</label>
            <select
              id="mcStateSelect"
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="mc-select"
            >
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Logistics rate */}
          <div className="mc-form-group">
            <label htmlFor="mcLogisticsInput">{t.logisticsCostLabel}</label>
            <input
              id="mcLogisticsInput"
              type="number"
              min={1}
              max={20}
              value={logisticsRate}
              onChange={e => setLogisticsRate(Number(e.target.value))}
              className="mc-input"
            />
          </div>
        </div>

        {/* Selected crop pill */}
        {selectedCropInfo && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
              {isEn ? 'Showing prices for:' : isHi ? 'दिखाया जा रहा है:' : 'दाखवत आहे:'}
            </span>
            <span style={{
              padding: '3px 12px',
              borderRadius: 20,
              background: 'rgba(34,197,94,0.15)',
              color: 'var(--green)',
              fontWeight: 700,
              fontSize: 13,
            }}>
              {lang === 'en' ? selectedCropInfo.name : lang === 'hi' ? selectedCropInfo.nameHi : selectedCropInfo.nameMr}
            </span>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
              {t.cropCount(mandiList.length)}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bb-loading-spinner-wrap">
          <div className="bb-spinner" />
          <p className="bb-loading-text">{t.loadingText}</p>
        </div>
      ) : (
        <>
          {recommendedMandi && (
            <div className="recommended-mandi-card animate-fade-in">
              <div className="rec-badge">{t.bestMandi}</div>
              <div className="rec-details">
                <h3>{lang === 'en' ? recommendedMandi.mandiName : lang === 'hi' ? recommendedMandi.mandiNameHi : recommendedMandi.mandiNameMr}</h3>
                <p>
                  {isEn ? 'Highest net payout: ' : isHi ? 'उच्चतम शुद्ध आय: ' : 'सर्वाधिक निव्वळ नफा: '}
                  <strong>₹{(recommendedMandi.modalPrice - recommendedMandi.distanceKm * logisticsRate).toLocaleString('en-IN')}/{t.quintal}</strong>
                  {isEn ? ' after logistics.' : isHi ? ' परिवहन घटाकर।' : ' वाहतूक वजा जाता.'}
                </p>
              </div>
            </div>
          )}

          {mandiList.length > 0 ? (
            <div className="mandi-table-wrapper glass-card animate-fade-in" style={{ overflowX: 'auto' }}>
              <table className="mandi-table">
                <thead>
                  <tr>
                    <th>{t.mandi}</th>
                    <th>{t.dist}</th>
                    <th>{t.minMax}</th>
                    <th>{t.modal}</th>
                    <th>{t.trend}</th>
                    <th>{t.arrival}</th>
                    <th>{t.estLogistics}</th>
                    <th>{t.netReturn}</th>
                  </tr>
                </thead>
                <tbody>
                  {mandiList.map((mandi) => {
                    const estLogCost    = mandi.distanceKm * logisticsRate
                    const estNetPayout  = mandi.modalPrice - estLogCost
                    const isBest        = recommendedMandi && recommendedMandi.mandiName === mandi.mandiName

                    return (
                      <tr key={mandi.mandiName} className={isBest ? 'table-highlight-row' : ''}>
                        <td>
                          <div className="mandi-name-cell">
                            <span>🏛️</span>
                            <div>
                              <strong>{lang === 'en' ? mandi.mandiName : lang === 'hi' ? mandi.mandiNameHi : mandi.mandiNameMr}</strong>
                              {isBest && <span className="mandi-best-label">{isEn ? 'Best' : isHi ? 'सर्वोत्तम' : 'सर्वोत्तम'}</span>}
                            </div>
                          </div>
                        </td>
                        <td>{mandi.distanceKm} km</td>
                        <td className="price-range-cell">
                          <span>₹{mandi.minPrice}</span> - <span>₹{mandi.maxPrice}</span>
                        </td>
                        <td className="modal-price-cell">₹{mandi.modalPrice}</td>
                        <td>
                          <span className={`trend-badge trend-${mandi.trend}`}>
                            {mandi.trend === 'up' ? '📈 ▲' : mandi.trend === 'down' ? '📉 ▼' : '➡️ ▬'}
                          </span>
                        </td>
                        <td>{mandi.arrivalVolume} t</td>
                        <td className="transport-cell">₹{estLogCost}</td>
                        <td className="net-return-cell">
                          <strong>₹{estNetPayout}</strong>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏛️</div>
              <p>{t.noDataText}</p>
            </div>
          )}
        </>
      )}

      <p className="mc-disclaimer">{t.disclaimer}</p>
    </div>
  )
}
