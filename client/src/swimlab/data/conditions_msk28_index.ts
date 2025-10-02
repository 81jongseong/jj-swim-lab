/**
 * SwimLab Data Pack v4 - MSK 28 조건 식별자 목록
 * 
 * CONDITIONS 데이터와 일치해야 하는 id 목록
 * 
 * 관련 파일:
 * - client/src/swimlab/data/conditions_full.ts
 * - client/src/swimlab/utils/rules.ts
 */

// MSK 28 식별자 템플릿(네 CONDITIONS id와 일치해야 함)
export const MSK_28_IDS = [
  // Shoulder & Upper Thorax (8)
  'shoulder_impingement',
  'rotator_cuff_irritation',
  'labral_irritation',
  'biceps_tendinopathy',
  'ac_joint_pain',
  'scapular_dyskinesis',
  'thoracic_outlet_syndrome',
  'rib_stress_irritation',

  // Spine (4)
  'cervical_strain',
  'lumbar_extension_intolerance',
  'lumbar_flexion_intolerance',
  'costochondritis',

  // Elbow/Wrist/Hand (5)
  'medial_epicondylitis',
  'lateral_epicondylitis',
  'wrist_tendinopathy',
  'tenosynovitis_hand',
  'tmj_irritation',

  // Hip/Groin/Knee (6)
  'hip_flexor_strain',
  'hip_fai_irritation',
  'groin_adductor_strain',
  'patellofemoral_pain',
  'patellar_tendinopathy',
  'it_band_syndrome',

  // Ankle/Foot (3)
  'ankle_sprain_history',
  'achilles_tendinopathy',
  'plantar_fasciitis',

  // Systemic/General (2)
  'general_deconditioning',
  'long_covid_fatigue'
] as const;

export type MSK28ID = typeof MSK_28_IDS[number];
