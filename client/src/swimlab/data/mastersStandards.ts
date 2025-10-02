/**
 * SwimLab PRO Kit Q3 - 마스터즈 기준 데이터
 * 
 * 국내/국제 마스터즈 기준과 CSV 업로드 기능
 */

import { MastersStandard } from '../types';

export const DEFAULT_MASTERS_STANDARDS: MastersStandard[] = [
  // 25-29 남성 (국내 기준)
  { ageGroup: "25-29", sex: "male", stroke: "freestyle", distance: 100, time: 65, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "freestyle", distance: 200, time: 140, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "freestyle", distance: 400, time: 300, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "backstroke", distance: 100, time: 70, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "backstroke", distance: 200, time: 150, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "breaststroke", distance: 100, time: 75, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "breaststroke", distance: 200, time: 160, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "butterfly", distance: 100, time: 70, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "butterfly", distance: 200, time: 155, country: "domestic" },
  
  // 25-29 여성 (국내 기준)
  { ageGroup: "25-29", sex: "female", stroke: "freestyle", distance: 100, time: 75, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "freestyle", distance: 200, time: 160, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "freestyle", distance: 400, time: 340, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "backstroke", distance: 100, time: 80, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "backstroke", distance: 200, time: 170, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "breaststroke", distance: 100, time: 85, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "breaststroke", distance: 200, time: 180, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "butterfly", distance: 100, time: 80, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "butterfly", distance: 200, time: 175, country: "domestic" },
  
  // 30-34 남성 (국내 기준)
  { ageGroup: "30-34", sex: "male", stroke: "freestyle", distance: 100, time: 68, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "freestyle", distance: 200, time: 145, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "freestyle", distance: 400, time: 310, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "backstroke", distance: 100, time: 73, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "backstroke", distance: 200, time: 155, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "breaststroke", distance: 100, time: 78, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "breaststroke", distance: 200, time: 165, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "butterfly", distance: 100, time: 73, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "butterfly", distance: 200, time: 160, country: "domestic" },
  
  // 30-34 여성 (국내 기준)
  { ageGroup: "30-34", sex: "female", stroke: "freestyle", distance: 100, time: 78, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "freestyle", distance: 200, time: 165, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "freestyle", distance: 400, time: 350, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "backstroke", distance: 100, time: 83, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "backstroke", distance: 200, time: 175, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "breaststroke", distance: 100, time: 88, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "breaststroke", distance: 200, time: 185, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "butterfly", distance: 100, time: 83, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "butterfly", distance: 200, time: 180, country: "domestic" },
  
  // 35-39 남성 (국내 기준)
  { ageGroup: "35-39", sex: "male", stroke: "freestyle", distance: 100, time: 71, country: "domestic" },
  { ageGroup: "35-39", sex: "male", stroke: "freestyle", distance: 200, time: 150, country: "domestic" },
  { ageGroup: "35-39", sex: "male", stroke: "freestyle", distance: 400, time: 320, country: "domestic" },
  { ageGroup: "35-39", sex: "male", stroke: "backstroke", distance: 100, time: 76, country: "domestic" },
  { ageGroup: "35-39", sex: "male", stroke: "backstroke", distance: 200, time: 160, country: "domestic" },
  { ageGroup: "35-39", sex: "male", stroke: "breaststroke", distance: 100, time: 81, country: "domestic" },
  { ageGroup: "35-39", sex: "male", stroke: "breaststroke", distance: 200, time: 170, country: "domestic" },
  { ageGroup: "35-39", sex: "male", stroke: "butterfly", distance: 100, time: 76, country: "domestic" },
  { ageGroup: "35-39", sex: "male", stroke: "butterfly", distance: 200, time: 165, country: "domestic" },
  
  // 35-39 여성 (국내 기준)
  { ageGroup: "35-39", sex: "female", stroke: "freestyle", distance: 100, time: 81, country: "domestic" },
  { ageGroup: "35-39", sex: "female", stroke: "freestyle", distance: 200, time: 170, country: "domestic" },
  { ageGroup: "35-39", sex: "female", stroke: "freestyle", distance: 400, time: 360, country: "domestic" },
  { ageGroup: "35-39", sex: "female", stroke: "backstroke", distance: 100, time: 86, country: "domestic" },
  { ageGroup: "35-39", sex: "female", stroke: "backstroke", distance: 200, time: 180, country: "domestic" },
  { ageGroup: "35-39", sex: "female", stroke: "breaststroke", distance: 100, time: 91, country: "domestic" },
  { ageGroup: "35-39", sex: "female", stroke: "breaststroke", distance: 200, time: 190, country: "domestic" },
  { ageGroup: "35-39", sex: "female", stroke: "butterfly", distance: 100, time: 86, country: "domestic" },
  { ageGroup: "35-39", sex: "female", stroke: "butterfly", distance: 200, time: 185, country: "domestic" },
  
  // 40-44 남성 (국내 기준)
  { ageGroup: "40-44", sex: "male", stroke: "freestyle", distance: 100, time: 74, country: "domestic" },
  { ageGroup: "40-44", sex: "male", stroke: "freestyle", distance: 200, time: 155, country: "domestic" },
  { ageGroup: "40-44", sex: "male", stroke: "freestyle", distance: 400, time: 330, country: "domestic" },
  { ageGroup: "40-44", sex: "male", stroke: "backstroke", distance: 100, time: 79, country: "domestic" },
  { ageGroup: "40-44", sex: "male", stroke: "backstroke", distance: 200, time: 165, country: "domestic" },
  { ageGroup: "40-44", sex: "male", stroke: "breaststroke", distance: 100, time: 84, country: "domestic" },
  { ageGroup: "40-44", sex: "male", stroke: "breaststroke", distance: 200, time: 175, country: "domestic" },
  { ageGroup: "40-44", sex: "male", stroke: "butterfly", distance: 100, time: 79, country: "domestic" },
  { ageGroup: "40-44", sex: "male", stroke: "butterfly", distance: 200, time: 170, country: "domestic" },
  
  // 40-44 여성 (국내 기준)
  { ageGroup: "40-44", sex: "female", stroke: "freestyle", distance: 100, time: 84, country: "domestic" },
  { ageGroup: "40-44", sex: "female", stroke: "freestyle", distance: 200, time: 175, country: "domestic" },
  { ageGroup: "40-44", sex: "female", stroke: "freestyle", distance: 400, time: 370, country: "domestic" },
  { ageGroup: "40-44", sex: "female", stroke: "backstroke", distance: 100, time: 89, country: "domestic" },
  { ageGroup: "40-44", sex: "female", stroke: "backstroke", distance: 200, time: 185, country: "domestic" },
  { ageGroup: "40-44", sex: "female", stroke: "breaststroke", distance: 100, time: 94, country: "domestic" },
  { ageGroup: "40-44", sex: "female", stroke: "breaststroke", distance: 200, time: 195, country: "domestic" },
  { ageGroup: "40-44", sex: "female", stroke: "butterfly", distance: 100, time: 89, country: "domestic" },
  { ageGroup: "40-44", sex: "female", stroke: "butterfly", distance: 200, time: 190, country: "domestic" },
  
  // 45-49 남성 (국내 기준)
  { ageGroup: "45-49", sex: "male", stroke: "freestyle", distance: 100, time: 77, country: "domestic" },
  { ageGroup: "45-49", sex: "male", stroke: "freestyle", distance: 200, time: 160, country: "domestic" },
  { ageGroup: "45-49", sex: "male", stroke: "freestyle", distance: 400, time: 340, country: "domestic" },
  { ageGroup: "45-49", sex: "male", stroke: "backstroke", distance: 100, time: 82, country: "domestic" },
  { ageGroup: "45-49", sex: "male", stroke: "backstroke", distance: 200, time: 170, country: "domestic" },
  { ageGroup: "45-49", sex: "male", stroke: "breaststroke", distance: 100, time: 87, country: "domestic" },
  { ageGroup: "45-49", sex: "male", stroke: "breaststroke", distance: 200, time: 180, country: "domestic" },
  { ageGroup: "45-49", sex: "male", stroke: "butterfly", distance: 100, time: 82, country: "domestic" },
  { ageGroup: "45-49", sex: "male", stroke: "butterfly", distance: 200, time: 175, country: "domestic" },
  
  // 45-49 여성 (국내 기준)
  { ageGroup: "45-49", sex: "female", stroke: "freestyle", distance: 100, time: 87, country: "domestic" },
  { ageGroup: "45-49", sex: "female", stroke: "freestyle", distance: 200, time: 180, country: "domestic" },
  { ageGroup: "45-49", sex: "female", stroke: "freestyle", distance: 400, time: 380, country: "domestic" },
  { ageGroup: "45-49", sex: "female", stroke: "backstroke", distance: 100, time: 92, country: "domestic" },
  { ageGroup: "45-49", sex: "female", stroke: "backstroke", distance: 200, time: 190, country: "domestic" },
  { ageGroup: "45-49", sex: "female", stroke: "breaststroke", distance: 100, time: 97, country: "domestic" },
  { ageGroup: "45-49", sex: "female", stroke: "breaststroke", distance: 200, time: 200, country: "domestic" },
  { ageGroup: "45-49", sex: "female", stroke: "butterfly", distance: 100, time: 92, country: "domestic" },
  { ageGroup: "45-49", sex: "female", stroke: "butterfly", distance: 200, time: 195, country: "domestic" },
  
  // 50-54 남성 (국내 기준)
  { ageGroup: "50-54", sex: "male", stroke: "freestyle", distance: 100, time: 80, country: "domestic" },
  { ageGroup: "50-54", sex: "male", stroke: "freestyle", distance: 200, time: 165, country: "domestic" },
  { ageGroup: "50-54", sex: "male", stroke: "freestyle", distance: 400, time: 350, country: "domestic" },
  { ageGroup: "50-54", sex: "male", stroke: "backstroke", distance: 100, time: 85, country: "domestic" },
  { ageGroup: "50-54", sex: "male", stroke: "backstroke", distance: 200, time: 175, country: "domestic" },
  { ageGroup: "50-54", sex: "male", stroke: "breaststroke", distance: 100, time: 90, country: "domestic" },
  { ageGroup: "50-54", sex: "male", stroke: "breaststroke", distance: 200, time: 185, country: "domestic" },
  { ageGroup: "50-54", sex: "male", stroke: "butterfly", distance: 100, time: 85, country: "domestic" },
  { ageGroup: "50-54", sex: "male", stroke: "butterfly", distance: 200, time: 180, country: "domestic" },
  
  // 50-54 여성 (국내 기준)
  { ageGroup: "50-54", sex: "female", stroke: "freestyle", distance: 100, time: 90, country: "domestic" },
  { ageGroup: "50-54", sex: "female", stroke: "freestyle", distance: 200, time: 185, country: "domestic" },
  { ageGroup: "50-54", sex: "female", stroke: "freestyle", distance: 400, time: 390, country: "domestic" },
  { ageGroup: "50-54", sex: "female", stroke: "backstroke", distance: 100, time: 95, country: "domestic" },
  { ageGroup: "50-54", sex: "female", stroke: "backstroke", distance: 200, time: 195, country: "domestic" },
  { ageGroup: "50-54", sex: "female", stroke: "breaststroke", distance: 100, time: 100, country: "domestic" },
  { ageGroup: "50-54", sex: "female", stroke: "breaststroke", distance: 200, time: 205, country: "domestic" },
  { ageGroup: "50-54", sex: "female", stroke: "butterfly", distance: 100, time: 95, country: "domestic" },
  { ageGroup: "50-54", sex: "female", stroke: "butterfly", distance: 200, time: 200, country: "domestic" },
  
  // 55-59 남성 (국내 기준)
  { ageGroup: "55-59", sex: "male", stroke: "freestyle", distance: 100, time: 83, country: "domestic" },
  { ageGroup: "55-59", sex: "male", stroke: "freestyle", distance: 200, time: 170, country: "domestic" },
  { ageGroup: "55-59", sex: "male", stroke: "freestyle", distance: 400, time: 360, country: "domestic" },
  { ageGroup: "55-59", sex: "male", stroke: "backstroke", distance: 100, time: 88, country: "domestic" },
  { ageGroup: "55-59", sex: "male", stroke: "backstroke", distance: 200, time: 180, country: "domestic" },
  { ageGroup: "55-59", sex: "male", stroke: "breaststroke", distance: 100, time: 93, country: "domestic" },
  { ageGroup: "55-59", sex: "male", stroke: "breaststroke", distance: 200, time: 190, country: "domestic" },
  { ageGroup: "55-59", sex: "male", stroke: "butterfly", distance: 100, time: 88, country: "domestic" },
  { ageGroup: "55-59", sex: "male", stroke: "butterfly", distance: 200, time: 185, country: "domestic" },
  
  // 55-59 여성 (국내 기준)
  { ageGroup: "55-59", sex: "female", stroke: "freestyle", distance: 100, time: 93, country: "domestic" },
  { ageGroup: "55-59", sex: "female", stroke: "freestyle", distance: 200, time: 190, country: "domestic" },
  { ageGroup: "55-59", sex: "female", stroke: "freestyle", distance: 400, time: 400, country: "domestic" },
  { ageGroup: "55-59", sex: "female", stroke: "backstroke", distance: 100, time: 98, country: "domestic" },
  { ageGroup: "55-59", sex: "female", stroke: "backstroke", distance: 200, time: 200, country: "domestic" },
  { ageGroup: "55-59", sex: "female", stroke: "breaststroke", distance: 100, time: 103, country: "domestic" },
  { ageGroup: "55-59", sex: "female", stroke: "breaststroke", distance: 200, time: 210, country: "domestic" },
  { ageGroup: "55-59", sex: "female", stroke: "butterfly", distance: 100, time: 98, country: "domestic" },
  { ageGroup: "55-59", sex: "female", stroke: "butterfly", distance: 200, time: 205, country: "domestic" },
  
  // 60-64 남성 (국내 기준)
  { ageGroup: "60-64", sex: "male", stroke: "freestyle", distance: 100, time: 86, country: "domestic" },
  { ageGroup: "60-64", sex: "male", stroke: "freestyle", distance: 200, time: 175, country: "domestic" },
  { ageGroup: "60-64", sex: "male", stroke: "freestyle", distance: 400, time: 370, country: "domestic" },
  { ageGroup: "60-64", sex: "male", stroke: "backstroke", distance: 100, time: 91, country: "domestic" },
  { ageGroup: "60-64", sex: "male", stroke: "backstroke", distance: 200, time: 185, country: "domestic" },
  { ageGroup: "60-64", sex: "male", stroke: "breaststroke", distance: 100, time: 96, country: "domestic" },
  { ageGroup: "60-64", sex: "male", stroke: "breaststroke", distance: 200, time: 195, country: "domestic" },
  { ageGroup: "60-64", sex: "male", stroke: "butterfly", distance: 100, time: 91, country: "domestic" },
  { ageGroup: "60-64", sex: "male", stroke: "butterfly", distance: 200, time: 190, country: "domestic" },
  
  // 60-64 여성 (국내 기준)
  { ageGroup: "60-64", sex: "female", stroke: "freestyle", distance: 100, time: 96, country: "domestic" },
  { ageGroup: "60-64", sex: "female", stroke: "freestyle", distance: 200, time: 195, country: "domestic" },
  { ageGroup: "60-64", sex: "female", stroke: "freestyle", distance: 400, time: 410, country: "domestic" },
  { ageGroup: "60-64", sex: "female", stroke: "backstroke", distance: 100, time: 101, country: "domestic" },
  { ageGroup: "60-64", sex: "female", stroke: "backstroke", distance: 200, time: 205, country: "domestic" },
  { ageGroup: "60-64", sex: "female", stroke: "breaststroke", distance: 100, time: 106, country: "domestic" },
  { ageGroup: "60-64", sex: "female", stroke: "breaststroke", distance: 200, time: 215, country: "domestic" },
  { ageGroup: "60-64", sex: "female", stroke: "butterfly", distance: 100, time: 101, country: "domestic" },
  { ageGroup: "60-64", sex: "female", stroke: "butterfly", distance: 200, time: 210, country: "domestic" },
  
  // 65-69 남성 (국내 기준)
  { ageGroup: "65-69", sex: "male", stroke: "freestyle", distance: 100, time: 89, country: "domestic" },
  { ageGroup: "65-69", sex: "male", stroke: "freestyle", distance: 200, time: 180, country: "domestic" },
  { ageGroup: "65-69", sex: "male", stroke: "freestyle", distance: 400, time: 380, country: "domestic" },
  { ageGroup: "65-69", sex: "male", stroke: "backstroke", distance: 100, time: 94, country: "domestic" },
  { ageGroup: "65-69", sex: "male", stroke: "backstroke", distance: 200, time: 190, country: "domestic" },
  { ageGroup: "65-69", sex: "male", stroke: "breaststroke", distance: 100, time: 99, country: "domestic" },
  { ageGroup: "65-69", sex: "male", stroke: "breaststroke", distance: 200, time: 200, country: "domestic" },
  { ageGroup: "65-69", sex: "male", stroke: "butterfly", distance: 100, time: 94, country: "domestic" },
  { ageGroup: "65-69", sex: "male", stroke: "butterfly", distance: 200, time: 195, country: "domestic" },
  
  // 65-69 여성 (국내 기준)
  { ageGroup: "65-69", sex: "female", stroke: "freestyle", distance: 100, time: 99, country: "domestic" },
  { ageGroup: "65-69", sex: "female", stroke: "freestyle", distance: 200, time: 200, country: "domestic" },
  { ageGroup: "65-69", sex: "female", stroke: "freestyle", distance: 400, time: 420, country: "domestic" },
  { ageGroup: "65-69", sex: "female", stroke: "backstroke", distance: 100, time: 104, country: "domestic" },
  { ageGroup: "65-69", sex: "female", stroke: "backstroke", distance: 200, time: 210, country: "domestic" },
  { ageGroup: "65-69", sex: "female", stroke: "breaststroke", distance: 100, time: 109, country: "domestic" },
  { ageGroup: "65-69", sex: "female", stroke: "breaststroke", distance: 200, time: 220, country: "domestic" },
  { ageGroup: "65-69", sex: "female", stroke: "butterfly", distance: 100, time: 104, country: "domestic" },
  { ageGroup: "65-69", sex: "female", stroke: "butterfly", distance: 200, time: 215, country: "domestic" },
  
  // 70-74 남성 (국내 기준)
  { ageGroup: "70-74", sex: "male", stroke: "freestyle", distance: 100, time: 92, country: "domestic" },
  { ageGroup: "70-74", sex: "male", stroke: "freestyle", distance: 200, time: 185, country: "domestic" },
  { ageGroup: "70-74", sex: "male", stroke: "freestyle", distance: 400, time: 390, country: "domestic" },
  { ageGroup: "70-74", sex: "male", stroke: "backstroke", distance: 100, time: 97, country: "domestic" },
  { ageGroup: "70-74", sex: "male", stroke: "backstroke", distance: 200, time: 195, country: "domestic" },
  { ageGroup: "70-74", sex: "male", stroke: "breaststroke", distance: 100, time: 102, country: "domestic" },
  { ageGroup: "70-74", sex: "male", stroke: "breaststroke", distance: 200, time: 205, country: "domestic" },
  { ageGroup: "70-74", sex: "male", stroke: "butterfly", distance: 100, time: 97, country: "domestic" },
  { ageGroup: "70-74", sex: "male", stroke: "butterfly", distance: 200, time: 200, country: "domestic" },
  
  // 70-74 여성 (국내 기준)
  { ageGroup: "70-74", sex: "female", stroke: "freestyle", distance: 100, time: 102, country: "domestic" },
  { ageGroup: "70-74", sex: "female", stroke: "freestyle", distance: 200, time: 205, country: "domestic" },
  { ageGroup: "70-74", sex: "female", stroke: "freestyle", distance: 400, time: 430, country: "domestic" },
  { ageGroup: "70-74", sex: "female", stroke: "backstroke", distance: 100, time: 107, country: "domestic" },
  { ageGroup: "70-74", sex: "female", stroke: "backstroke", distance: 200, time: 215, country: "domestic" },
  { ageGroup: "70-74", sex: "female", stroke: "breaststroke", distance: 100, time: 112, country: "domestic" },
  { ageGroup: "70-74", sex: "female", stroke: "breaststroke", distance: 200, time: 225, country: "domestic" },
  { ageGroup: "70-74", sex: "female", stroke: "butterfly", distance: 100, time: 107, country: "domestic" },
  { ageGroup: "70-74", sex: "female", stroke: "butterfly", distance: 200, time: 220, country: "domestic" },
  
  // 75+ 남성 (국내 기준)
  { ageGroup: "75+", sex: "male", stroke: "freestyle", distance: 100, time: 95, country: "domestic" },
  { ageGroup: "75+", sex: "male", stroke: "freestyle", distance: 200, time: 190, country: "domestic" },
  { ageGroup: "75+", sex: "male", stroke: "freestyle", distance: 400, time: 400, country: "domestic" },
  { ageGroup: "75+", sex: "male", stroke: "backstroke", distance: 100, time: 100, country: "domestic" },
  { ageGroup: "75+", sex: "male", stroke: "backstroke", distance: 200, time: 200, country: "domestic" },
  { ageGroup: "75+", sex: "male", stroke: "breaststroke", distance: 100, time: 105, country: "domestic" },
  { ageGroup: "75+", sex: "male", stroke: "breaststroke", distance: 200, time: 210, country: "domestic" },
  { ageGroup: "75+", sex: "male", stroke: "butterfly", distance: 100, time: 100, country: "domestic" },
  { ageGroup: "75+", sex: "male", stroke: "butterfly", distance: 200, time: 205, country: "domestic" },
  
  // 75+ 여성 (국내 기준)
  { ageGroup: "75+", sex: "female", stroke: "freestyle", distance: 100, time: 105, country: "domestic" },
  { ageGroup: "75+", sex: "female", stroke: "freestyle", distance: 200, time: 210, country: "domestic" },
  { ageGroup: "75+", sex: "female", stroke: "freestyle", distance: 400, time: 440, country: "domestic" },
  { ageGroup: "75+", sex: "female", stroke: "backstroke", distance: 100, time: 110, country: "domestic" },
  { ageGroup: "75+", sex: "female", stroke: "backstroke", distance: 200, time: 220, country: "domestic" },
  { ageGroup: "75+", sex: "female", stroke: "breaststroke", distance: 100, time: 115, country: "domestic" },
  { ageGroup: "75+", sex: "female", stroke: "breaststroke", distance: 200, time: 230, country: "domestic" },
  { ageGroup: "75+", sex: "female", stroke: "butterfly", distance: 100, time: 110, country: "domestic" },
  { ageGroup: "75+", sex: "female", stroke: "butterfly", distance: 200, time: 225, country: "domestic" }
];





