<template>
  <div class="h-full flex flex-col p-5 gap-4 pb-24">
    
    <div class="flex justify-between items-center px-1">
        <h2 class="text-xl font-black text-gray-800 tracking-tight">中日翻譯</h2>
        <div class="text-xs font-bold text-sky-500 bg-sky-50 px-3 py-1 rounded-full">
            繁體中文 <i class="fa-solid fa-arrow-right mx-1"></i> 日文
        </div>
    </div>

    <div class="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex-1 flex flex-col relative group focus-within:ring-2 focus-within:ring-sky-200 transition-all">
        <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-gray-400">輸入內容</span>
            <button v-if="inputText" @click="clearText" class="text-gray-300 hover:text-gray-500 transition-colors">
                <i class="fa-solid fa-circle-xmark"></i>
            </button>
        </div>
        <textarea 
            v-model="inputText"
            class="w-full flex-1 bg-transparent border-0 p-0 text-lg font-medium text-gray-800 focus:ring-0 resize-none placeholder-gray-300 leading-relaxed" 
            placeholder="">
        </textarea>
        
        <div class="absolute bottom-4 right-4">
             <button @click="startSpeechToText" 
                :class="isListening ? 'bg-red-500 animate-pulse text-white shadow-red-200' : 'bg-gray-100 text-gray-400 hover:bg-sky-50 hover:text-sky-500'"
                class="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm">
                <i :class="isListening ? 'fa-solid fa-microphone-lines' : 'fa-solid fa-microphone'"></i>
             </button>
        </div>
    </div>

    <div class="flex justify-center -my-2 z-10">
        <button @click="handleTranslate" 
                :disabled="isLoading || !inputText"
                class="bg-sky-500 text-white w-14 h-14 rounded-full shadow-lg shadow-sky-200 flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100">
            <i v-if="isLoading" class="fa-solid fa-circle-notch fa-spin"></i>
            <i v-else class="fa-solid fa-arrow-down"></i>
        </button>
    </div>

    <div class="bg-sky-50 rounded-3xl p-5 shadow-inner border border-sky-100 flex-1 flex flex-col relative transition-all">
        <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-sky-600">翻譯結果</span>
            <div class="flex gap-2">
                
                <button v-if="outputText" @click="copyText" 
                        class="px-2 transition-transform active:scale-90 flex items-center gap-1"
                        :class="isCopied ? 'text-green-500' : 'text-sky-400 hover:text-sky-600'"
                        :title="isCopied ? '已複製' : '複製內容'">
                    <i :class="isCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'"></i>
                    <span v-if="isCopied" class="text-[10px] font-bold">已複製</span>
                </button>

                <button v-if="outputText" @click="speakText" class="text-sky-400 hover:text-sky-600 px-2 active:scale-90 transition-transform" title="朗讀">
                    <i class="fa-solid fa-volume-high"></i>
                </button>
            </div>
        </div>
        
        <div class="flex-1 overflow-y-auto flex flex-col justify-center">
            <p v-if="outputText" class="text-2xl font-bold text-gray-800 leading-relaxed break-all">{{ outputText }}</p>
            <div v-else class="flex flex-col items-center justify-center text-gray-300 opacity-60">
                <i class="fa-solid fa-language text-4xl mb-2"></i>
                <p class="text-sm">等待翻譯...</p>
            </div>
        </div>
        
        <p v-if="outputText" class="mt-3 text-[10px] text-sky-400/60 font-mono border-t border-sky-200/50 pt-2 text-center">
           Google Translate • 自動偵測
        </p>
    </div>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const inputText = ref('');
const outputText = ref('');
const isLoading = ref(false);
const isListening = ref(false);
const isCopied = ref(false);
let debounceTimer = null;

watch(inputText, (newVal) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!newVal.trim()) {
        outputText.value = '';
        return;
    }
    debounceTimer = setTimeout(() => {
        handleTranslate();
    }, 800);
});

const clearText = () => {
    inputText.value = '';
    outputText.value = '';
    isCopied.value = false;
};

// 1. Google GTX 翻譯
const handleTranslate = async () => {
    if (!inputText.value.trim()) return;
    isLoading.value = true;
    isCopied.value = false;
    
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-TW&tl=ja&dt=t&q=${encodeURIComponent(inputText.value)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data[0]) {
            outputText.value = data[0].map(item => item[0]).join('');
        }
    } catch (e) {
        console.error(e);
        outputText.value = "翻譯失敗，請檢查網路 😢";
    } finally {
        isLoading.value = false;
    }
};

// 2. 文字轉語音
const speakText = () => {
    if (!outputText.value) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(outputText.value);
    utterance.lang = 'ja-JP'; 
    utterance.rate = 0.9; 
    window.speechSynthesis.speak(utterance);
};

// ✨ 3. 萬能複製 (支援 HTTP 和 HTTPS) ✨
const copyText = async () => {
    if (!outputText.value) return;

    // 定義一個成功後的動畫函式
    const triggerSuccess = () => {
        isCopied.value = true;
        setTimeout(() => { isCopied.value = false; }, 2000);
    };

    // A計畫：嘗試使用新版 API (如果在 localhost 或 HTTPS 環境)
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(outputText.value);
            triggerSuccess();
            return; // 成功就結束
        } catch (err) {
            console.warn('標準 API 複製失敗，切換至 B 計畫', err);
        }
    }

    // B計畫：傳統相容模式 (如果在 HTTP 開發環境)
    // 原理：偷偷建立一個輸入框 -> 選取文字 -> 執行瀏覽器的 Copy 指令
    const textArea = document.createElement("textarea");
    textArea.value = outputText.value;
    
    // 讓輸入框隱形但仍存在於畫面上 (fixed 避免影響版面)
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            triggerSuccess();
        } else {
            alert('瀏覽器阻擋複製，請長按文字手動複製');
        }
    } catch (err) {
        console.error('複製失敗', err);
        alert('複製失敗');
    }
    
    // 用完記得丟掉
    document.body.removeChild(textArea);
};

// 4. 語音輸入
const startSpeechToText = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('您的瀏覽器不支援語音輸入');
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.interimResults = false;
    recognition.onstart = () => { isListening.value = true; };
    recognition.onend = () => { isListening.value = false; };
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        inputText.value = transcript; 
    };
    recognition.start();
};
</script>