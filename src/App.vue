<template>
  <div class="w-full max-w-md mx-auto h-screen bg-gray-100 flex flex-col relative overflow-hidden font-sans">
    
    <header class="bg-sky-500 text-white py-3 px-5 shadow-sm z-10 flex justify-between items-center">
        <div class="flex items-center gap-2">
            <div class="bg-white/20 p-2 rounded-full w-8 h-8 flex items-center justify-center">
                <i class="fa-solid fa-plane text-sm"></i>
            </div>
            <div>
                <h1 class="text-base font-bold leading-tight">大阪之旅</h1>
                <p class="text-[10px] text-sky-100 opacity-90">Let's go to Osaka!</p>
            </div>
        </div>
        
        <button @click="resetData" class="text-[10px] border border-white/30 hover:bg-white/10 px-3 py-1 rounded-full transition-colors">
            重置
        </button>
    </header>

    <main class="flex-1 overflow-y-auto hide-scrollbar p-4">
      <KeepAlive>
        <component :is="activeView" />
      </KeepAlive>
    </main>

    <nav class="bg-white border-t border-gray-200 flex justify-around items-center h-[70px] z-50 pb-safe">
       <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id" 
               class="flex flex-col items-center w-full group py-1">
           <i :class="[tab.icon, currentTab === tab.id ? 'text-sky-500' : 'text-gray-400']" 
              class="text-lg mb-1 transition-colors"></i>
           <span :class="[currentTab === tab.id ? 'text-sky-500 font-bold' : 'text-gray-400 font-medium']"
                 class="text-[10px]">{{ tab.label }}</span>
       </button>
    </nav>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTripStore } from './composables/useTripStore';
import ItineraryView from './views/ItineraryView.vue';
import BudgetView from './views/BudgetView.vue';
import TransportView from './views/TransportView.vue';
import TranslationView from './views/TranslationView.vue'; // 👈 1. 新增引入

const store = useTripStore();
onMounted(() => {
    store.loadData();
    store.fetchWeather();
});

const currentTab = ref('itinerary');

const tabs = [
  { id: 'itinerary', label: '行程', icon: 'fa-solid fa-list-check' },
  { id: 'budget', label: '預算', icon: 'fa-solid fa-wallet' },
  { id: 'transport', label: '交通', icon: 'fa-solid fa-train-subway' },
  { id: 'translation', label: '翻譯', icon: 'fa-solid fa-language' }, // 👈 2. 新增分頁按鈕
];

const activeView = computed(() => {
    const views = {
        'itinerary': ItineraryView,
        'budget': BudgetView,
        'transport': TransportView,
        'translation': TranslationView, // 👈 3. 新增對應元件
    };
    return views[currentTab.value];
});

// 重置功能 (保持不變)
const resetData = () => {
    if(confirm('確定要重置並載入預設行程嗎？(目前的修改會消失)')) {
        localStorage.removeItem('osaka_events');
        localStorage.removeItem('osaka_expenses');
        localStorage.removeItem('osaka_transports');
        location.reload();
    }
};
</script>