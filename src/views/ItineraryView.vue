<template>
  <div class="pb-24">
    
    <div class="flex space-x-2 mb-6 overflow-x-auto hide-scrollbar pb-1 px-1">
        <button v-for="day in days" :key="day" @click="currentDay = day"
            :class="['px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border', 
                     currentDay === day ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-400 border-gray-200']">
            {{ day }}
        </button>
    </div>

    <div v-if="weatherDisplay" class="bg-white rounded-3xl p-6 shadow-sm mb-8 flex justify-between items-center relative overflow-hidden">
        <div class="z-10 relative">
            <h2 class="text-3xl font-black text-gray-800 tracking-tight font-sans">
                {{ weatherDisplay.dateStr }} 
                <span class="text-lg font-medium text-gray-400 ml-1">({{ weatherDisplay.dayOfWeek }})</span>
            </h2>
            <p class="text-xs text-gray-500 mt-2 font-medium tracking-wide border-t border-gray-100 pt-2 inline-block">
                {{ daySummary }}
            </p>
        </div>
        <div class="text-right z-10">
            <div class="flex items-center justify-end gap-3">
                <i :class="weatherDisplay.icon" class="text-3xl" :style="{ color: weatherDisplay.iconColor }"></i>
                <span class="text-4xl font-black text-indigo-600">{{ weatherDisplay.max }}°</span>
            </div>
            <p class="text-[10px] text-gray-400 mt-1 flex items-center justify-end">
                <i class="fa-solid fa-location-dot mr-1"></i>大阪現在
            </p>
        </div>
    </div>
    
    <div v-else class="bg-white rounded-3xl p-6 shadow-sm mb-8 flex justify-center items-center h-[120px] text-gray-300">
        <i class="fa-solid fa-circle-notch fa-spin mr-2"></i>載入天氣中...
    </div>

    <div class="space-y-6">
        <div v-if="currentDayEvents.length === 0" class="text-center text-gray-400 mt-10">
            <p>點擊右下角 + 新增行程</p>
        </div>

        <div v-for="event in currentDayEvents" :key="event.id" class="relative pl-5 group">
            <div class="absolute left-[7px] top-4 bottom-[-24px] w-[2px] bg-gray-100 group-last:bottom-auto group-last:h-full"></div>
            <div :class="getTypeColor(event.type).bg" class="absolute left-0 top-4 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10"></div>

            <div @click="openEdit(event)" 
                 class="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 ml-6 active:scale-[0.98] transition-all cursor-pointer hover:shadow-md relative">
                
                <div class="flex justify-between items-center mb-2">
                    <span class="font-bold text-lg text-gray-800 font-sans">{{ event.time }}</span>
                    
                    <div class="flex items-center gap-3">
                        <a :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`" 
                           target="_blank"
                           @click.stop 
                           class="text-gray-300 hover:text-red-500 transition-colors text-lg"
                           title="在 Google Map 查看">
                            <i class="fa-solid fa-map-location-dot"></i>
                        </a>

                        <span :class="[getTypeColor(event.type).bg, 'text-[10px] pl-2 pr-3 py-1 rounded-full text-white font-bold opacity-90 shadow-sm flex items-center gap-1.5']">
                            <i :class="getTypeIcon(event.type)"></i>
                            {{ event.type }}
                        </span>
                    </div>
                </div>

                <h3 class="text-base font-bold text-gray-700 leading-snug">{{ event.title }}</h3>
                <p class="text-gray-400 text-xs flex items-center mt-1.5">
                    <i class="fa-solid fa-location-dot mr-1.5 opacity-70"></i> {{ event.location }}
                </p>
                <p v-if="event.note" class="text-gray-400 text-xs flex items-center mt-1">
                    <i class="fa-solid fa-note-sticky mr-1.5 opacity-70"></i> {{ event.note }}
                </p>
            </div>
        </div>
    </div>

    <button @click="openAdd" class="absolute bottom-24 right-6 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-xl shadow-indigo-200 flex items-center justify-center text-2xl z-20 hover:scale-110 transition-transform">
        <i class="fa-solid fa-plus"></i>
    </button>

    <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        
        <div class="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-bounce-up max-h-[90vh] overflow-y-auto hide-scrollbar">
            
            <h3 class="text-xl font-bold mb-6 text-gray-800">{{ isEdit ? '編輯行程' : '新增行程' }}</h3>
            
            <div class="space-y-4">
                <div class="bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <input v-model="form.title" class="w-full bg-transparent border-0 p-3 text-gray-800 font-bold focus:ring-0 placeholder-gray-400" placeholder="行程名稱 (例: 環球影城)">
                </div>
                
                <div class="flex gap-3">
                    <input v-model="form.time" type="time" class="flex-1 bg-gray-50 border-gray-100 rounded-xl p-3 text-center font-bold text-gray-700">
                    <select v-model="form.type" class="flex-1 bg-gray-50 border-gray-100 rounded-xl p-3 text-center font-bold text-gray-700">
                        <option value="景點">景點</option><option value="美食">美食</option>
                        <option value="購物">購物</option><option value="交通">交通</option>
                    </select>
                </div>

                <div class="bg-gray-50 p-1 rounded-xl border border-gray-100 flex items-center px-3">
                    <i class="fa-solid fa-location-dot text-gray-400 mr-2 w-4 text-center"></i>
                    <input v-model="form.location" class="w-full bg-transparent border-0 p-3 text-sm focus:ring-0 text-gray-700" placeholder="地點名稱 (例: 梅田藍天大廈)">
                </div>

                <div class="bg-gray-50 p-1 rounded-xl border border-gray-100 flex items-start px-3 py-1">
                    <i class="fa-regular fa-note-sticky text-gray-400 mr-2 w-4 text-center mt-3"></i>
                    <textarea v-model="form.note" rows="2" class="w-full bg-transparent border-0 p-3 text-sm focus:ring-0 text-gray-700 resize-none" placeholder="備註筆記 (例: 記得帶護照)..."></textarea>
                </div>
            </div>

            <div class="flex gap-3 mt-8">
                <button v-if="isEdit" @click="handleDelete" class="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><i class="fa-solid fa-trash"></i></button>
                <button @click="showModal = false" class="flex-1 h-12 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200">取消</button>
                <button @click="handleSubmit" class="flex-1 h-12 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700">儲存</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useTripStore } from '../composables/useTripStore';

const { days, currentDay, currentDayEvents, addEvent, updateEvent, deleteEvent, weatherForecast } = useTripStore();

const showModal = ref(false);
const isEdit = ref(false);
const editId = ref(null);
const form = reactive({ title: '', time: '09:00', location: '', type: '景點', note: '' });

watch(showModal, (newVal) => {
    document.body.style.overflow = newVal ? 'hidden' : '';
});

// 計算每日摘要
const daySummary = computed(() => {
    if (currentDayEvents.value.length === 0) return '本日尚無行程';
    const titles = currentDayEvents.value.slice(0, 2).map(e => e.title.replace(/[\u{1F600}-\u{1F6FF}]/gu, '').split(' ')[0]);
    return titles.join(' & ') + (currentDayEvents.value.length > 2 ? '...' : '');
});

// 天氣顯示
const weatherDisplay = computed(() => {
    const dayIndex = parseInt(currentDay.value.replace('Day ', '')) - 1;
    if (!weatherForecast.value || !weatherForecast.value[dayIndex]) return null;
    const w = weatherForecast.value[dayIndex];
    const code = w.code;
    let icon = 'fa-solid fa-cloud';
    let iconColor = '#9CA3AF';
    if (code <= 1) { icon = 'fa-solid fa-sun'; iconColor = '#FB923C'; }
    else if (code <= 3) { icon = 'fa-solid fa-cloud-sun'; iconColor = '#FBBF24'; }
    else if (code >= 51 && code <= 67) { icon = 'fa-solid fa-cloud-rain'; iconColor = '#60A5FA'; }
    else if (code >= 80) { icon = 'fa-solid fa-bolt'; iconColor = '#818CF8'; }
    else if (code >= 45) { icon = 'fa-solid fa-smog'; iconColor = '#94A3B8'; }
    const dateObj = new Date(w.date);
    const dateStr = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}`;
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const dayOfWeek = weekDays[dateObj.getDay()];
    return { dateStr, dayOfWeek, max: w.max, icon, iconColor };
});

// ✨ 修復重點：改用完整字串，讓 Tailwind 讀得懂 ✨
const getTypeColor = (type) => {
    const map = {
        '景點': 'bg-pink-500', 
        '美食': 'bg-orange-500', 
        '購物': 'bg-purple-500', 
        '交通': 'bg-blue-500' 
    };
    // 預設給灰色
    return { bg: map[type] || 'bg-gray-400' };
};

// ✨ 新增：類型對應圖示 ✨
const getTypeIcon = (type) => {
    const map = {
        '景點': 'fa-solid fa-camera',
        '美食': 'fa-solid fa-utensils',
        '購物': 'fa-solid fa-bag-shopping',
        '交通': 'fa-solid fa-train-subway'
    };
    return map[type] || 'fa-solid fa-circle';
};

const openAdd = () => {
    isEdit.value = false;
    Object.assign(form, { title: '', time: '09:00', location: '', type: '景點', note: '' });
    showModal.value = true;
};

const openEdit = (event) => {
    isEdit.value = true;
    editId.value = event.id;
    Object.assign(form, { note: '', ...event });
    showModal.value = true;
};

const handleSubmit = () => {
    if(!form.title) return;
    if(isEdit.value) updateEvent(editId.value, { ...form });
    else addEvent({ ...form });
    showModal.value = false;
};

const handleDelete = () => {
    if(confirm('確定刪除嗎？')) {
        deleteEvent(editId.value);
        showModal.value = false;
    }
};
</script>