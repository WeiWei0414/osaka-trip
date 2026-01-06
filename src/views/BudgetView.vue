<template>
  <div class="pb-24 space-y-6">
    
    <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <p class="text-sm font-medium opacity-90">旅費總支出 (JPY)</p>
        <h2 class="text-4xl font-bold mt-1">¥ {{ totalExpense.toLocaleString() }}</h2>
        <div class="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm">
            <span>平均每人負擔</span>
            <span class="font-bold">¥ {{ Math.round(totalExpense / members.length || 0).toLocaleString() }}</span>
        </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 class="font-bold text-gray-700 mb-3 border-b pb-2 flex items-center">
            <i class="fa-solid fa-calculator mr-2 text-indigo-500"></i>結算建議
        </h3>
        <ul class="space-y-3">
            <li v-for="(debt, idx) in debts" :key="idx" class="flex justify-between items-center text-sm">
                <span class="text-gray-600 font-medium">
                    {{ debt.from }} <i class="fa-solid fa-arrow-right mx-1 text-gray-400"></i> {{ debt.to }}
                </span>
                <span class="font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                    ¥ {{ debt.amount.toLocaleString() }}
                </span>
            </li>
            <li v-if="debts.length === 0" class="text-gray-400 text-center py-2 text-sm">目前沒有欠款，皆大歡喜！</li>
        </ul>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 class="font-bold text-gray-700 mb-3 text-sm">新增一筆支出</h3>
        <div class="flex gap-2 mb-2">
            <select v-model="newExp.payer" class="w-1/3 border p-2 rounded bg-gray-50 text-sm">
                <option v-for="m in members" :value="m">{{ m }}</option>
            </select>
            <input v-model="newExp.amount" type="number" placeholder="金額" class="flex-1 border p-2 rounded bg-gray-50 text-sm">
        </div>
        <div class="flex gap-2">
            <input v-model="newExp.desc" placeholder="項目 (例: 章魚燒)" class="flex-1 border p-2 rounded bg-gray-50 text-sm">
            <button @click="submitExpense" class="bg-indigo-600 text-white px-4 rounded font-bold text-sm">記帳</button>
        </div>
    </div>

    <div class="space-y-2">
        <h3 class="font-bold text-gray-500 text-xs pl-1">近期紀錄</h3>
        <div v-for="item in expenses.slice().reverse()" :key="item.id" class="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center">
            <div class="flex items-center">
                <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-3">
                    {{ item.payer[0] }}
                </div>
                <div>
                    <p class="font-bold text-gray-800 text-sm">{{ item.desc }}</p>
                    <p class="text-xs text-gray-400">{{ item.payer }} 先付</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-gray-800">¥{{ Number(item.amount).toLocaleString() }}</p>
                <button @click="deleteExpense(item.id)" class="text-xs text-gray-300 hover:text-red-500">刪除</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTripStore } from '../composables/useTripStore';

const { members, expenses, totalExpense, debts, addExpense, deleteExpense } = useTripStore();
const newExp = ref({ payer: '我', amount: '', desc: '' });

const submitExpense = () => {
    if(!newExp.value.amount || !newExp.value.desc) return;
    addExpense({ ...newExp.value });
    newExp.value.amount = ''; 
    newExp.value.desc = '';
};
</script>