/**
 * 👤 JJ Swim Lab - 사용자 프로필 페이지
 *
 * 📋 **페이지 목적**
 * - 로그인한 사용자가 자신의 기본 정보와 역할별 상세 정보를 확인 및 수정
 * - 4가지 계정 유형(회원, 강사, 센터 관리자, 최고 관리자)의 프로필 관리 지원
 * - 건강 프로필, 강사 전문 분야, 센터 관리 권한 등 연동 정보 시각화
 *
 * 🗄️ **연동되는 데이터 및 API**
 * - `GET /api/auth/profile`: 최신 사용자 정보 조회
 * - `PUT /api/users/:id`: 사용자 기본 정보 및 역할별 세부 정보 업데이트
 * - `useAuth` 컨텍스트: 전역 인증 상태와 사용자 세션 동기화
 *
 * 🔗 **연동되는 주요 파일**
 * - `client/hooks/useAuth.tsx`: 인증 및 사용자 상태 관리
 * - `client/utils/api.ts`: 공통 API 클라이언트
 * - `client/components/common/UserProfile.tsx`: 프로필 아바타 컴포넌트
 * - `client/components/ui/*`: 공통 UI 컴포넌트(Card, Button, Input 등)
 *
 * ⚠️ **개발 시 주의사항**
 * - 역할별(student, instructor, centerAdmin, superAdmin) 권한 및 필드 차이 고려
 * - 서버 응답 구조(`user`, `data.user`) 모두 대응
 * - nested 객체(studentInfo, instructorInfo 등) 업데이트 시 전체 객체 유지
 * - 로컬 상태와 전역 Auth 상태(localStorage) 싱크 유지
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle2, Info, MapPin, Shield, UserCheck, Users, Award, Activity, Phone, Mail, Target } from 'lucide-react';
import ConditionQuickPick from '@/components/swimlab/ConditionQuickPick';

import { useAuth, type User as AuthUser } from 'hooks/useAuth';
import apiClient from '@/utils/api';
import UserProfile from '@/components/common/UserProfile';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';

type ProfileUser = Omit<AuthUser, 'lastLoginAt'> & {
  _id: string;
  userId?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  gender?: string;
  lastLoginAt?: string | Date | null;
  createdAt?: string;
  updatedAt?: string;
  studentInfo?: (AuthUser['studentInfo'] & {
    status?: string;
    centerMemo?: string;
    healthProfile?: Record<string, unknown>;
    age?: number;
  }) | null;
  instructorInfo?: (AuthUser['instructorInfo'] & {
    bio?: string;
    introduction?: string;
    awards?: string[];
    hourlyRate?: number;
  }) | null;
  centerAdminInfo?: (AuthUser['centerAdminInfo'] & {
    officePhone?: string;
    officeEmail?: string;
  }) | null;
  superAdminInfo?: (AuthUser['superAdminInfo'] & {
    notes?: string;
  }) | null;
};

type SaveStatus = {
  type: 'success' | 'error' | 'info';
  message: string;
} | null;

type InstructorCertificate = {
  name: string;
  issuer: string;
  certificateNumber: string;
  acquiredDate: string;
};

type VerificationState = {
  required: boolean;
  verified: boolean;
  sending: boolean;
  verifying: boolean;
  code: string;
  message: string;
  messageType: 'success' | 'error' | 'info';
};

const verificationMessageColor: Record<VerificationState['messageType'], string> = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-slate-600',
};

const initialVerificationState: VerificationState = {
  required: false,
  verified: true,
  sending: false,
  verifying: false,
  code: '',
  message: '',
  messageType: 'info',
};

const KOREAN_LEVEL_MAP: Record<string, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
  expert: '전문가',
  junior: '주니어',
  senior: '시니어',
  master: '마스터',
};

const ROLE_LABEL_MAP: Record<string, string> = {
  student: '회원',
  instructor: '강사',
  centerAdmin: '센터 관리자',
  'center-admin': '센터 관리자',
  superAdmin: '최고 관리자',
  guest: '게스트',
};

const formatDate = (value?: string | Date | null): string => {
  if (!value) return '기록 없음';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '기록 없음';
  }
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null));

const areUsersEqual = (a: ProfileUser | null | undefined, b: AuthUser | null | undefined) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [initialProfile, setInitialProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>(null);
  const [certificateList, setCertificateList] = useState<InstructorCertificate[]>([]);
  const [emailVerification, setEmailVerification] =
    useState<VerificationState>(initialVerificationState);
  const [phoneVerification, setPhoneVerification] =
    useState<VerificationState>(initialVerificationState);
  const [specialtiesText, setSpecialtiesText] = useState('');
  const [bioText, setBioText] = useState('');
  const authUserRef = useRef<AuthUser | null>(authUser ?? null);
  const seededRef = useRef(false);
  const fetchedRef = useRef(false);

  const normalizeCertificates = (
    certs?: InstructorCertificate[] | null,
    names?: string[] | null,
  ): InstructorCertificate[] => {
    if (certs && certs.length > 0) {
      return certs.map((cert) => ({
        name: cert.name ?? '',
        issuer: cert.issuer ?? '',
        certificateNumber: cert.certificateNumber ?? '',
        acquiredDate: cert.acquiredDate ?? '',
      }));
    }
    if (names && names.length > 0) {
      return names.map((name) => ({
        name: name ?? '',
        issuer: '',
        certificateNumber: '',
        acquiredDate: '',
      }));
    }
    return [];
  };

  const ensureCertificateList = (list: InstructorCertificate[]): InstructorCertificate[] =>
    list.length > 0 ? list : [{ name: '', issuer: '', certificateNumber: '', acquiredDate: '' }];

  const updateProfileCertificates = (certs: InstructorCertificate[]) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const nextInstructorInfo = {
        ...(prev.instructorInfo ?? {}),
        certificates: certs,
        certifications: certs.map((cert) => cert.name).filter(Boolean),
      };
      return {
        ...prev,
        instructorInfo: nextInstructorInfo,
      };
    });
  };

  useEffect(() => {
    authUserRef.current = authUser ?? null;
    if (authUser && !seededRef.current) {
      const cloned = deepClone(authUser) as ProfileUser;
      // authUser에 phone/address가 없을 수 있으므로 임시로만 설정
      // API에서 받은 데이터로 덮어쓰기 위해 seededRef는 API 로드 후에 설정
      console.log('🔍 authUser에서 초기 프로필 설정:', {
        phone: cloned.phone,
        address: cloned.address,
        hasPhone: !!cloned.phone,
        hasAddress: !!cloned.address
      });
      setProfile(cloned);
      setInitialProfile(cloned);
      const initialCertificates = ensureCertificateList(
        normalizeCertificates(
          cloned.instructorInfo?.certificates,
          cloned.instructorInfo?.certifications,
        ),
      );
      setCertificateList(initialCertificates);
      setLoading(false);
      // seededRef는 API 데이터가 로드된 후에 설정하도록 변경
      // seededRef.current = true;
    }
  }, [authUser]);

  useEffect(() => {
    if (fetchedRef.current) {
      console.log('⚠️ [프로필 페이지] 이미 로드됨, 스킵');
      return;
    }
    fetchedRef.current = true;
    console.log('🚀 [프로필 페이지] 프로필 로드 시작');

    let isMounted = true;
    let hasLoaded = false; // 중복 로드 방지

    const loadProfile = async () => {
      if (hasLoaded) {
        console.log('⚠️ [프로필 페이지] 이미 로드 중, 스킵');
        return;
      }
      hasLoaded = true;
      
      if (!profile) {
        setLoading(true);
      }
      try {
        console.log('📡 [프로필 페이지] API 요청 시작');
        const response = await apiClient.get<any>('/api/auth/profile');
        console.log('📥 [프로필 페이지] API 응답 받음, isMounted:', isMounted);
        
        // isMounted 체크를 제거하고 항상 처리 (React Strict Mode 대응)
        // if (!isMounted) {
        //   console.log('⚠️ [프로필 페이지] 컴포넌트 언마운트됨, 스킵');
        //   return;
        // }

        // API 응답 구조 확인 (즉시 로그)
        console.log('🔍 [프로필 페이지] API 응답 받음:', {
          response,
          responseType: typeof response,
          responseKeys: response ? Object.keys(response) : [],
          hasUser: !!(response as any)?.user,
          hasData: !!(response as any)?.data,
          userPhone: (response as any)?.user?.phone,
          userAddress: (response as any)?.user?.address,
          fullResponse: response
        });

        if ((response as any)?.error) {
          setStatus({
            type: 'error',
            message: (response as any)?.error || '프로필 정보를 불러오지 못했습니다.',
          });
          const fallbackUser = authUserRef.current;
          if (fallbackUser) {
            const clonedFallback = deepClone(fallbackUser) as ProfileUser;
            setProfile(clonedFallback);
            setInitialProfile(clonedFallback);
          }
        } else {
          // API 응답에서 user 객체 추출
          const apiUser: ProfileUser | null =
            (response as any)?.user ??
            (response as any)?.data?.user ??
            (response as any)?.data ??
            null;
          
          console.log('🔍 [프로필 페이지] apiUser 추출:', {
            apiUser,
            hasApiUser: !!apiUser,
            apiUserType: typeof apiUser,
            apiUserKeys: apiUser ? Object.keys(apiUser) : [],
            phone: apiUser?.phone,
            address: apiUser?.address,
            birthDate: apiUser?.birthDate,
            gender: apiUser?.gender,
            hasStudentInfo: !!apiUser?.studentInfo,
            studentInfoHeight: (apiUser?.studentInfo as any)?.height,
            studentInfoWeight: (apiUser?.studentInfo as any)?.weight,
            studentInfo: apiUser?.studentInfo,
            fullApiUser: apiUser
          });

          if (apiUser) {
            const cloned = deepClone(apiUser);
            // phone, address, healthProfile 데이터 확인
            console.log('📋 프로필 데이터 로드 (API):', {
              userId: cloned.userId || cloned._id,
              hasPhone: !!cloned.phone,
              hasAddress: !!cloned.address,
              phone: cloned.phone,
              address: cloned.address,
              birthDate: cloned.birthDate,
              gender: cloned.gender,
              hasStudentInfo: !!cloned.studentInfo,
              studentInfoHeight: cloned.studentInfo?.height,
              studentInfoWeight: cloned.studentInfo?.weight,
              hasHealthProfile: !!cloned.studentInfo?.healthProfile,
              healthProfileHeight: (cloned.studentInfo?.healthProfile as any)?.height,
              healthProfileWeight: (cloned.studentInfo?.healthProfile as any)?.weight,
              healthProfile: cloned.studentInfo?.healthProfile,
              studentInfo: cloned.studentInfo
            });
            
            // API에서 받은 데이터로 profile 업데이트 (phone, address 포함)
            // 이 데이터가 최신이므로 항상 덮어쓰기
            setProfile(cloned);
            setInitialProfile(deepClone(apiUser));
            
            // seededRef 설정 (API 데이터 로드 완료)
            seededRef.current = true;
            
            const initialCertificates = ensureCertificateList(
              normalizeCertificates(
                cloned.instructorInfo?.certificates,
                cloned.instructorInfo?.certifications,
              ),
            );
            setCertificateList(initialCertificates);
            if (!areUsersEqual(cloned, authUserRef.current ?? undefined)) {
              updateUser(cloned as Partial<AuthUser>);
            }
            
            // 업데이트 후 확인
            setTimeout(() => {
              console.log('✅ 프로필 상태 업데이트 완료 - API 데이터 반영됨');
            }, 100);
          } else if (!profile && authUserRef.current) {
            const clonedFallback = deepClone(authUserRef.current) as ProfileUser;
            console.log('⚠️ API 데이터 없음, authUser 사용:', {
              phone: clonedFallback.phone,
              address: clonedFallback.address
            });
            setProfile(clonedFallback);
            setInitialProfile(clonedFallback);
            const initialCertificates = ensureCertificateList(
              normalizeCertificates(
                clonedFallback.instructorInfo?.certificates,
                clonedFallback.instructorInfo?.certifications,
              ),
            );
            setCertificateList(initialCertificates);
            seededRef.current = true;
          }
        }
      } catch (error) {
        console.error('프로필 로드 실패:', error);
        const fallbackUser = authUserRef.current;
        if (fallbackUser) {
          const clonedFallback = deepClone(fallbackUser) as ProfileUser;
          setProfile(clonedFallback);
          setInitialProfile(clonedFallback);
          const initialCertificates = ensureCertificateList(
            normalizeCertificates(
              clonedFallback.instructorInfo?.certificates,
              clonedFallback.instructorInfo?.certifications,
            ),
          );
          setCertificateList(initialCertificates);
        }
        setStatus({
          type: 'error',
          message: '프로필 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
      } finally {
        // isMounted 체크 제거 (React Strict Mode 대응)
        setLoading(false);
      }
    };

    loadProfile();

    // cleanup 함수 제거 (React Strict Mode에서 isMounted가 false가 되는 문제 방지)
    // return () => {
    //   isMounted = false;
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const joinedSpecialties =
      profile?.instructorInfo?.specialties?.join(', ') ?? '';
    if (joinedSpecialties !== specialtiesText) {
      setSpecialtiesText(joinedSpecialties);
    }

    const bioValue =
      profile?.instructorInfo?.bio ??
      profile?.instructorInfo?.introduction ??
      '';
    if (bioValue !== bioText) {
      setBioText(bioValue);
    }
  }, [
    profile?.instructorInfo?.specialties,
    profile?.instructorInfo?.bio,
    profile?.instructorInfo?.introduction,
    specialtiesText,
    bioText,
  ]);

  useEffect(() => {
    const initialEmail = initialProfile?.email?.toLowerCase() ?? '';
    const currentEmail = profile?.email?.toLowerCase() ?? '';

    setEmailVerification((prev) => {
      const required = !!profile && currentEmail !== '' && currentEmail !== initialEmail;
      if (!required) {
        if (!prev.required && prev.verified && !prev.code && !prev.message) {
          return prev;
        }
        return {
          ...prev,
          required: false,
          verified: true,
          code: '',
          message: '',
          messageType: 'info',
        };
      }
      if (prev.required) {
        return prev;
      }
      return {
        ...prev,
        required: true,
        verified: false,
        code: '',
        message: '',
        messageType: 'info',
      };
    });
  }, [profile?.email, initialProfile?.email]);

  useEffect(() => {
    const extractNumbers = (value: string) => value.replace(/\D/g, '');
    const initialPhone = initialProfile?.phone ? extractNumbers(initialProfile.phone) : '';
    const currentPhone = profile?.phone ? extractNumbers(profile.phone) : '';

    setPhoneVerification((prev) => {
      const required = !!profile && currentPhone !== '' && currentPhone !== initialPhone;
      if (!required) {
        if (!prev.required && prev.verified && !prev.code && !prev.message) {
          return prev;
        }
        return {
          ...prev,
          required: false,
          verified: true,
          code: '',
          message: '',
          messageType: 'info',
        };
      }
      if (prev.required) {
        return prev;
      }
      return {
        ...prev,
        required: true,
        verified: false,
        code: '',
        message: '',
        messageType: 'info',
      };
    });
  }, [profile?.phone, initialProfile?.phone]);

  // 디버깅: profile 상태 확인 (모든 hooks는 early return 전에 위치해야 함)
  useEffect(() => {
    if (profile) {
      console.log('🔍 프로필 상태 확인 (렌더링 시점):', {
        phone: profile.phone,
        address: profile.address,
        hasPhone: !!profile.phone,
        hasAddress: !!profile.address,
        studentInfo: profile.studentInfo,
        healthProfile: profile.studentInfo?.healthProfile,
        profileKeys: Object.keys(profile),
        fullProfile: profile
      });
    }
  }, [profile]);

  // 건강 프로필 수정 핸들러
  const handleHealthProfileChange = (field: string, value: any) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const nextStudentInfo = {
        ...(prev.studentInfo ?? {}),
        healthProfile: {
          ...(prev.studentInfo?.healthProfile ?? {}),
          [field]: value,
        },
      };
      return {
        ...prev,
        studentInfo: nextStudentInfo,
      };
    });
  };

  const isDirty = useMemo(() => {
    if (!profile || !initialProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(initialProfile);
  }, [profile, initialProfile]);

  const handleBasicChange = (field: keyof ProfileUser, value: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const nextValue = field === 'email' ? value.toLowerCase() : value;
      return { ...prev, [field]: nextValue };
    });

    if (field === 'email') {
      const normalized = value.toLowerCase();
      const initialEmail = initialProfile?.email?.toLowerCase() ?? '';
      setEmailVerification((prev) => {
        if (normalized === initialEmail) {
          return {
            ...prev,
            required: false,
            verified: true,
            code: '',
            message: '',
            messageType: 'info',
          };
        }
        return {
          ...prev,
          required: true,
          verified: false,
          code: '',
          message: '',
          messageType: 'info',
        };
      });
    }

    if (field === 'phone') {
      const extractNumbers = (input: string) => input.replace(/\D/g, '');
      const normalizedPhone = extractNumbers(value);
      const initialPhoneDigits = initialProfile?.phone
        ? extractNumbers(initialProfile.phone)
        : '';
      setPhoneVerification((prev) => {
        if (normalizedPhone === initialPhoneDigits) {
          return {
            ...prev,
            required: false,
            verified: true,
            code: '',
            message: '',
            messageType: 'info',
          };
        }
        return {
          ...prev,
          required: normalizedPhone.length > 0,
          verified: false,
          code: '',
          message: '',
          messageType: 'info',
        };
      });
    }
  };

  const handleStudentInfoChange = (field: keyof NonNullable<ProfileUser['studentInfo']>, value: any) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const nextStudentInfo = {
        ...(prev.studentInfo ?? {}),
        [field]: value,
      };
      return {
        ...prev,
        studentInfo: nextStudentInfo,
      };
    });
  };

  // swimmingProfile 수정 핸들러
  const handleSwimmingProfileChange = (field: string, value: any) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const currentSwimmingProfile = prev.studentInfo?.swimmingProfile ?? {};
      const nextSwimmingProfile = {
        ...currentSwimmingProfile,
        [field]: value,
      };
      return {
        ...prev,
        studentInfo: {
          ...(prev.studentInfo ?? {}),
          swimmingProfile: nextSwimmingProfile,
        },
      };
    });
  };

  // CSS 값 수정 핸들러
  const handleCssChange = (stroke: string, value: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const currentSwimmingProfile = prev.studentInfo?.swimmingProfile ?? {};
      const currentCss = currentSwimmingProfile.css ?? {};
      const numericValue = value === '' ? undefined : Number(value);
      const nextCss = numericValue !== undefined && !isNaN(numericValue) && numericValue > 0
        ? { ...currentCss, [stroke]: numericValue }
        : { ...currentCss };
      // stroke가 제거된 경우 해당 키 삭제
      if (numericValue === undefined || isNaN(numericValue) || numericValue <= 0) {
        delete nextCss[stroke as keyof typeof nextCss];
      }
      return {
        ...prev,
        studentInfo: {
          ...(prev.studentInfo ?? {}),
          swimmingProfile: {
            ...currentSwimmingProfile,
            css: Object.keys(nextCss).length > 0 ? nextCss : undefined,
          },
        },
      };
    });
  };

  const handleCertificateChange = (
    index: number,
    field: keyof InstructorCertificate,
    value: string,
  ) => {
    setCertificateList((prev) => {
      const next = prev.map((cert, idx) =>
        idx === index ? { ...cert, [field]: value } : cert,
      );
      updateProfileCertificates(next);
      return next;
    });
  };

  const handleAddCertificate = () => {
    setCertificateList((prev) => {
      const next = [
        ...prev,
        { name: '', issuer: '', certificateNumber: '', acquiredDate: '' },
      ];
      updateProfileCertificates(next);
      return next;
    });
  };

  const handleRemoveCertificate = (index: number) => {
    setCertificateList((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      const next = ensureCertificateList(filtered);
      updateProfileCertificates(next);
      return next;
    });
  };

  const handleSpecialtiesTextChange = (value: string) => {
    setSpecialtiesText(value);
    const parsed = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    setProfile((prev) => {
      if (!prev) return prev;
      const nextInstructorInfo = {
        ...(prev.instructorInfo ?? {}),
        specialties: parsed,
      };
      return {
        ...prev,
        instructorInfo: nextInstructorInfo,
      };
    });
  };

  const handleBioChange = (value: string) => {
    setBioText(value);
    setProfile((prev) => {
      if (!prev) return prev;
      const nextInstructorInfo = {
        ...(prev.instructorInfo ?? {}),
        bio: value,
        introduction: value,
      };
      return {
        ...prev,
        instructorInfo: nextInstructorInfo,
      };
    });
  };

  const sendEmailVerificationCode = async () => {
    if (!profile?.email) {
      setEmailVerification((prev) => ({
        ...prev,
        message: '이메일을 먼저 입력해주세요.',
        messageType: 'error',
      }));
      return;
    }
    setEmailVerification((prev) => ({
      ...prev,
      sending: true,
      message: '',
    }));
    try {
      const response = await apiClient.post<any>('/api/auth/send-email-code', {
        email: profile.email,
      });
      if ((response as any)?.success) {
        setEmailVerification((prev) => ({
          ...prev,
          sending: false,
          message:
            (response as any)?.message ||
            '인증 코드가 발송되었습니다. 이메일을 확인해주세요.',
          messageType: 'success',
        }));
      } else {
        throw new Error((response as any)?.error || '인증 코드 발송에 실패했습니다.');
      }
    } catch (error) {
      setEmailVerification((prev) => ({
        ...prev,
        sending: false,
        message:
          error instanceof Error
            ? error.message
            : '인증 코드 발송에 실패했습니다.',
        messageType: 'error',
      }));
    }
  };

  const verifyEmailCode = async () => {
    if (!profile?.email || !emailVerification.code) {
      setEmailVerification((prev) => ({
        ...prev,
        message: '이메일과 인증 코드를 입력해주세요.',
        messageType: 'error',
      }));
      return;
    }
    setEmailVerification((prev) => ({
      ...prev,
      verifying: true,
      message: '',
    }));
    try {
      const response = await apiClient.post<any>('/api/auth/verify-email-code', {
        email: profile.email,
        code: emailVerification.code,
      });
      if ((response as any)?.success) {
        setEmailVerification((prev) => ({
          ...prev,
          verifying: false,
          verified: true,
          message:
            (response as any)?.message || '이메일 인증이 완료되었습니다.',
          messageType: 'success',
          code: '',
        }));
      } else {
        throw new Error((response as any)?.error || '이메일 인증에 실패했습니다.');
      }
    } catch (error) {
      setEmailVerification((prev) => ({
        ...prev,
        verifying: false,
        message:
          error instanceof Error ? error.message : '이메일 인증에 실패했습니다.',
        messageType: 'error',
      }));
    }
  };

  const sendPhoneVerificationCode = async () => {
    if (!profile?.phone) {
      setPhoneVerification((prev) => ({
        ...prev,
        message: '전화번호를 먼저 입력해주세요.',
        messageType: 'error',
      }));
      return;
    }
    setPhoneVerification((prev) => ({
      ...prev,
      sending: true,
      message: '',
    }));
    try {
      const response = await apiClient.post<any>('/api/auth/send-verification-code', {
        phone: profile.phone,
      });
      if ((response as any)?.success) {
        setPhoneVerification((prev) => ({
          ...prev,
          sending: false,
          message:
            (response as any)?.message ||
            '인증 코드가 발송되었습니다. 문자메시지를 확인해주세요.',
          messageType: 'success',
        }));
      } else {
        throw new Error((response as any)?.error || '인증 코드 발송에 실패했습니다.');
      }
    } catch (error) {
      setPhoneVerification((prev) => ({
        ...prev,
        sending: false,
        message:
          error instanceof Error
            ? error.message
            : '인증 코드 발송에 실패했습니다.',
        messageType: 'error',
      }));
    }
  };

  const verifyPhoneCode = async () => {
    if (!profile?.phone || !phoneVerification.code) {
      setPhoneVerification((prev) => ({
        ...prev,
        message: '전화번호와 인증 코드를 입력해주세요.',
        messageType: 'error',
      }));
      return;
    }
    setPhoneVerification((prev) => ({
      ...prev,
      verifying: true,
      message: '',
    }));
    try {
      const response = await apiClient.post<any>('/api/auth/verify-phone-code', {
        phone: profile.phone,
        code: phoneVerification.code,
      });
      if ((response as any)?.success) {
        setPhoneVerification((prev) => ({
          ...prev,
          verifying: false,
          verified: true,
          message:
            (response as any)?.message || '전화번호 인증이 완료되었습니다.',
          messageType: 'success',
          code: '',
        }));
      } else {
        throw new Error((response as any)?.error || '전화번호 인증에 실패했습니다.');
      }
    } catch (error) {
      setPhoneVerification((prev) => ({
        ...prev,
        verifying: false,
        message:
          error instanceof Error ? error.message : '전화번호 인증에 실패했습니다.',
        messageType: 'error',
      }));
    }
  };

  const handleReset = () => {
    if (!initialProfile) return;
    const cloned = deepClone(initialProfile);
    setProfile(cloned);
    setStatus({
      type: 'info',
      message: '변경 사항을 원래대로 되돌렸습니다.',
    });
    const normalized = ensureCertificateList(
      normalizeCertificates(
        cloned.instructorInfo?.certificates,
        cloned.instructorInfo?.certifications,
      ),
    );
    setCertificateList(normalized);
    setSpecialtiesText(cloned.instructorInfo?.specialties?.join(', ') ?? '');
    setBioText(
      cloned.instructorInfo?.bio ??
        cloned.instructorInfo?.introduction ??
        '',
    );
    setEmailVerification(initialVerificationState);
    setPhoneVerification(initialVerificationState);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setStatus(null);

    try {
      if (emailVerification.required && !emailVerification.verified) {
        setStatus({
          type: 'error',
          message: '이메일 인증을 완료한 후 저장할 수 있습니다.',
        });
        setSaving(false);
        return;
      }

      if (phoneVerification.required && !phoneVerification.verified) {
        setStatus({
          type: 'error',
          message: '전화번호 인증을 완료한 후 저장할 수 있습니다.',
        });
        setSaving(false);
        return;
      }

      const payload: Record<string, unknown> = {};

      if (profile.name) payload.name = profile.name.trim();
      const normalizedEmail = profile.email?.trim().toLowerCase() ?? '';
      if (!normalizedEmail) {
        setStatus({
          type: 'error',
          message: '이메일을 입력해주세요.',
        });
        setSaving(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        setStatus({
          type: 'error',
          message: '유효한 이메일 주소를 입력해주세요.',
        });
        setSaving(false);
        return;
      }
      payload.email = normalizedEmail;
      if (profile.phone !== undefined) payload.phone = profile.phone?.trim() ?? '';
      if (profile.address !== undefined) payload.address = profile.address?.trim() ?? '';
      if ((profile as any).birthDate) payload.birthDate = (profile as any).birthDate;
      if ((profile as any).gender) payload.gender = (profile as any).gender;
      if (profile.userId) payload.userId = profile.userId.trim();

      if (profile.studentInfo || initialProfile?.studentInfo) {
        const baseStudentInfo = deepClone(initialProfile?.studentInfo ?? {}) as Record<string, any>;
        const nextStudentInfo: Record<string, any> = {
          ...baseStudentInfo,
          ...profile.studentInfo,
        };

        if (baseStudentInfo && typeof baseStudentInfo === 'object') {
          if (Object.prototype.hasOwnProperty.call(baseStudentInfo, 'centerMemo')) {
            nextStudentInfo.centerMemo = baseStudentInfo.centerMemo;
          }
          if (Object.prototype.hasOwnProperty.call(baseStudentInfo, 'centerMemos')) {
            nextStudentInfo.centerMemos = baseStudentInfo.centerMemos;
          }
        }

        payload.studentInfo = nextStudentInfo;
      }

      if ((profile.instructorInfo && initialProfile?.instructorInfo) || certificateList.length > 0) {
        const baseInstructorInfo = deepClone(initialProfile?.instructorInfo ?? {});
        const sanitizedCertificates = certificateList
          .map((cert) => ({
            name: cert.name?.trim() ?? '',
            issuer: cert.issuer?.trim() ?? '',
            certificateNumber: cert.certificateNumber?.trim() ?? '',
            acquiredDate: cert.acquiredDate ?? '',
          }))
          .filter((cert) => cert.name || cert.issuer || cert.certificateNumber || cert.acquiredDate);

        const nextInstructorInfo = {
          ...baseInstructorInfo,
          bio: profile.instructorInfo?.bio ?? profile.instructorInfo?.introduction ?? '',
          introduction: profile.instructorInfo?.bio ?? profile.instructorInfo?.introduction ?? '',
          specialties: profile.instructorInfo?.specialties ?? [],
          certificates: sanitizedCertificates,
          certifications: sanitizedCertificates.map((cert) => cert.name).filter(Boolean),
        };

        payload.instructorInfo = nextInstructorInfo;
      }

      if (profile.centerAdminInfo) {
        payload.centerAdminInfo = { ...profile.centerAdminInfo };
      }

      if (profile.superAdminInfo) {
        payload.superAdminInfo = { ...profile.superAdminInfo };
      }

      if (profile.level) {
        payload.level = profile.level;
      }

      if (Object.keys(payload).length === 0) {
        setStatus({
          type: 'info',
          message: '변경된 내용이 없습니다.',
        });
        setSaving(false);
        return;
      }

      const response = await apiClient.put<any>(`/api/users/${profile._id}`, payload);

      if ((response as any)?.error) {
        throw new Error((response as any)?.error || '프로필 저장에 실패했습니다.');
      }

      const updatedUser: ProfileUser = deepClone(response);
      setProfile(updatedUser);
      setInitialProfile(deepClone(response));
      updateUser(updatedUser as Partial<AuthUser>);
      const normalizedCertificates = ensureCertificateList(
        normalizeCertificates(
          updatedUser.instructorInfo?.certificates,
          updatedUser.instructorInfo?.certifications,
        ),
      );
      setCertificateList(normalizedCertificates);
      setSpecialtiesText(
        updatedUser.instructorInfo?.specialties?.join(', ') ?? '',
      );
      setBioText(
        updatedUser.instructorInfo?.bio ??
          updatedUser.instructorInfo?.introduction ??
          '',
      );
      setEmailVerification(initialVerificationState);
      setPhoneVerification(initialVerificationState);

      setStatus({
        type: 'success',
        message: '프로필 정보를 저장했습니다.',
      });
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '프로필 저장에 실패했습니다.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-3xl bg-slate-100" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
            <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
            <div className="space-y-6">
              <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-sm text-slate-500">
        프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </div>
    );
  }

  const roleLabel = ROLE_LABEL_MAP[profile.userType] || profile.userType;
  const studentLevel =
    profile.studentInfo?.currentLevel ||
    profile.studentInfo?.swimmingLevel ||
    (profile.level ? KOREAN_LEVEL_MAP[profile.level] || profile.level : undefined);
  const instructorLevel =
    profile.instructorInfo?.instructorLevel
      ? KOREAN_LEVEL_MAP[profile.instructorInfo.instructorLevel] || profile.instructorInfo.instructorLevel
      : profile.level
        ? KOREAN_LEVEL_MAP[profile.level] || profile.level
        : undefined;

  const accessList = Object.entries(profile.accessPermissions || {}).filter(([, allowed]) => allowed);

  if (!profile) {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-3xl bg-slate-100" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
            <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
            <div className="space-y-6">
              <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-sm text-slate-500">
        프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </div>
    );
  }

  const healthProfile = profile.studentInfo?.healthProfile ?? {};
  // studentInfo에서도 키와 체중 가져오기 (healthProfile이 없을 경우)
  const height = (healthProfile as any)?.height ?? profile.studentInfo?.height;
  const weight = (healthProfile as any)?.weight ?? profile.studentInfo?.weight;
  const bmi = (healthProfile as any)?.bmi ?? (height && weight ? (weight / ((height / 100) ** 2)).toFixed(1) : undefined);
  
  // 데이터 표시 확인 로그
  console.log('🔍 [프로필 페이지] 렌더링 시점 데이터 확인:', {
    birthDate: profile.birthDate,
    gender: profile.gender,
    studentInfoHeight: profile.studentInfo?.height,
    studentInfoWeight: profile.studentInfo?.weight,
    healthProfileHeight: (healthProfile as any)?.height,
    healthProfileWeight: (healthProfile as any)?.weight,
    finalHeight: height,
    finalWeight: weight,
    hasStudentInfo: !!profile.studentInfo,
    studentInfo: profile.studentInfo
  });
  
  // 건강 정보 배지 생성 (더 많은 필드 포함)
  const healthBadges: Array<{ label: string; value?: string | number; icon?: ReactNode }> = [
    {
      label: '키',
      value: height ? `${height} cm` : undefined,
      icon: <Activity className="h-4 w-4" />,
    },
    {
      label: '체중',
      value: weight ? `${weight} kg` : undefined,
      icon: <Activity className="h-4 w-4" />,
    },
    {
      label: 'BMI',
      value: bmi ? String(bmi) : undefined,
      icon: <Activity className="h-4 w-4" />,
    },
    {
      label: '혈액형',
      value: (healthProfile as any)?.bloodType,
      icon: <Shield className="h-4 w-4" />,
    },
    // 수영 관련 건강 상태
    ...(Object.values((healthProfile as any)?.swimmingRelatedConditions || {}).some((v: any) => v === true) 
      ? [{
          label: '건강 상태',
          value: Object.entries((healthProfile as any)?.swimmingRelatedConditions || {})
            .filter(([_, v]: [string, any]) => v === true)
            .map(([k]: [string, any]) => {
              const labels: Record<string, string> = {
                cardiovascular: '심장 질환',
                respiratory: '호흡기 질환',
                musculoskeletal: '근골격계 질환',
                diabetes: '당뇨',
                hypertension: '고혈압',
                asthma: '천식'
              };
              return labels[k] || k;
            })
            .join(', ') || '없음',
          icon: <Shield className="h-4 w-4" />,
        }]
      : []
    ),
  ].filter((item) => Boolean(item.value));

  return (
    <div className="space-y-8 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-600 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
        <div className="relative flex flex-col gap-6 p-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
              <UserCheck className="h-3.5 w-3.5" />
              {roleLabel} 프로필
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {profile.name || '이름 미등록'}님의 스윔랩 프로필
              </h1>
              <p className="mt-2 text-sm text-white/80">
                마지막 로그인 · {formatDate(profile.lastLoginAt)}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {studentLevel && (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    현재 레벨 {studentLevel}
                  </Badge>
                )}
                {profile.centerId && (
                  <Badge variant="secondary" size="sm">
                    <MapPin className="mr-1 h-3.5 w-3.5" />
                    센터 ID {profile.centerId}
                  </Badge>
                )}
                {profile.membershipTier && (
                  <Badge variant="primary" size="sm">
                    멤버십 {profile.membershipTier}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
            <UserProfile showName showUserType size="lg" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>이름, 이메일, 연락처와 같은 로그인·인증 정보를 직접 관리할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status && (
              <Alert
                variant={status.type === 'error' ? 'destructive' : 'default'}
                className="border"
              >
                <AlertTitle>
                  {status.type === 'success'
                    ? '저장 완료'
                    : status.type === 'error'
                      ? '오류 발생'
                      : '안내'}
                </AlertTitle>
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="profile-name">
                  이름
                </label>
                <Input
                  id="profile-name"
                  value={profile.name ?? ''}
                  placeholder="이름 입력"
                  disabled
                  readOnly
                />
                <p className="text-xs text-slate-500">
                  이름 변경은 센터 관리자 또는 최고 관리자에게 요청해주세요.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="profile-email">
                  이메일
                </label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profile.email ?? ''}
                  placeholder="example@swimlab.com"
                  onChange={(event) => handleBasicChange('email', event.target.value)}
                />
                <p className="text-xs text-slate-500">
                  로그인 및 인증에 사용되며, 저장 시 자동으로 소문자로 정리됩니다.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="profile-phone">
                  연락처
                </label>
                <Input
                  id="profile-phone"
                  value={profile.phone ?? ''}
                  placeholder="010-0000-0000"
                  onChange={(event) => handleBasicChange('phone', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="profile-address">
                  주소
                </label>
                <Input
                  id="profile-address"
                  value={profile.address ?? ''}
                  placeholder="서울특별시 ..."
                  onChange={(event) => handleBasicChange('address', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="profile-birthDate">
                  생년월일
                </label>
                <Input
                  id="profile-birthDate"
                  type="date"
                  value={profile.birthDate ? (() => {
                    // birthDate가 문자열이면 그대로 사용, Date 객체면 변환
                    if (typeof profile.birthDate === 'string') {
                      // YYYY-MM-DD 형식인지 확인
                      if (profile.birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        return profile.birthDate;
                      }
                      // ISO 형식이면 날짜 부분만 추출
                      return profile.birthDate.split('T')[0];
                    }
                    // Date 객체면 ISO 형식으로 변환
                    return new Date(profile.birthDate).toISOString().split('T')[0];
                  })() : ''}
                  onChange={(event) => handleBasicChange('birthDate', event.target.value)}
                />
                <p className="text-xs text-slate-500">
                  회원가입 시 입력한 생년월일입니다.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="profile-gender">
                  성별
                </label>
                <select
                  id="profile-gender"
                  value={profile.gender || ''}
                  onChange={(event) => handleBasicChange('gender', event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                </select>
                <p className="text-xs text-slate-500">
                  회원가입 시 입력한 성별입니다.
                </p>
              </div>
            </div>

            {(emailVerification.required || phoneVerification.required || emailVerification.message || phoneVerification.message) && (
              <div className="grid gap-4 md:grid-cols-2">
                {(emailVerification.required || emailVerification.message) && (
                  <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">이메일 인증</p>
                        <p className="text-xs text-slate-500">
                          새 이메일 저장 전에 인증을 완료해야 합니다.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={sendEmailVerificationCode}
                        disabled={
                          emailVerification.sending ||
                          !emailVerification.required
                        }
                      >
                        {emailVerification.sending ? '발송 중...' : '인증 코드 발송'}
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={emailVerification.code}
                        placeholder="6자리 인증 코드"
                        maxLength={6}
                        onChange={(event) =>
                          setEmailVerification((prev) => ({
                            ...prev,
                            code: event.target.value.replace(/\s/g, '').slice(0, 6),
                          }))
                        }
                        className="sm:flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={verifyEmailCode}
                        disabled={
                          emailVerification.verifying ||
                          emailVerification.code.length < 4
                        }
                      >
                        {emailVerification.verifying ? '확인 중...' : '인증하기'}
                      </Button>
                    </div>
                    {emailVerification.message && (
                      <p
                        className={`text-xs ${
                          verificationMessageColor[emailVerification.messageType]
                        }`}
                      >
                        {emailVerification.message}
                      </p>
                    )}
                    {!emailVerification.required && emailVerification.verified && (
                      <p className="text-xs text-emerald-600">인증이 완료된 이메일입니다.</p>
                    )}
                  </div>
                )}

                {(phoneVerification.required || phoneVerification.message) && (
                  <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">전화번호 인증</p>
                        <p className="text-xs text-slate-500">
                          새 전화번호 저장 전 문자 인증을 완료하세요.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={sendPhoneVerificationCode}
                        disabled={
                          phoneVerification.sending ||
                          !phoneVerification.required
                        }
                      >
                        {phoneVerification.sending ? '발송 중...' : '인증 코드 발송'}
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={phoneVerification.code}
                        placeholder="6자리 인증 코드"
                        maxLength={6}
                        onChange={(event) =>
                          setPhoneVerification((prev) => ({
                            ...prev,
                            code: event.target.value.replace(/\D/g, '').slice(0, 6),
                          }))
                        }
                        className="sm:flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={verifyPhoneCode}
                        disabled={
                          phoneVerification.verifying ||
                          phoneVerification.code.length < 4
                        }
                      >
                        {phoneVerification.verifying ? '확인 중...' : '인증하기'}
                      </Button>
                    </div>
                    {phoneVerification.message && (
                      <p
                        className={`text-xs ${
                          verificationMessageColor[phoneVerification.messageType]
                        }`}
                      >
                        {phoneVerification.message}
                      </p>
                    )}
                    {!phoneVerification.required && phoneVerification.verified && (
                      <p className="text-xs text-emerald-600">인증이 완료된 전화번호입니다.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {profile.userType === 'student' && (
              <>
                <Separator />
                <section className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">회원 추가 정보</h3>
                    <p className="text-sm text-slate-500">
                      회원가입 시 입력한 정보를 확인하고 수정할 수 있습니다.
                    </p>
                  </div>

                  {/* 키, 몸무게 (회원가입과 동일한 위치) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Activity className="w-4 h-4 inline mr-2" />
                        키 (cm)
                      </label>
                      <input
                        type="number"
                        value={profile.studentInfo?.height ?? ''}
                        onChange={(e) => handleStudentInfoChange('height', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="키를 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Activity className="w-4 h-4 inline mr-2" />
                        몸무게 (kg)
                      </label>
                      <input
                        type="number"
                        value={profile.studentInfo?.weight ?? ''}
                        onChange={(e) => handleStudentInfoChange('weight', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="몸무게를 입력하세요"
                      />
                    </div>
                  </div>

                  {/* 응급 연락처 */}
                  <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <h4 className="text-sm font-semibold text-slate-800">응급 연락처</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="student-emergency">
                          응급 연락처 이름
                        </label>
                        <Input
                          id="student-emergency"
                          value={profile.studentInfo?.emergencyContact ?? ''}
                          placeholder="홍길동"
                          onChange={(event) => handleStudentInfoChange('emergencyContact', event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="student-emergency-phone">
                          응급 연락처 전화번호
                        </label>
                        <Input
                          id="student-emergency-phone"
                          value={(profile.studentInfo as any)?.emergencyPhone ?? ''}
                          placeholder="010-1234-5678"
                          onChange={(event) => handleStudentInfoChange('emergencyPhone' as any, event.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 수영 숙련도 (회원가입과 동일한 라디오 버튼) */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">수영 숙련도</h3>
                        <p className="text-xs text-slate-500">완영 가능한 최고 영법을 선택해주세요.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'basic', label: '기초 단계', description: '킥보드, 호흡 연습 단계' },
                        { id: 'freestyle', label: '자유형까지 가능', description: '25m 이상 자유형 완영' },
                        { id: 'backstroke', label: '배영까지 가능', description: '자유형 + 배영 완영' },
                        { id: 'breaststroke', label: '평영까지 가능', description: '3영법 완영 가능' },
                        { id: 'butterfly', label: '접영까지 가능', description: '4영법 모두 완영 가능' }
                      ].map((option) => {
                        const currentProficiency = (profile.studentInfo?.swimmingProfile as any)?.swimProficiency ?? '';
                        const isSelected = currentProficiency === option.id;
                        return (
                          <label
                            key={option.id}
                            className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
                              isSelected
                                ? 'border-blue-500 bg-white shadow-sm'
                                : 'border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="swimProficiency"
                              value={option.id}
                              checked={isSelected}
                              onChange={() => handleSwimmingProfileChange('swimProficiency', option.id)}
                              className="mt-1 h-4 w-4 text-blue-600"
                            />
                            <div>
                              <p className="font-medium text-slate-900">{option.label}</p>
                              <p className="text-sm text-slate-600">{option.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 최대 연속 거리 (회원가입과 동일한 select) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Target className="w-4 h-4 inline mr-2" />
                      연속으로 수영 가능한 거리
                    </label>
                    <select
                      value={(profile.studentInfo?.swimmingProfile as any)?.maxContinuousDistance?.toString() ?? ''}
                      onChange={(e) => handleSwimmingProfileChange('maxContinuousDistance', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">거리를 선택하세요</option>
                      {[
                        { value: '25', label: '25m (1바퀴)' },
                        { value: '50', label: '50m (2바퀴)' },
                        { value: '100', label: '100m (4바퀴)' },
                        { value: '200', label: '200m (8바퀴)' },
                        { value: '400', label: '400m (16바퀴)' },
                        { value: '800', label: '800m (32바퀴)' },
                        { value: '1500', label: '1500m 이상' }
                      ].map((distance) => (
                        <option key={distance.value} value={distance.value}>
                          {distance.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 운동 목표 (회원가입과 동일한 UI) */}
                  <div className="border border-purple-200 rounded-lg p-4 space-y-4 bg-purple-50/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-purple-900">운동 목표 선택</h3>
                        <p className="text-xs text-purple-700">
                          수영 엔진에서 제공하는 10가지 목표 중 하나를 선택해주세요.
                        </p>
                      </div>
                      <span className="text-xs text-purple-700">
                        현재 선택: <strong className="text-purple-600">{(profile.studentInfo?.swimmingProfile as any)?.currentGoal || '선택 안됨'}</strong>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        '체력 향상',
                        '체중 감량',
                        '기술 연마',
                        '실력 향상',
                        '재활',
                        '스트레스 해소',
                        '장거리 수영',
                        '오픈워터',
                        '생존수영',
                        '인명구조원'
                      ].map((goal) => {
                        const currentGoal = (profile.studentInfo?.swimmingProfile as any)?.currentGoal || '';
                        const isSelected = currentGoal === goal;
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => handleSwimmingProfileChange('currentGoal', goal)}
                            className={`px-3 py-2 text-sm border-2 rounded-lg transition-all ${
                              isSelected
                                ? 'border-purple-500 bg-white text-purple-700 font-semibold shadow-sm'
                                : 'border-purple-100 bg-white hover:border-purple-300 text-gray-700'
                            }`}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-purple-700">
                      선택한 목표는 프로그램 생성 시 운동 강도와 구성에 직접 반영됩니다.
                    </p>
                  </div>

                  {/* CSS 측정값 */}
                  <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <h4 className="text-sm font-semibold text-slate-800">CSS 측정값 (초/100m)</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="css-freestyle">
                          자유형
                        </label>
                        <Input
                          id="css-freestyle"
                          type="number"
                          step="0.1"
                          value={(profile.studentInfo?.swimmingProfile?.css as any)?.freestyle ?? ''}
                          placeholder="예: 90.5"
                          onChange={(event) => handleCssChange('freestyle', event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="css-backstroke">
                          배영
                        </label>
                        <Input
                          id="css-backstroke"
                          type="number"
                          step="0.1"
                          value={(profile.studentInfo?.swimmingProfile?.css as any)?.backstroke ?? ''}
                          placeholder="예: 95.0"
                          onChange={(event) => handleCssChange('backstroke', event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="css-breaststroke">
                          평영
                        </label>
                        <Input
                          id="css-breaststroke"
                          type="number"
                          step="0.1"
                          value={(profile.studentInfo?.swimmingProfile?.css as any)?.breaststroke ?? ''}
                          placeholder="예: 110.0"
                          onChange={(event) => handleCssChange('breaststroke', event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="css-butterfly">
                          접영
                        </label>
                        <Input
                          id="css-butterfly"
                          type="number"
                          step="0.1"
                          value={(profile.studentInfo?.swimmingProfile?.css as any)?.butterfly ?? ''}
                          placeholder="예: 100.0"
                          onChange={(event) => handleCssChange('butterfly', event.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 영법 선택 */}
                  <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <h4 className="text-sm font-semibold text-slate-800">영법 선택</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">주 영법 (주로 사용하는 영법)</label>
                        <div className="flex flex-wrap gap-2">
                          {['freestyle', 'backstroke', 'breaststroke', 'butterfly'].map((stroke) => {
                            const labels: Record<string, string> = {
                              freestyle: '🏊 자유형',
                              backstroke: '🏊‍♂️ 배영',
                              breaststroke: '🤿 평영',
                              butterfly: '🦋 접영'
                            };
                            const isSelected = (profile.studentInfo?.swimmingProfile as any)?.mainStrokes?.includes(stroke) ?? false;
                            return (
                              <button
                                key={stroke}
                                type="button"
                                onClick={() => {
                                  const current = (profile.studentInfo?.swimmingProfile as any)?.mainStrokes ?? [];
                                  const next = isSelected
                                    ? current.filter((s: string) => s !== stroke)
                                    : [...current, stroke];
                                  handleSwimmingProfileChange('mainStrokes', next.length > 0 ? next : undefined);
                                }}
                                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                              >
                                {labels[stroke]}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-slate-500">주로 사용하는 영법을 선택하세요 (복수 선택 가능)</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">선호 영법 (좋아하는 영법)</label>
                        <div className="flex flex-wrap gap-2">
                          {['freestyle', 'backstroke', 'breaststroke', 'butterfly'].map((stroke) => {
                            const labels: Record<string, string> = {
                              freestyle: '🏊 자유형',
                              backstroke: '🏊‍♂️ 배영',
                              breaststroke: '🤿 평영',
                              butterfly: '🦋 접영'
                            };
                            const isSelected = (profile.studentInfo?.swimmingProfile as any)?.preferredStrokes?.includes(stroke) ?? false;
                            return (
                              <button
                                key={stroke}
                                type="button"
                                onClick={() => {
                                  const current = (profile.studentInfo?.swimmingProfile as any)?.preferredStrokes ?? [];
                                  const next = isSelected
                                    ? current.filter((s: string) => s !== stroke)
                                    : [...current, stroke];
                                  handleSwimmingProfileChange('preferredStrokes', next.length > 0 ? next : undefined);
                                }}
                                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                              >
                                {labels[stroke]}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-slate-500">좋아하거나 선호하는 영법을 선택하세요 (복수 선택 가능)</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">회피 영법 (피하고 싶은 영법)</label>
                        <div className="flex flex-wrap gap-2">
                          {['freestyle', 'backstroke', 'breaststroke', 'butterfly'].map((stroke) => {
                            const labels: Record<string, string> = {
                              freestyle: '🏊 자유형',
                              backstroke: '🏊‍♂️ 배영',
                              breaststroke: '🤿 평영',
                              butterfly: '🦋 접영'
                            };
                            const isSelected = (profile.studentInfo?.swimmingProfile as any)?.excludedStrokes?.includes(stroke) ?? false;
                            return (
                              <button
                                key={stroke}
                                type="button"
                                onClick={() => {
                                  const current = (profile.studentInfo?.swimmingProfile as any)?.excludedStrokes ?? [];
                                  const next = isSelected
                                    ? current.filter((s: string) => s !== stroke)
                                    : [...current, stroke];
                                  handleSwimmingProfileChange('excludedStrokes', next.length > 0 ? next : undefined);
                                }}
                                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                              >
                                {labels[stroke]}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-slate-500">부상이나 건강상의 이유로 피하고 싶은 영법을 선택하세요 (복수 선택 가능)</p>
                      </div>
                    </div>
                  </div>

                  {/* 질환·특수상황 선택 (회원가입과 동일한 UI) */}
                  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">질환·특수상황 선택</h3>
                        <p className="text-xs text-gray-500">
                          수영 엔진의 안전 조정을 위해 해당되는 질환이나 특수상황을 선택해주세요.
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        선택됨: <strong className="text-blue-600">{(profile.studentInfo?.swimmingProfile as any)?.conditionIds?.length || 0}</strong>개
                      </span>
                    </div>
                    <ConditionQuickPick
                      value={(profile.studentInfo?.swimmingProfile as any)?.conditionIds || []}
                      onChange={(ids) => handleSwimmingProfileChange('conditionIds', ids.length > 0 ? ids : undefined)}
                    />
                    <p className="text-xs text-gray-500">
                      선택된 항목은 프로그램 생성 시 자동으로 반영됩니다.
                    </p>
                  </div>

                  {/* 건강 메모 */}
                  <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <h4 className="text-sm font-semibold text-slate-800">건강 메모</h4>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="student-medical">
                        건강 관련 메모
                      </label>
                      <Textarea
                        id="student-medical"
                        value={profile.studentInfo?.medicalConditions ?? ''}
                        placeholder="알레르기, 주의해야 할 사항 등을 입력하세요."
                        className="min-h-[96px]"
                        onChange={(event) => handleStudentInfoChange('medicalConditions', event.target.value)}
                      />
                      <p className="text-xs text-slate-500">
                        응급 연락처와 건강 관련 메모는 담당 강사와 관리자에게 공유됩니다.
                      </p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {profile.userType === 'instructor' && (
              <>
                <Separator />
                <section className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">강사 전문 정보</h3>
                    <p className="text-sm text-slate-500">
                      강의 경력과 레벨은 센터 관리자 또는 최고 관리자에게 요청해 주세요. 자격증 정보는 아래에서 직접 관리할 수 있습니다.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="instructor-experience">
                        강의 경력
                      </label>
                      <Input
                        id="instructor-experience"
                        value={profile.instructorInfo?.experience ?? ''}
                        placeholder="예: 5년 / 선수 육성 전문"
                        disabled
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="instructor-level">
                        강사 레벨
                      </label>
                      <Input
                        id="instructor-level"
                        value={profile.instructorInfo?.instructorLevel ?? ''}
                        placeholder="junior / senior / master"
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="instructor-certifications">
                      보유 자격증 (자동 요약)
                    </label>
                    <Textarea
                      id="instructor-certifications"
                      value={profile.instructorInfo?.certifications?.join(', ') ?? ''}
                      placeholder="저장 시 자격증 이름이 자동으로 반영됩니다."
                      className="min-h-[72px] bg-slate-50"
                      readOnly
                    />
                    <p className="text-xs text-slate-500">
                      아래 상세 정보를 저장하면 자격증 이름이 자동으로 업데이트됩니다.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="instructor-specialties">
                      전문 종목 (쉼표로 구분)
                    </label>
                    <Textarea
                      id="instructor-specialties"
                      value={specialtiesText}
                      placeholder="예: 자유형, 접영, 주니어 레이싱"
                      className="min-h-[72px]"
                      onChange={(event) => handleSpecialtiesTextChange(event.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      쉼표로 구분하여 입력하면 자동으로 리스트로 저장됩니다.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">자격증 상세 정보</p>
                        <p className="text-xs text-slate-500">
                          회원가입 시 사용했던 자격증 입력 폼과 동일하게 정보를 추가·수정할 수 있습니다.
                        </p>
                      </div>
                      <Button type="button" size="sm" variant="secondary" onClick={handleAddCertificate}>
                        + 자격증 추가
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {certificateList.map((cert, index) => (
                        <div
                          key={`certificate-${index}`}
                          className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-700">자격증 #{index + 1}</p>
                            {certificateList.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleRemoveCertificate(index)}
                              >
                                제거
                              </Button>
                            )}
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-600">자격증 이름</label>
                              <Input
                                value={cert.name}
                                placeholder="예: 생활체육지도자 수영 2급"
                                onChange={(event) =>
                                  handleCertificateChange(index, 'name', event.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-600">발급 기관</label>
                              <Input
                                value={cert.issuer}
                                placeholder="예: 대한수영연맹"
                                onChange={(event) =>
                                  handleCertificateChange(index, 'issuer', event.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-600">자격증 번호</label>
                              <Input
                                value={cert.certificateNumber}
                                placeholder="예: SW-2024-12345"
                                onChange={(event) =>
                                  handleCertificateChange(
                                    index,
                                    'certificateNumber',
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-600">취득일</label>
                              <Input
                                type="date"
                                value={cert.acquiredDate}
                                onChange={(event) =>
                                  handleCertificateChange(index, 'acquiredDate', event.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="instructor-bio">
                      소개 글
                    </label>
                    <Textarea
                      id="instructor-bio"
                      value={bioText}
                      placeholder="수강생에게 전하고 싶은 메시지를 작성하세요."
                      className="min-h-[96px]"
                      onChange={(event) => handleBioChange(event.target.value)}
                    />
                    <p className="text-xs text-slate-500">자기소개는 학생과 센터 관리자에게 노출됩니다.</p>
                  </div>
                </section>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <div className="text-sm text-slate-500">
              마지막 업데이트 · {formatDate(profile.updatedAt)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={saving || !isDirty}
              >
                변경 취소
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveProfile}
                disabled={saving || !isDirty}
              >
                {saving ? '저장 중...' : '프로필 저장'}
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>계정 스냅샷</CardTitle>
              <CardDescription>역할, 멤버십, 인증 상태를 한눈에 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">사용자 ID</span>
                <span>{profile.userId || profile._id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">계정 유형</span>
                <span>{roleLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">멤버십</span>
                <span>{profile.membershipTier || '일반'}</span>
              </div>
              {profile.userType === 'instructor' && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">퀴즈 기반 자격</span>
                  <span>
                    {profile.instructorInfo?.certifications?.length
                      ? `${profile.instructorInfo.certifications.length}건`
                      : '등록 필요'}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">등록일</span>
                <span>{formatDate(profile.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">마지막 로그인</span>
                <span>{formatDate(profile.lastLoginAt)}</span>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100">
              <Link
                href="/membership"
                className="inline-flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <span>멤버십 및 결제 이력 살펴보기</span>
                <Calendar className="h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>접근 권한</CardTitle>
              <CardDescription>현재 계정으로 사용할 수 있는 서비스 목록입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {accessList.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  활성화된 접근 권한이 없습니다. 관리자에게 문의해주세요.
                </div>
              ) : (
                <ul className="space-y-3">
                  {accessList.map(([key]) => (
                    <li
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      <span className="font-medium">
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^\w/, (char) => char.toUpperCase())}
                      </span>
                      <Badge variant="success" size="sm">
                        사용 가능
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {profile.userType === 'student' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>학습 진행 요약</CardTitle>
              <CardDescription>레벨과 강의 이력, 담당 강사를 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                  <p className="text-xs font-medium uppercase text-slate-500">현재 레벨</p>
                  <p className="text-base font-semibold text-slate-900">
                    {studentLevel || '미등록'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                  <p className="text-xs font-medium uppercase text-slate-500">총 수강 강의</p>
                  <p className="text-base font-semibold text-slate-900">
                    {profile.studentInfo?.enrolledCourses?.length ?? 0}개
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">담당 강사</p>
                    <p className="text-xs text-slate-500">
                      센터 관리자에게 연결된 강사가 표시됩니다.
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-600">
                  {profile.studentInfo?.instructorId
                    ? `강사 ID: ${profile.studentInfo.instructorId}`
                    : '담당 강사가 아직 배정되지 않았습니다.'}
                </div>
              </div>
              <Link
                href="/health/input"
                className="inline-flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                건강 데이터 업데이트하러 가기
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>건강 프로필</CardTitle>
              <CardDescription>회원가입 시 입력한 건강 정보를 확인하고 수정할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              {healthBadges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {healthBadges.map(({ label, value, icon }) => (
                    <Badge key={label} variant="secondary" size="sm" className="gap-1">
                      {icon}
                      <span>{label}</span>
                      <span className="font-semibold text-slate-900">{value}</span>
                    </Badge>
                  ))}
                </div>
              ) : Object.keys(healthProfile).length > 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-6">
                  <p className="text-sm font-semibold text-slate-700 mb-2">등록된 건강 정보</p>
                  <p className="text-xs text-slate-600">
                    건강 프로필이 등록되어 있지만 표시할 수 있는 기본 지표(키, 체중, BMI 등)가 없습니다.
                    <br />
                    아래에서 건강 정보를 수정하거나 건강 입력 페이지에서 기본 정보를 추가해주세요.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
                  등록된 건강 지표가 없습니다. 아래에서 건강 정보를 입력하거나 건강 입력 페이지에서 정보를 추가해주세요.
                </div>
              )}
              {/* 만성 질환 정보 */}
              {Array.isArray((healthProfile as any)?.chronicConditions) &&
                (healthProfile as any).chronicConditions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">만성 질환</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(healthProfile as any).chronicConditions.map((item: string) => (
                        <Badge key={item} variant="outline" size="sm" className="text-red-600 border-red-300">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              
              {/* 수영 관련 건강 상태 상세 표시 */}
              {(healthProfile as any)?.swimmingRelatedConditions && (
                (() => {
                  const conditions = (healthProfile as any).swimmingRelatedConditions;
                  const activeConditions = Object.entries(conditions)
                    .filter(([_, v]: [string, any]) => v === true)
                    .map(([k]: [string, any]) => {
                      const labels: Record<string, string> = {
                        cardiovascular: '심장 질환',
                        respiratory: '호흡기 질환',
                        musculoskeletal: '근골격계 질환',
                        diabetes: '당뇨',
                        hypertension: '고혈압',
                        asthma: '천식'
                      };
                      return labels[k] || k;
                    });
                  
                  if (activeConditions.length > 0) {
                    return (
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">수영 관련 건강 상태</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {activeConditions.map((item: string) => (
                            <Badge key={item} variant="outline" size="sm" className="text-orange-600 border-orange-300">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()
              )}
              
              {/* 기타 건강질환 (other 필드) */}
              {Array.isArray((healthProfile as any)?.swimmingRelatedConditions?.other) &&
                (healthProfile as any).swimmingRelatedConditions.other.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">기타 건강 상태</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(healthProfile as any).swimmingRelatedConditions.other.map((item: string) => (
                        <Badge key={item} variant="outline" size="sm" className="text-orange-600 border-orange-300">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              
              {/* 복용 중인 약물 */}
              {Array.isArray((healthProfile as any)?.medications) &&
                (healthProfile as any).medications.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">복용 중인 약물</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(healthProfile as any).medications.map((item: string) => (
                        <Badge key={item} variant="outline" size="sm" className="text-purple-600 border-purple-300">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              
              {Array.isArray((healthProfile as any)?.allergies) &&
                (healthProfile as any).allergies.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">알레르기</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(healthProfile as any).allergies.map((item: string) => (
                        <Badge key={item} variant="outline" size="sm" className="text-slate-600">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {Array.isArray((healthProfile as any)?.fitnessGoals) &&
                (healthProfile as any).fitnessGoals.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">목표</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(healthProfile as any).fitnessGoals.map((item: string) => (
                        <Badge key={item} variant="success" size="sm" className="text-white/90">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              
              {/* 건강 정보 수정 링크 */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Link
                  href="/health/input"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  건강 정보 수정하기
                </Link>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  건강 입력 페이지에서 모든 건강 정보를 확인하고 수정할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {profile.userType === 'instructor' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>강사 활동 현황</CardTitle>
              <CardDescription>배정된 센터와 수강생 현황을 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                  <p className="text-xs font-medium uppercase text-slate-500">강사 레벨</p>
                  <p className="text-base font-semibold text-slate-900">
                    {instructorLevel || '미등록'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                  <p className="text-xs font-medium uppercase text-slate-500">담당 수강생</p>
                  <p className="text-base font-semibold text-slate-900">
                    {profile.instructorInfo?.currentStudents ?? 0}명
                    {profile.instructorInfo?.maxStudents
                      ? ` / ${profile.instructorInfo.maxStudents}명`
                      : ''}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">전문 분야 & 자격</p>
                    <p className="text-xs text-slate-500">
                      유료 강사 콘텐츠(퀴즈, 3D 뷰어 등)에 활용됩니다.
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 px-3 py-2">
                    <p className="text-xs font-medium text-slate-500">전문 분야</p>
                    <p className="text-sm text-slate-700">
                      {profile.instructorInfo?.specialties?.length
                        ? profile.instructorInfo.specialties.join(', ')
                        : '등록된 전문 분야가 없습니다.'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 px-3 py-2">
                    <p className="text-xs font-medium text-slate-500">보유 자격증</p>
                    <p className="text-sm text-slate-700">
                      {profile.instructorInfo?.certifications?.length
                        ? profile.instructorInfo.certifications.join(', ')
                        : '등록된 자격증이 없습니다.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>센터 배정 정보</CardTitle>
              <CardDescription>연결된 센터와 연락 채널을 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <MapPin className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">배정 센터</p>
                  <p className="text-sm font-medium text-slate-900">
                    {profile.instructorInfo?.assignedCenters?.length
                      ? `${profile.instructorInfo.assignedCenters.length}곳`
                      : '연결된 센터가 없습니다.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <Phone className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">연락처</p>
                  <p className="text-sm font-medium text-slate-900">{profile.phone || '미등록'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <Mail className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">이메일</p>
                  <p className="text-sm font-medium text-slate-900">{profile.email}</p>
                </div>
              </div>
              <Link
                href="/instructor/dashboard"
                className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                강사 대시보드로 이동
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {(profile.userType === 'centerAdmin' || profile.userType === 'center-admin') && (
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>센터 관리자 정보</CardTitle>
            <CardDescription>센터 운영 권한과 담당 센터를 관리하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">관리 레벨</p>
                <p className="text-sm font-medium text-slate-900">
                  {profile.centerAdminInfo?.adminLevel || '미등록'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">관리 센터 수</p>
                <p className="text-sm font-medium text-slate-900">
                  {profile.centerAdminInfo?.managedCenters?.length ?? 0}곳
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">권한</p>
                <p className="text-sm font-medium text-slate-900">
                  {(profile.centerAdminInfo?.permissions &&
                    Object.entries(profile.centerAdminInfo.permissions)
                      .filter(([, allowed]) => allowed)
                      .length) ??
                    0}
                  개 활성화
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {profile.userType === 'superAdmin' && (
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>최고 관리자 권한 요약</CardTitle>
            <CardDescription>시스템 전반에서 활성화된 권한을 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {(profile.superAdminInfo?.systemPermissions &&
              Object.entries(profile.superAdminInfo.systemPermissions).map(([key, allowed]) => (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
                >
                  <Shield className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^\w/, (char) => char.toUpperCase())}
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {allowed ? '사용 가능' : '비활성'}
                    </p>
                  </div>
                </div>
              ))) || (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
                활성화된 시스템 권한이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-sm text-slate-500">
        <div className="flex items-start gap-3">
          <Info className="mt-1 h-4 w-4 text-slate-400" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-700">프로필 사용 가이드</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>프로필 변경 사항은 즉시 저장되며, 로그아웃 후에도 유지됩니다.</li>
              <li>
                강사는 퀴즈 기반 자격을 최신 상태로 유지하여 유료 콘텐츠(퀴즈, 3D 뷰어)를 사용할 수
                있습니다.
              </li>
              <li>학생 건강 데이터는 맞춤 수영 계획과 승급 추천에 활용됩니다.</li>
              <li>센터 관리자와 최고 관리자는 권한 변경 시 팀과 공유해주세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


