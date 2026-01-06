<template>
  <div class="pb-24">
    <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
        <div class="flex gap-2 mb-2">
            <input v-model="form.from" placeholder="出發地" class="w-1/2 border-0 p-2 rounded shadow-sm text-sm">
            <input v-model="form.to" placeholder="目的地" class="w-1/2 border-0 p-2 rounded shadow-sm text-sm">
        </div>
        <div class="flex gap-2">
            <input v-model="form.time" type="time" class="w-1/3 border-0 p-2 rounded shadow-sm text-sm">
            <input v-model="form.note" placeholder="備註 (車次)" class="flex-1 border-0 p-2 rounded shadow-sm text-sm">
            <button @click="handleAdd" class="bg-indigo-600 text-white px-3 rounded shadow-sm"><i class="fa-solid fa-plus"></i></button>
        </div>
    </div>

    <div class="space-y-4">
        <div v-for="item in transports" :key="item.id" class="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-4 relative">
            
            <button @click="deleteTransport(item.id)" class="absolute top-2 right-3 text-gray-300 hover:text-red-500"><i class="fa-solid fa-xmark"></i></button>

            <div class="flex items-center text-gray-800 font-bold text-lg mb-2">
                <span>{{ item.from }}</span>
                <i class="fa-solid fa-arrow-right mx-3 text-gray-400 text-sm"></i>
                <span>{{ item.to }}</span>
            </div>

            <div class="flex gap-3 text-xs text-gray-500 mb-3">
                <span class="bg-gray-100 px-2 py-1 rounded"><i class="fa-regular fa-clock mr-1"></i>{{ item.time }}</span>
                <span v-if="item.note" class="bg-gray-100 px-2 py-1 rounded">{{ item.note }}</span>
            </div>

            <a :href="getMapLink(item.from, item.to)" target="_blank" 
               class="block w-full text-center py-2 rounded-lg border border-indigo-500 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors">
               <i class="fa-solid fa-map-location-dot mr-2"></i>開啟 Google 導航
            </a>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTripStore } from '../composables/useTripStore';

const { transports, addTransport, deleteTransport } = useTripStore();
const form = ref({ from: '', to: '', time: '10:00', note: '' });

const handleAdd = () => {
    if(!form.value.from || !form.value.to) return;
    addTransport({ ...form.value });
    form.value = { from: '', to: '', time: '10:00', note: '' };
};

const getMapLink = (from, to) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=transit`;
};
</script>