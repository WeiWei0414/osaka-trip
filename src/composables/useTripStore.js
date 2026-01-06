import { ref, computed, watch } from 'vue';

// 全域狀態
const events = ref([]);
const expenses = ref([]);
const transports = ref([]);

// 頁面狀態
const currentTab = ref('itinerary'); 
const currentDay = ref('Day 1');
const days = ref(['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']);

const members = ref(['我', '朋友 A']); 
const weatherForecast = ref([]);

// 大阪座標
const OSAKA_LAT = 34.6937;
const OSAKA_LON = 135.5023;

// ✨ 設定旅程出發日期 (Day 1 = 1/13) ✨
// 注意：Open-Meteo 一般預報只支援未來 14 天內，若是過去日期需改用 Archive API
// 這裡設定為 2026-01-13 (假設為接下來的行程)
const TRIP_START_DATE = '2026-01-13';
const TRIP_END_DATE   = '2026-01-19'; // 7天行程

export function useTripStore() {
    
    // 1. 資料存取
    const loadData = () => {
        const savedEvents = localStorage.getItem('osaka_events');
        const savedExpenses = localStorage.getItem('osaka_expenses');
        const savedTransports = localStorage.getItem('osaka_transports');

        if (savedEvents) {
            events.value = JSON.parse(savedEvents);
        } else {
            // 預設行程
            events.value = [
                { id: 101, day: 'Day 1', time: '17:00', title: '抵達關西機場 ✈️', location: '搭乘南海電鐵 Rapit → 新今宮站', type: '交通', address: '大阪府泉佐野市泉州空港北1' },
                { id: 102, day: 'Day 1', time: '18:00', title: '飯店 Check-in 🛏️', location: '新今宮附近', type: '交通', address: '大阪府大阪市西成区萩ノ茶屋2-2-24' },
                { id: 103, day: 'Day 1', time: '18:30', title: '通天閣看夜景 🗼', location: '新世界 / 通天閣', type: '景點', address: '大阪府大阪市浪速区恵美須東1-18-6' },
                { id: 104, day: 'Day 1', time: '19:30', title: '晚餐：串炸達摩 🍢', location: '串炸達摩 新世界總本店', type: '美食', address: '大阪府大阪市浪速区恵美須東2-3-9' },
                { id: 105, day: 'Day 1', time: '21:00', title: 'MEGA 唐吉訶德 🐧', location: '唐吉訶德 新世界店', type: '購物', address: 'MEGAドン・キホーテ新世界店' },
                
                // Day 2
                { id: 201, day: 'Day 2', time: '09:00', title: '早餐 & 出發 🍳', location: '飯店附近', type: '美食', address: '大阪府大阪市西成区萩ノ茶屋2-2-24' },
                { id: 202, day: 'Day 2', time: '10:30', title: '前往住吉大社 🚋', location: '南海電鐵：新今宮 ⮕ 住吉大社', type: '交通', address: '大阪府大阪市住吉区長峡町3-14' },
                { id: 203, day: 'Day 2', time: '11:00', title: '住吉大社參拜 ⛩️', location: '反橋 / 五大力石 / 楠珺社招福貓', type: '景點', address: '大阪府大阪市住吉区住吉2-9-89' },
                { id: 204, day: 'Day 2', time: '12:30', title: '移動至動物園 🚶', location: '南海電鐵回新今宮 ⮕ 步行至新世界大門', type: '交通', address: '大阪府大阪市天王寺区茶臼山町1-108' },
                { id: 205, day: 'Day 2', time: '13:00', title: '午餐：新世界/Tenshiba 🍤', location: '新世界串炸 或 公園草皮區', type: '美食', address: '大阪府大阪市天王寺区茶臼山町5-55' },
                { id: 206, day: 'Day 2', time: '14:00', title: '天王寺動物園 🦁', location: '非洲莽原區 / 河馬北極熊', type: '景點', address: '大阪府大阪市天王寺区茶臼山町1-108' },
                { id: 207, day: 'Day 2', time: '16:00', title: '前往心齋橋 🚇', location: '地鐵御堂筋線：天王寺 ⮕ 心齋橋', type: '交通', address: '大阪府大阪市中央区心斎橋筋1-8-16' },
                { id: 208, day: 'Day 2', time: '16:30', title: '心齋橋 PARCO/大丸 🛍️', location: '寶可夢中心 / 吉卜力 / Jump Shop', type: '購物', address: '大阪府大阪市中央区心斎橋筋1-8-3' },
                { id: 209, day: 'Day 2', time: '17:30', title: '下午茶：甲賀流章魚燒 🐙', location: '美國村', type: '美食', address: '大阪府大阪市中央区西心斎橋2-18-4' },
                { id: 210, day: 'Day 2', time: '18:30', title: '道頓堀跑跑人打卡 🏃', location: '道頓堀運河', type: '景點', address: '大阪府大阪市中央区道頓堀1-10-2' },
                { id: 211, day: 'Day 2', time: '19:30', title: '道頓堀晚餐 🍜', location: '道頓堀商圈', type: '美食', address: '大阪府大阪市中央区道頓堀1-9' },

                // Day 3 ~ Day 7 (保持原本結構)
                { id: 301, day: 'Day 3', time: '09:30', title: '前往京都 🚅', location: '京阪電車：北濱 ⮕ 祇園四條', type: '交通' },
                { id: 302, day: 'Day 3', time: '10:30', title: '錦市場早午餐 🍢', location: '三木雞卵 / 豆乳甜甜圈 / 錦天滿宮', type: '美食' },
                { id: 303, day: 'Day 3', time: '12:30', title: '計程車直攻清水寺 🚕', location: '四條通攔車 ⮕ 清水寺停車場', type: '交通' },
                { id: 304, day: 'Day 3', time: '13:00', title: '清水寺參拜 ⛩️', location: '清水舞台 / 音羽之瀧', type: '景點' },
                { id: 305, day: 'Day 3', time: '15:00', title: '散步：二三年坂/八坂塔 🚶', location: '榻榻米星巴克 / 石塀小路', type: '景點' },
                { id: 306, day: 'Day 3', time: '17:00', title: '八坂神社 & 祇園 🏮', location: '西樓門 / 花見小路', type: '景點' },
                { id: 307, day: 'Day 3', time: '17:30', title: '晚餐：京都繁華街 🍵', location: '鴨川畔 / 河馬町名代豬排', type: '美食' },
                { id: 308, day: 'Day 3', time: '19:30', title: '返回大阪 🌃', location: '京阪電車：祇園四條 ⮕ 北濱', type: '交通' },

                { id: 401, day: 'Day 4', time: '09:30', title: '前往神戶 🚋', location: 'JR新今宮 ⮕ JR三宮(新快速) ⮕ 新神戶', type: '交通' },
                { id: 402, day: 'Day 4', time: '10:30', title: '布引香草園 🌿', location: '纜車山頂站 / The Veranda 咖啡廳', type: '景點' },
                { id: 403, day: 'Day 4', time: '12:30', title: '午餐：神戶牛鐵板燒 🥩', location: '三宮 (Ishida/Mouriya/Steak Land)', type: '美食' },
                { id: 404, day: 'Day 4', time: '14:00', title: '南京町 (中華街) 🥟', location: '老祥記豬肉包 / 三宮中心街', type: '美食' },
                { id: 405, day: 'Day 4', time: '16:00', title: '漫步美利堅公園 ⚓', location: 'BE KOBE 地標 / 海邊步道', type: '景點' },
                { id: 406, day: 'Day 4', time: '17:00', title: 'Mosaic 廣場逛街 🛍️', location: 'Harborland / 文創小店', type: '購物' },
                { id: 407, day: 'Day 4', time: '18:00', title: '神戶港百萬夜景晚餐 🌃', location: 'Mosaic 靠窗餐廳 / 神戶港塔', type: '美食' },
                { id: 408, day: 'Day 4', time: '19:30', title: '返回大阪 🚄', location: 'JR神戶 ⮕ 大阪 ⮕ 新今宮', type: '交通' },

                { id: 501, day: 'Day 5', time: '10:00', title: '前往奈良 🦌', location: 'JR大和路快速：新今宮 ⮕ JR奈良', type: '交通' },
                { id: 502, day: 'Day 5', time: '10:40', title: '轉乘公車直達核心 🚌', location: '奈良市內循環公車：JR奈良 ⮕ 東大寺', type: '交通' },
                { id: 503, day: 'Day 5', time: '11:00', title: '東大寺 & 奈良公園 🍘', location: '餵鹿 / 鑽大佛柱洞 / 參拜大佛', type: '景點' },
                { id: 504, day: 'Day 5', time: '12:30', title: '奈良特色午餐 🍜', location: '麵鬪庵福袋烏龍麵 / 柿葉壽司', type: '美食' },
                { id: 505, day: 'Day 5', time: '14:00', title: '興福寺 & 猿澤池 🏯', location: '五重塔 / 猿澤池散步', type: '景點' },
                { id: 506, day: 'Day 5', time: '15:30', title: '中谷堂高速搗麻糬 🍡', location: '東向商店街 / 艾草紅豆麻糬', type: '美食' },
                { id: 507, day: 'Day 5', time: '16:30', title: '必買：大佛布丁 🍮', location: '近鐵/JR奈良站', type: '購物' },
                { id: 508, day: 'Day 5', time: '17:00', title: '返回大阪 🚂', location: 'JR大和路快速：奈良 ⮕ 新今宮', type: '交通' },

                { id: 601, day: 'Day 6', time: '10:30', title: '睡飽出發前往港區 🚇', location: 'JR弁天町轉乘 ⮕ 大阪港站', type: '交通' },
                { id: 602, day: 'Day 6', time: '11:30', title: '午餐：昭和老街美食 🍛', location: '天保山 Market Place / 浪花美食橫丁', type: '美食' },
                { id: 603, day: 'Day 6', time: '13:30', title: '大阪海遊館 🦈', location: '鯨鯊 / 海豹 / 觸摸池體驗', type: '景點' },
                { id: 604, day: 'Day 6', time: '16:00', title: '天保山摩天輪 🎡', location: '透明車廂挑戰', type: '景點' },
                { id: 605, day: 'Day 6', time: '17:00', title: '前往梅田 🚇', location: '地鐵中央線 ⮕ 御堂筋線 ⮕ 梅田', type: '交通' },
                { id: 606, day: 'Day 6', time: '18:00', title: '梅田藍天大廈 🌃', location: '空中庭園展望台 / 360度夜景', type: '景點' },
                { id: 607, day: 'Day 6', time: '20:00', title: '梅田商圈晚餐 🍝', location: 'LUCUA / Grand Front / 阪急百貨', type: '美食' },
                { id: 608, day: 'Day 6', time: '21:30', title: '返回飯店 🛌', location: '御堂筋線：梅田 ⮕ 動物園前', type: '交通' },

                { id: 701, day: 'Day 7', time: '08:00', title: '起床 & 早餐 🥯', location: '飯店附近', type: '美食' },
                { id: 702, day: 'Day 7', time: '09:00', title: '心齋橋最後採購 🛍️', location: '藥妝補貨 / 伴手禮', type: '購物' },
                { id: 703, day: 'Day 7', time: '10:00', title: '整理行李 & 退房 🧳', location: '飯店 Lobby', type: '交通' },
                { id: 704, day: 'Day 7', time: '11:00', title: '出發前往機場 ✈️', location: '南海電鐵 Rapit：新今宮 ⮕ 關西機場', type: '交通' },
                { id: 705, day: 'Day 7', time: '12:00', title: '抵達關西機場 🛂', location: '辦理登機 / 免稅店最後逛逛', type: '交通' }
            ];
        }

        if (savedExpenses) expenses.value = JSON.parse(savedExpenses);
        if (savedTransports) transports.value = JSON.parse(savedTransports);
    };

    const saveData = () => {
        localStorage.setItem('osaka_events', JSON.stringify(events.value));
        localStorage.setItem('osaka_expenses', JSON.stringify(expenses.value));
        localStorage.setItem('osaka_transports', JSON.stringify(transports.value));
    };

    watch([events, expenses, transports], saveData, { deep: true });

    // 2. 行程邏輯
    const currentDayEvents = computed(() => {
        return events.value
            .filter(e => e.day === currentDay.value)
            .sort((a, b) => a.time.localeCompare(b.time));
    });

    const addEvent = (evt) => events.value.push({ id: Date.now(), day: currentDay.value, ...evt });
    const updateEvent = (id, updatedEvt) => {
        const idx = events.value.findIndex(e => e.id === id);
        if(idx !== -1) events.value[idx] = { ...events.value[idx], ...updatedEvt };
    };
    const deleteEvent = (id) => events.value = events.value.filter(e => e.id !== id);

    // 3. 預算/分帳邏輯
    const totalExpense = computed(() => expenses.value.reduce((sum, item) => sum + Number(item.amount), 0));
    
    const debts = computed(() => {
        let paid = {};
        members.value.forEach(m => paid[m] = 0);
        expenses.value.forEach(e => {
            if (paid[e.payer] !== undefined) paid[e.payer] += Number(e.amount);
        });

        const total = Object.values(paid).reduce((a, b) => a + b, 0);
        if (total === 0) return [];
        const average = total / members.value.length;

        let balances = members.value.map(m => ({ name: m, balance: paid[m] - average }));

        let result = [];
        let debtors = balances.filter(b => b.balance < -1).sort((a, b) => a.balance - b.balance);
        let creditors = balances.filter(b => b.balance > 1).sort((a, b) => b.balance - a.balance);

        let i = 0, j = 0;
        while (i < debtors.length && j < creditors.length) {
            let debtor = debtors[i];
            let creditor = creditors[j];
            let amount = Math.min(Math.abs(debtor.balance), creditor.balance);
            
            result.push({ from: debtor.name, to: creditor.name, amount: Math.round(amount) });

            debtor.balance += amount;
            creditor.balance -= amount;

            if (Math.abs(debtor.balance) < 1) i++;
            if (creditor.balance < 1) j++;
        }
        return result;
    });

    const addExpense = (exp) => expenses.value.push({ id: Date.now(), ...exp });
    const deleteExpense = (id) => expenses.value = expenses.value.filter(e => e.id !== id);

    // 4. 交通邏輯
    const addTransport = (item) => transports.value.push({ id: Date.now(), ...item });
    const deleteTransport = (id) => transports.value = transports.value.filter(t => t.id !== id);

    // 5. 天氣 API (修改：加入日期區間)
    const fetchWeather = async () => {
        if(weatherForecast.value.length) return;
        try {
            // ✨ 關鍵修改：加上 start_date 與 end_date，鎖定 1/13 ~ 1/19
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${OSAKA_LAT}&longitude=${OSAKA_LON}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&start_date=${TRIP_START_DATE}&end_date=${TRIP_END_DATE}`;
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.daily) weatherForecast.value = data.daily.time.map((t, i) => ({
                date: t, 
                code: data.daily.weathercode[i], 
                max: Math.round(data.daily.temperature_2m_max[i]), 
                min: Math.round(data.daily.temperature_2m_min[i])
            }));
        } catch(e) { console.error(e); }
    };

    return {
        // State
        events, expenses, transports, days, currentDay, members, weatherForecast,
        currentTab, 
        // Getters
        currentDayEvents, totalExpense, debts,
        // Actions
        loadData, saveData, fetchWeather,
        addEvent, updateEvent, deleteEvent,
        addExpense, deleteExpense,
        addTransport, deleteTransport
    };
}