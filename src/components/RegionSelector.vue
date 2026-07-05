<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="geo-title"
      >
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" />

        <div class="glass-strong rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl">
          <!-- Step 1: 国内/海外 -->
          <template v-if="step === 1">
            <div class="text-center mb-6">
              <div class="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-500 flex items-center justify-center mx-auto mb-3">
                <svg :width="22" :height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h2 id="geo-title" class="text-xl font-semibold tracking-tight">选择您所在的地区</h2>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                未能自动识别您的位置，请手动选择。
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <button
                class="glass-button rounded-2xl flex flex-col items-center gap-3 p-5 transition-all duration-200"
                @click="selectDomestic"
              >
                <svg :width="32" :height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                     class="text-accent-500">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <polygon points="12 3 21 12 12 21 3 12" fill="currentColor" opacity="0.15" />
                </svg>
                <span class="text-sm font-semibold">国内（含港澳台）</span>
              </button>
              <button
                class="glass-button rounded-2xl flex flex-col items-center gap-3 p-5 transition-all duration-200"
                @click="selectOverseas"
              >
                <svg :width="32" :height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                     class="text-accent-500">
                  <circle cx="12" cy="12" r="10" />
                  <ellipse cx="12" cy="12" rx="4" ry="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
                  <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
                </svg>
                <span class="text-sm font-semibold">海外</span>
              </button>
            </div>

          </template>

          <!-- Step 2: 国内省份 -->
          <template v-if="step === 2 && category === 'domestic'">
            <div class="text-center mb-4">
              <h2 id="geo-title" class="text-xl font-semibold tracking-tight">选择您的省份</h2>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
                请选择您所在的省份或地区。
              </p>
            </div>

            <div class="glass rounded-xl overflow-hidden border border-[var(--glass-border)]">
              <select
                v-model="selectedProvince"
                size="10"
                class="geo-select w-full bg-transparent px-4 py-3 text-sm outline-none
                       [&_option]:py-2 [&_option]:px-2 [&_option]:rounded-lg
                       [&_option]:cursor-pointer
                       [&_option]:text-neutral-800 dark:[&_option]:text-neutral-200
                       [&_option]:bg-transparent
                       [&_option:checked]:bg-accent-100 dark:[&_option:checked]:bg-accent-900/40
                       [&_option:checked]:text-accent-700 dark:[&_option:checked]:text-accent-300
                       [&_option:hover]:bg-neutral-50 dark:[&_option:hover]:bg-neutral-800/40"
              >
                <option value="" disabled>-- 请选择 --</option>
                <option v-for="p in domesticOptions" :key="p.code" :value="p.code">
                  {{ p.label }}
                </option>
              </select>
            </div>

            <div class="flex gap-3 mt-4">
              <button
                class="flex-1 py-3 rounded-xl text-sm font-medium
                       glass-button transition-all duration-200"
                @click="step = 1"
              >
                返回
              </button>
              <button
                :disabled="!selectedProvince"
                class="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200
                       active:scale-[0.98]"
                :class="
                  selectedProvince
                    ? 'bg-accent-500 shadow-sm shadow-accent-500/25 hover:bg-accent-600'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                "
                @click="confirmDomestic"
              >
                确认
              </button>
            </div>
          </template>

          <!-- Step 2: 海外国家 -->
          <template v-if="step === 2 && category === 'overseas'">
            <div class="text-center mb-4">
              <h2 id="geo-title" class="text-xl font-semibold tracking-tight">选择您的国家/地区</h2>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
                Please select your country or region.
              </p>
            </div>

            <div class="glass rounded-xl overflow-hidden border border-[var(--glass-border)]">
              <select
                v-model="selectedCountry"
                size="12"
                class="geo-select w-full bg-transparent px-4 py-3 text-sm outline-none
                       [&_option]:py-2 [&_option]:px-2 [&_option]:rounded-lg
                       [&_option]:cursor-pointer
                       [&_option]:text-neutral-800 dark:[&_option]:text-neutral-200
                       [&_option]:bg-transparent
                       [&_option:checked]:bg-accent-100 dark:[&_option:checked]:bg-accent-900/40
                       [&_option:checked]:text-accent-700 dark:[&_option:checked]:text-accent-300
                       [&_option:hover]:bg-neutral-50 dark:[&_option:hover]:bg-neutral-800/40"
              >
                <option value="" disabled>-- Select Country --</option>
                <option v-for="c in overseasOptions" :key="c.code" :value="c.code">
                  {{ c.label }}
                </option>
              </select>
            </div>

            <div class="flex gap-3 mt-4">
              <button
                class="flex-1 py-3 rounded-xl text-sm font-medium
                       glass-button transition-all duration-200"
                @click="step = 1"
              >
                返回
              </button>
              <button
                :disabled="!selectedCountry"
                class="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200
                       active:scale-[0.98]"
                :class="
                  selectedCountry
                    ? 'bg-accent-500 shadow-sm shadow-accent-500/25 hover:bg-accent-600'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                "
                @click="confirmOverseas"
              >
                确认
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { updateUserGeo } from '@/api/records'

const props = defineProps<{ userId: string }>()

const emit = defineEmits<{
  confirmed: []
}>()

const store = useChatStore()

const visible = ref(true)
const step = ref(1)
const category = ref<'domestic' | 'overseas' | null>(null)
const selectedProvince = ref('')
const selectedCountry = ref('')

interface GeoOption {
  code: string
  label: string
}

const domesticOptions: GeoOption[] = [
  { code: 'AH', label: '安徽省' },
  { code: 'BJ', label: '北京市' },
  { code: 'CQ', label: '重庆市' },
  { code: 'FJ', label: '福建省' },
  { code: 'GS', label: '甘肃省' },
  { code: 'GD', label: '广东省' },
  { code: 'GX', label: '广西壮族自治区' },
  { code: 'GZ', label: '贵州省' },
  { code: 'HI', label: '海南省' },
  { code: 'HE', label: '河北省' },
  { code: 'HL', label: '黑龙江省' },
  { code: 'HA', label: '河南省' },
  { code: 'HB', label: '湖北省' },
  { code: 'HN', label: '湖南省' },
  { code: 'JS', label: '江苏省' },
  { code: 'JX', label: '江西省' },
  { code: 'JL', label: '吉林省' },
  { code: 'LN', label: '辽宁省' },
  { code: 'NM', label: '内蒙古自治区' },
  { code: 'NX', label: '宁夏回族自治区' },
  { code: 'QH', label: '青海省' },
  { code: 'SN', label: '陕西省' },
  { code: 'SD', label: '山东省' },
  { code: 'SH', label: '上海市' },
  { code: 'SX', label: '山西省' },
  { code: 'SC', label: '四川省' },
  { code: 'TJ', label: '天津市' },
  { code: 'XZ', label: '西藏自治区' },
  { code: 'XJ', label: '新疆维吾尔自治区' },
  { code: 'YN', label: '云南省' },
  { code: 'ZJ', label: '浙江省' },
  { code: 'HK', label: '香港特别行政区' },
  { code: 'MO', label: '澳门特别行政区' },
  { code: 'TW', label: '台湾省' },
]

const provinceNameMap: Record<string, string> = {}
domesticOptions.forEach((p) => { provinceNameMap[p.code] = p.label })

const provinceCountryMap: Record<string, { code: string; name: string }> = {
  HK: { code: 'HK', name: '中国香港' },
  MO: { code: 'MO', name: '中国澳门' },
  TW: { code: 'TW', name: '中国台湾' },
}

const overseasOptions: GeoOption[] = [
  { code: 'AF', label: 'Afghanistan (AF)' },
  { code: 'AL', label: 'Albania (AL)' },
  { code: 'DZ', label: 'Algeria (DZ)' },
  { code: 'AD', label: 'Andorra (AD)' },
  { code: 'AO', label: 'Angola (AO)' },
  { code: 'AR', label: 'Argentina (AR)' },
  { code: 'AM', label: 'Armenia (AM)' },
  { code: 'AU', label: 'Australia (AU)' },
  { code: 'AT', label: 'Austria (AT)' },
  { code: 'AZ', label: 'Azerbaijan (AZ)' },
  { code: 'BS', label: 'Bahamas (BS)' },
  { code: 'BH', label: 'Bahrain (BH)' },
  { code: 'BD', label: 'Bangladesh (BD)' },
  { code: 'BB', label: 'Barbados (BB)' },
  { code: 'BY', label: 'Belarus (BY)' },
  { code: 'BE', label: 'Belgium (BE)' },
  { code: 'BZ', label: 'Belize (BZ)' },
  { code: 'BJ', label: 'Benin (BJ)' },
  { code: 'BT', label: 'Bhutan (BT)' },
  { code: 'BO', label: 'Bolivia (BO)' },
  { code: 'BA', label: 'Bosnia and Herzegovina (BA)' },
  { code: 'BW', label: 'Botswana (BW)' },
  { code: 'BR', label: 'Brazil (BR)' },
  { code: 'BN', label: 'Brunei (BN)' },
  { code: 'BG', label: 'Bulgaria (BG)' },
  { code: 'BF', label: 'Burkina Faso (BF)' },
  { code: 'BI', label: 'Burundi (BI)' },
  { code: 'KH', label: 'Cambodia (KH)' },
  { code: 'CM', label: 'Cameroon (CM)' },
  { code: 'CA', label: 'Canada (CA)' },
  { code: 'CV', label: 'Cape Verde (CV)' },
  { code: 'CF', label: 'Central African Republic (CF)' },
  { code: 'TD', label: 'Chad (TD)' },
  { code: 'CL', label: 'Chile (CL)' },
  { code: 'CO', label: 'Colombia (CO)' },
  { code: 'KM', label: 'Comoros (KM)' },
  { code: 'CG', label: 'Congo (CG)' },
  { code: 'CD', label: 'Congo, DR (CD)' },
  { code: 'CR', label: 'Costa Rica (CR)' },
  { code: 'CI', label: "Côte d'Ivoire (CI)" },
  { code: 'HR', label: 'Croatia (HR)' },
  { code: 'CU', label: 'Cuba (CU)' },
  { code: 'CY', label: 'Cyprus (CY)' },
  { code: 'CZ', label: 'Czechia (CZ)' },
  { code: 'DK', label: 'Denmark (DK)' },
  { code: 'DJ', label: 'Djibouti (DJ)' },
  { code: 'DO', label: 'Dominican Republic (DO)' },
  { code: 'EC', label: 'Ecuador (EC)' },
  { code: 'EG', label: 'Egypt (EG)' },
  { code: 'SV', label: 'El Salvador (SV)' },
  { code: 'GQ', label: 'Equatorial Guinea (GQ)' },
  { code: 'ER', label: 'Eritrea (ER)' },
  { code: 'EE', label: 'Estonia (EE)' },
  { code: 'SZ', label: 'Eswatini (SZ)' },
  { code: 'ET', label: 'Ethiopia (ET)' },
  { code: 'FJ', label: 'Fiji (FJ)' },
  { code: 'FI', label: 'Finland (FI)' },
  { code: 'FR', label: 'France (FR)' },
  { code: 'GA', label: 'Gabon (GA)' },
  { code: 'GM', label: 'Gambia (GM)' },
  { code: 'GE', label: 'Georgia (GE)' },
  { code: 'DE', label: 'Germany (DE)' },
  { code: 'GH', label: 'Ghana (GH)' },
  { code: 'GR', label: 'Greece (GR)' },
  { code: 'GT', label: 'Guatemala (GT)' },
  { code: 'GN', label: 'Guinea (GN)' },
  { code: 'GW', label: 'Guinea-Bissau (GW)' },
  { code: 'GY', label: 'Guyana (GY)' },
  { code: 'HT', label: 'Haiti (HT)' },
  { code: 'HN', label: 'Honduras (HN)' },
  { code: 'HU', label: 'Hungary (HU)' },
  { code: 'IS', label: 'Iceland (IS)' },
  { code: 'IN', label: 'India (IN)' },
  { code: 'ID', label: 'Indonesia (ID)' },
  { code: 'IR', label: 'Iran (IR)' },
  { code: 'IQ', label: 'Iraq (IQ)' },
  { code: 'IE', label: 'Ireland (IE)' },
  { code: 'IL', label: 'Israel (IL)' },
  { code: 'IT', label: 'Italy (IT)' },
  { code: 'JM', label: 'Jamaica (JM)' },
  { code: 'JP', label: 'Japan (JP)' },
  { code: 'JO', label: 'Jordan (JO)' },
  { code: 'KZ', label: 'Kazakhstan (KZ)' },
  { code: 'KE', label: 'Kenya (KE)' },
  { code: 'KI', label: 'Kiribati (KI)' },
  { code: 'KP', label: 'Korea, North (KP)' },
  { code: 'KR', label: 'Korea, South (KR)' },
  { code: 'KW', label: 'Kuwait (KW)' },
  { code: 'KG', label: 'Kyrgyzstan (KG)' },
  { code: 'LA', label: 'Laos (LA)' },
  { code: 'LV', label: 'Latvia (LV)' },
  { code: 'LB', label: 'Lebanon (LB)' },
  { code: 'LS', label: 'Lesotho (LS)' },
  { code: 'LR', label: 'Liberia (LR)' },
  { code: 'LY', label: 'Libya (LY)' },
  { code: 'LI', label: 'Liechtenstein (LI)' },
  { code: 'LT', label: 'Lithuania (LT)' },
  { code: 'LU', label: 'Luxembourg (LU)' },
  { code: 'MG', label: 'Madagascar (MG)' },
  { code: 'MW', label: 'Malawi (MW)' },
  { code: 'MY', label: 'Malaysia (MY)' },
  { code: 'MV', label: 'Maldives (MV)' },
  { code: 'ML', label: 'Mali (ML)' },
  { code: 'MT', label: 'Malta (MT)' },
  { code: 'MR', label: 'Mauritania (MR)' },
  { code: 'MU', label: 'Mauritius (MU)' },
  { code: 'MX', label: 'Mexico (MX)' },
  { code: 'FM', label: 'Micronesia (FM)' },
  { code: 'MD', label: 'Moldova (MD)' },
  { code: 'MC', label: 'Monaco (MC)' },
  { code: 'MN', label: 'Mongolia (MN)' },
  { code: 'ME', label: 'Montenegro (ME)' },
  { code: 'MA', label: 'Morocco (MA)' },
  { code: 'MZ', label: 'Mozambique (MZ)' },
  { code: 'MM', label: 'Myanmar (MM)' },
  { code: 'NA', label: 'Namibia (NA)' },
  { code: 'NP', label: 'Nepal (NP)' },
  { code: 'NL', label: 'Netherlands (NL)' },
  { code: 'NZ', label: 'New Zealand (NZ)' },
  { code: 'NI', label: 'Nicaragua (NI)' },
  { code: 'NE', label: 'Niger (NE)' },
  { code: 'NG', label: 'Nigeria (NG)' },
  { code: 'MK', label: 'North Macedonia (MK)' },
  { code: 'NO', label: 'Norway (NO)' },
  { code: 'OM', label: 'Oman (OM)' },
  { code: 'PK', label: 'Pakistan (PK)' },
  { code: 'PS', label: 'Palestine (PS)' },
  { code: 'PA', label: 'Panama (PA)' },
  { code: 'PG', label: 'Papua New Guinea (PG)' },
  { code: 'PY', label: 'Paraguay (PY)' },
  { code: 'PE', label: 'Peru (PE)' },
  { code: 'PH', label: 'Philippines (PH)' },
  { code: 'PL', label: 'Poland (PL)' },
  { code: 'PT', label: 'Portugal (PT)' },
  { code: 'QA', label: 'Qatar (QA)' },
  { code: 'RO', label: 'Romania (RO)' },
  { code: 'RU', label: 'Russia (RU)' },
  { code: 'RW', label: 'Rwanda (RW)' },
  { code: 'SA', label: 'Saudi Arabia (SA)' },
  { code: 'SN', label: 'Senegal (SN)' },
  { code: 'RS', label: 'Serbia (RS)' },
  { code: 'SC', label: 'Seychelles (SC)' },
  { code: 'SL', label: 'Sierra Leone (SL)' },
  { code: 'SG', label: 'Singapore (SG)' },
  { code: 'SK', label: 'Slovakia (SK)' },
  { code: 'SI', label: 'Slovenia (SI)' },
  { code: 'SB', label: 'Solomon Islands (SB)' },
  { code: 'SO', label: 'Somalia (SO)' },
  { code: 'ZA', label: 'South Africa (ZA)' },
  { code: 'SS', label: 'South Sudan (SS)' },
  { code: 'ES', label: 'Spain (ES)' },
  { code: 'LK', label: 'Sri Lanka (LK)' },
  { code: 'SD', label: 'Sudan (SD)' },
  { code: 'SR', label: 'Suriname (SR)' },
  { code: 'SE', label: 'Sweden (SE)' },
  { code: 'CH', label: 'Switzerland (CH)' },
  { code: 'SY', label: 'Syria (SY)' },
  { code: 'TJ', label: 'Tajikistan (TJ)' },
  { code: 'TZ', label: 'Tanzania (TZ)' },
  { code: 'TH', label: 'Thailand (TH)' },
  { code: 'TL', label: 'Timor-Leste (TL)' },
  { code: 'TG', label: 'Togo (TG)' },
  { code: 'TO', label: 'Tonga (TO)' },
  { code: 'TT', label: 'Trinidad and Tobago (TT)' },
  { code: 'TN', label: 'Tunisia (TN)' },
  { code: 'TR', label: 'Turkey (TR)' },
  { code: 'TM', label: 'Turkmenistan (TM)' },
  { code: 'UG', label: 'Uganda (UG)' },
  { code: 'UA', label: 'Ukraine (UA)' },
  { code: 'AE', label: 'United Arab Emirates (AE)' },
  { code: 'GB', label: 'United Kingdom (GB)' },
  { code: 'US', label: 'United States (US)' },
  { code: 'UY', label: 'Uruguay (UY)' },
  { code: 'UZ', label: 'Uzbekistan (UZ)' },
  { code: 'VU', label: 'Vanuatu (VU)' },
  { code: 'VE', label: 'Venezuela (VE)' },
  { code: 'VN', label: 'Vietnam (VN)' },
  { code: 'YE', label: 'Yemen (YE)' },
  { code: 'ZM', label: 'Zambia (ZM)' },
  { code: 'ZW', label: 'Zimbabwe (ZW)' },
]

function selectDomestic() {
  category.value = 'domestic'
  step.value = 2
}

function selectOverseas() {
  category.value = 'overseas'
  step.value = 2
}

async function confirmDomestic() {
  const code = selectedProvince.value
  if (!code) return

  const provinceName = provinceNameMap[code]
  const country = provinceCountryMap[code]

  let countryCode: string
  let countryName: string
  let regionValue: string

  if (country) {
    countryCode = country.code
    countryName = country.name
    regionValue = provinceName
  } else {
    countryCode = 'CN'
    countryName = '中国'
    regionValue = provinceName
  }

  try {
    await updateUserGeo({
      user_id: props.userId,
      region: regionValue,
      country_code: countryCode,
      country_name: countryName,
    })
    store.setUserGeo(regionValue, countryCode, countryName, true)
    emit('confirmed')
  } catch {
    emit('confirmed')
  }
}

async function confirmOverseas() {
  const code = selectedCountry.value
  if (!code) return

  const countryOption = overseasOptions.find((c) => c.code === code)
  const countryName = countryOption
    ? countryOption.label.replace(/\s*\([A-Z]{2}\)\s*$/, '')
    : code

  try {
    await updateUserGeo({
      user_id: props.userId,
      region: '海外',
      country_code: code,
      country_name: countryName,
    })
    store.setUserGeo('海外', code, countryName, true)
    emit('confirmed')
  } catch {
    emit('confirmed')
  }
}
</script>

<style>
.geo-select::-webkit-scrollbar {
  width: 5px;
}

.geo-select::-webkit-scrollbar-track {
  background: transparent;
}

.geo-select::-webkit-scrollbar-thumb {
  background: var(--color-accent-200);
  border-radius: var(--radius-sm);
}

.geo-select::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent-300);
}

.dark .geo-select::-webkit-scrollbar-thumb {
  background: var(--color-accent-700);
}

.dark .geo-select::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent-600);
}
</style>
